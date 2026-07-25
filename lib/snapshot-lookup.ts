/**
 * Нормализация path + query для ключа в manifest (один и тот же алгоритм в скрипте и в Nitro).
 */
export function normalizePathnameForSnapshot(pathname: string): string {
  let p = pathname || '/'
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

/**
 * @param method — верхний регистр, например GET
 * @param pathname — начинается с /, без ?query
 * @param search — допустимо «?a=1» или «a=1» или пусто
 */
export function buildSnapshotLookupKey(input: { method: string, pathname: string, search: string }): string {
  const method = String(input.method || 'GET').toUpperCase()
  const pathname = normalizePathnameForSnapshot(input.pathname)
  const raw = input.search || ''
  const withQ = raw.startsWith('?') ? raw : raw ? `?${raw}` : ''
  const q = new URLSearchParams(withQ.slice(1))
  const sorted = new URLSearchParams()
  for (const [k, v] of [...q.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    sorted.append(k, v)
  }
  const qs = sorted.toString()
  return `${method} ${pathname}${qs ? `?${qs}` : ''}`
}

export interface ApiSnapshotManifest {
  version: 1
  generatedAt: string
  baseUrl: string
  index: Record<string, string>
}
