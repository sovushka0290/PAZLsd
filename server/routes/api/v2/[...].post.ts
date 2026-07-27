import { defineEventHandler, readBody, getRequestURL, proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  if (!config.apiSnapshot) {
    const backendBase = config.apiBackendUrl || config.public.apiBaseUrl || 'http://backend:8000'
    const target = `${backendBase.replace(/\/$/, '')}${event.path}`
    return proxyRequest(event, target)
  }

  const u = new URL(getRequestURL(event).href)
  const pathname = u.pathname
  const body = await readBody(event).catch(() => ({}))

  // 1. POST /api/v2/auth/register/
  if (pathname.endsWith('/auth/register/')) {
    const user = {
      id: Date.now(),
      phone: body?.phone || '+7 (707) 123-45-67',
      first_name: body?.first_name || 'Покупатель',
      last_name: body?.last_name || '',
      email: body?.email || 'buyer@pazl.kz',
      role: 'buyer',
      phone_confirmed: true
    }
    return {
      access: 'mock_jwt_access_token_' + Date.now(),
      refresh: 'mock_jwt_refresh_token_' + Date.now(),
      user
    }
  }

  // 2. POST /api/v2/auth/register-supplier/
  if (pathname.endsWith('/auth/register-supplier/')) {
    const user = {
      id: Date.now(),
      phone: body?.phone || '+7 (707) 999-88-77',
      first_name: body?.company_name || 'Поставщик',
      last_name: '',
      email: 'supplier@pazl.kz',
      role: 'supplier',
      company_name: body?.company_name || 'ТОО Поставщик',
      company_bin: body?.bin || '123456789012',
      phone_confirmed: true
    }
    return {
      access: 'mock_jwt_access_token_' + Date.now(),
      refresh: 'mock_jwt_refresh_token_' + Date.now(),
      user
    }
  }

  // 3. POST /api/v2/auth/phone-login/
  if (pathname.endsWith('/auth/phone-login/')) {
    const isSupplier = body?.phone?.includes('88') || body?.phone?.includes('supplier')
    const user = {
      id: Date.now(),
      phone: body?.phone || '+7 (707) 123-45-67',
      first_name: isSupplier ? 'ТОО «Стома Поставщик»' : 'Доктор Аскар',
      last_name: '',
      email: 'user@pazl.kz',
      role: isSupplier ? 'supplier' : 'buyer',
      phone_confirmed: true
    }
    return {
      access: 'mock_jwt_access_token_' + Date.now(),
      refresh: 'mock_jwt_refresh_token_' + Date.now(),
      user
    }
  }

  return { success: true }
})
