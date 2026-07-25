import crypto from 'crypto'
import { defineEventHandler, readBody, getHeader, setResponseStatus } from 'h3'

// BOT_TOKEN must be set in env — used both for initData validation and forwarding
const BOT_TOKEN = process.env.BOT_TOKEN || ''
// BOT_API_URL — the internal URL of the Telegram bot's HTTP sync endpoint
const BOT_API_URL = process.env.BOT_API_URL || 'http://bot:8080/api/sync-cart'

interface CartSyncItem {
  product_id: string
  quantity: number
}

interface CartSyncBody {
  items: CartSyncItem[]
  action?: string
}

function validateTelegramInitData(initData: string, botToken: string): { isValid: boolean; user?: any } {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return { isValid: false }

    // Parse user first regardless of validation so we can use it in dev mode
    const userStr = params.get('user')
    const user = userStr ? JSON.parse(userStr) : undefined

    if (!botToken) {
      console.warn('[sync-cart] BOT_TOKEN not set — cannot validate initData')
      return { isValid: false, user }
    }

    const keys = Array.from(params.keys()).filter(k => k !== 'hash').sort()
    const dataCheckString = keys.map(k => `${k}=${params.get(k)}`).join('\n')

    // Per Telegram Bot API docs: secret_key = HMAC_SHA256("WebAppData", bot_token)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (calculatedHash !== hash) {
      console.warn('[sync-cart] initData hash mismatch')
      return { isValid: false, user }
    }

    return { isValid: true, user }
  } catch (e) {
    console.error('[sync-cart] Error validating initData:', e)
    return { isValid: false }
  }
}

export default defineEventHandler(async (event) => {
  const initData = getHeader(event, 'x-telegram-init-data')
  if (!initData) {
    setResponseStatus(event, 401)
    return { ok: false, error: 'Unauthorized: Missing Telegram initData' }
  }

  const { isValid, user } = validateTelegramInitData(initData, BOT_TOKEN)
  if (!isValid || !user?.id) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[sync-cart] Telegram initData verification failed — bypassing in development mode.')
    } else {
      console.error('[sync-cart] Telegram initData verification failed in production. isValid:', isValid, 'user:', user?.id)
      setResponseStatus(event, 401)
      return { ok: false, error: 'Unauthorized: Invalid Telegram signature' }
    }
  }

  const tgUserId = user?.id
  if (!tgUserId) {
    console.error('[sync-cart] Could not extract user ID from initData')
    setResponseStatus(event, 400)
    return { ok: false, error: 'Missing Telegram user ID' }
  }

  const body = await readBody<CartSyncBody>(event)

  try {
    console.log(`[sync-cart] Forwarding cart sync for user ${tgUserId} (${body.items?.length || 0} items, action=${body.action || 'none'}) to ${BOT_API_URL}`)
    
    const response = await $fetch<{ ok: boolean; error?: string }>(BOT_API_URL, {
      method: 'POST',
      body: {
        user_id: tgUserId,
        items: body.items || [],
        action: body.action || ''
      }
    })

    console.log(`[sync-cart] Bot response: ok=${response.ok}`)
    return { ok: response.ok, error: response.error }
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e)
    console.error(`[sync-cart] Error forwarding sync to bot at ${BOT_API_URL}: ${errMsg}`)
    setResponseStatus(event, 502)
    return { ok: false, error: `Failed to connect to Bot API: ${errMsg}` }
  }
})
