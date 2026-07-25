/**
 * Снимок GET-ответов /api/v{version}/ c бэкенда (отдельные JSON + manifest).
 *
 *   API_SNAPSHOT_BASE_URL=http://localhost:8000 NUXT_PUBLIC_API_TOKEN=… npm run api-snapshot
 *
 * Env:
 *   API_SNAPSHOT_BASE_URL — без trailing slash, по умолчанию http://localhost:8000
 *   NUXT_PUBLIC_API_VERSION — v2
 *   NUXT_PUBLIC_API_TOKEN — опционально
 *   API_SNAPSHOT_MAX_PRODUCT_RETRIEVES — лимит GET products/{id}/ (по умолч. 5000)
 *   API_SNAPSHOT_REQUEST_DELAY_MS — пауза между запросами (по умолч. 40)
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSnapshotLookupKey, type ApiSnapshotManifest } from '../lib/snapshot-lookup'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'data', 'api-snapshot')
const FILES = join(OUT, 'files')

const baseUrl = (process.env.API_SNAPSHOT_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')
const version = (process.env.NUXT_PUBLIC_API_VERSION ?? 'v2').replace(/^\/|\/$/g, '')
const token = String(process.env.NUXT_PUBLIC_API_TOKEN ?? '').trim()
const maxProductRetrieves = Math.max(0, Number.parseInt(process.env.API_SNAPSHOT_MAX_PRODUCT_RETRIEVES ?? '5000', 10) || 5000)
const delayMs = Math.max(0, Number.parseInt(process.env.API_SNAPSHOT_REQUEST_DELAY_MS ?? '40', 10) || 40)
const defaultAcceptLang = 'ru, ru-RU;q=0.9, en;q=0.5'

const apiV2 = `${baseUrl}/api/${version}`

const seenKey = new Set<string>()
const seenUrl = new Set<string>()
const queue: { url: string, method: string }[] = []

let manifest: ApiSnapshotManifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  baseUrl,
  index: {}
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    'Accept': 'application/json',
    'Accept-Language': defaultAcceptLang,
    'Host': 'pazl.store'
  }
  if (token) h.Authorization = `Token ${token}`
  return h
}

async function sleep(): Promise<void> {
  if (delayMs) await new Promise(r => setTimeout(r, delayMs))
}

function relPathForKey(key: string): string {
  const h = createHash('sha256').update(key, 'utf8').digest('hex')
  return join('files', h.slice(0, 2), `${h}.json`)
}

function openApiV2Path(pathFromSchema: string): string {
  const p = pathFromSchema.replace(/\/$/, '')
  if (p.startsWith('/api/')) {
    return `${baseUrl}${p}/`
  }
  const tail = p.replace(/^\//, '')
  return `${apiV2}/${tail}/`
}

function isTemplate(p: string): boolean {
  return p.includes('{')
}

/**
 * OpenAPI: paths; учитываем только GET, без {…} (шаблоны — отдельные проходы).
 */
function collectStaticGetPathsFromSchema(schema: Record<string, unknown>): string[] {
  const out = new Set<string>()
  const paths = (schema as { paths?: Record<string, unknown> }).paths
  if (!paths || typeof paths !== 'object') return [...out]
  for (const [p, methods] of Object.entries(paths)) {
    if (isTemplate(p)) continue
    if (!methods || typeof methods !== 'object') continue
    const g = (methods as { get?: unknown }).get
    if (g) out.add(openApiV2Path(p))
  }
  return [...out]
}

function extractCategorySlugsFromRoot(json: unknown): string[] {
  if (!json || typeof json !== 'object') return []
  const r = (json as { results?: unknown[] }).results
  if (!Array.isArray(r)) return []
  return r
    .map(c => (c && typeof c === 'object' ? (c as { slug?: string }).slug : undefined))
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
}

function shouldCollectProductIdsFromList(lookupKey: string): boolean {
  if (lookupKey.includes('products_detailed')) return true
  if (/\/v2\/categories(\?|\/$)/.test(lookupKey) && !lookupKey.includes('products_detailed')) {
    return false
  }
  if (lookupKey.includes('/categories/') && !lookupKey.includes('products_detailed')) {
    return false
  }
  return /\/v2\/products[/?]/.test(lookupKey)
}

function collectProductIdsFromListPayload(json: unknown, into: Set<number>): void {
  if (!json || typeof json !== 'object') return
  const r = (json as { results?: unknown[] }).results
  if (!Array.isArray(r)) return
  for (const it of r) {
    if (it && typeof it === 'object' && typeof (it as { id?: unknown }).id === 'number') {
      const id = (it as { id: number }).id
      if (Number.isInteger(id) && id > 0) into.add(id)
    }
  }
}

function enqueue(url: string, method = 'GET'): void {
  const u = url.trim()
  if (!u || seenUrl.has(u)) return
  seenUrl.add(u)
  queue.push({ url: u, method })
}

async function saveResponse(key: string, bodyText: string): Promise<void> {
  const rel = relPathForKey(key)
  const abs = join(OUT, rel)
  await mkdir(dirname(abs), { recursive: true })
  await writeFile(abs, bodyText, 'utf8')
  manifest.index[key] = rel
}

/**
 * DRF: следующая страница.
 */
function enqueueNextIfAny(data: unknown): void {
  if (!data || typeof data !== 'object') return
  const next = (data as { next?: string | null }).next
  if (typeof next === 'string' && next.startsWith('http')) {
    enqueue(next, 'GET')
  }
}

async function fetchAndRecord(url: string, method: string): Promise<void> {
  if (method !== 'GET') return
  await sleep()
  const res = await fetch(url, { method, headers: headers() })
  const finalUrl = res.url
  const u = new URL(finalUrl)
  const key = buildSnapshotLookupKey({
    method: 'GET',
    pathname: u.pathname,
    search: u.search
  })
  if (seenKey.has(key)) return
  seenKey.add(key)
  if (!res.ok) {
    console.warn(`[api-snapshot] ${res.status} ${key.slice(0, 200)}…`)
    return
  }
  const text = await res.text()
  if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
    console.warn(`[api-snapshot] skip non-JSON: ${key.slice(0, 120)}…`)
    return
  }
  await saveResponse(key, text)
  let data: unknown
  try {
    data = JSON.parse(text) as unknown
  } catch {
    return
  }
  enqueueNextIfAny(data)
}

async function main(): Promise<void> {
  await mkdir(FILES, { recursive: true })
  console.log(`[api-snapshot] base: ${baseUrl} → ${apiV2}/`)

  const schemaUrl = `${apiV2}/schema/`
  const schemaRes = await fetch(schemaUrl, { headers: headers() })
  if (!schemaRes.ok) {
    throw new Error(`schema ${schemaRes.status} ${schemaUrl}`)
  }
  const schemaText = await schemaRes.text()
  await writeFile(join(OUT, 'openapi-v2-schema.json'), schemaText, 'utf8')
  const schema = JSON.parse(schemaText) as Record<string, unknown>

  const staticGetPaths = collectStaticGetPathsFromSchema(schema)
  for (const u of staticGetPaths) {
    enqueue(u, 'GET')
  }

  // Каталог витрины (как в Nuxt) — в schema могут называться иначе, добавляем явно
  enqueue(`${apiV2}/categories/root/`, 'GET')

  const productIds = new Set<number>()

  while (queue.length) {
    const { url, method } = queue.shift()!
    await fetchAndRecord(url, method)
  }

  // products_detailed по корневым slug (пагинация — через next в fetchAndRecord)
  const rootKey = buildSnapshotLookupKey({
    method: 'GET',
    pathname: new URL(`${apiV2}/categories/root/`).pathname,
    search: ''
  })
  const rootFile = manifest.index[rootKey] ? await readFile(join(OUT, manifest.index[rootKey]), 'utf8') : null
  if (rootFile) {
    const slugs = extractCategorySlugsFromRoot(JSON.parse(rootFile) as object)
    /** Как `MarketplaceCatalog` loadMergedFromRoots: pageSize 20, perRoot = ceil(20 / N) */
    const catalogPageSize = 20
    const perRoot = slugs.length > 0
      ? Math.max(1, Math.ceil(catalogPageSize / slugs.length))
      : 1
    for (const slug of slugs) {
      enqueue(
        `${apiV2}/categories/${encodeURIComponent(slug)}/products_detailed/?page=1&page_size=20`,
        'GET'
      )
      if (perRoot !== 20) {
        enqueue(
          `${apiV2}/categories/${encodeURIComponent(slug)}/products_detailed/?page=1&page_size=${perRoot}`,
          'GET'
        )
      }
    }
  }

  // повтор BFS: очередь снова с next-цепочками
  while (queue.length) {
    const { url, method } = queue.shift()!
    await fetchAndRecord(url, method)
  }

  // product id из list-эндпойнтов (не из списка категорий)
  for (const [lookupKey, rel] of Object.entries(manifest.index)) {
    if (!shouldCollectProductIdsFromList(lookupKey)) continue
    const text = await readFile(join(OUT, rel), 'utf8')
    try {
      collectProductIdsFromListPayload(JSON.parse(text) as object, productIds)
    } catch {
      /* */
    }
  }

  // GET products/{id}/ если есть в schema
  const checkPaths = (schema as { paths?: Record<string, { get?: unknown }> }).paths ?? {}
  const hasProductRetrieve = Object.keys(checkPaths).some(
    p => p.includes('products/') && p.includes('{') && checkPaths[p]?.get
  )
  if (hasProductRetrieve && maxProductRetrieves > 0) {
    const ids = [...productIds].sort((a, b) => a - b)
    const n = Math.min(ids.length, maxProductRetrieves)
    console.log(`[api-snapshot] products/ retrieve: ${n} of ${ids.length} ids (cap ${maxProductRetrieves})`)
    for (let i = 0; i < n; i++) {
      enqueue(`${apiV2}/products/${ids[i]!}/`, 'GET')
    }
  }

  while (queue.length) {
    const { url, method } = queue.shift()!
    await fetchAndRecord(url, method)
  }

  manifest = { ...manifest, generatedAt: new Date().toISOString() }
  await writeFile(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  const count = Object.keys(manifest.index).length
  console.log(`[api-snapshot] done: ${count} keys → data/api-snapshot/ (manifest + files/)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
