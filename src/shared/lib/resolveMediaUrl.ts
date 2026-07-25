/**
 * Rewrites media URLs so they point to the R2 CDN (media.pazl-ai.com)
 * instead of the Django backend.
 *
 * Handles several formats coming from the API:
 *   - Absolute:  "http://127.0.0.1:8000/media/products/42/img.jpg"
 *   - Relative:  "/media/products/42/img.jpg"
 *   - Already correct: "https://media.pazl-ai.com/media/products/42/img.jpg"
 */
export function resolveMediaUrl(raw: string | null | undefined): string | null {
  if (!raw) return null

  const mediaIdx = raw.indexOf('/media/')
  if (mediaIdx === -1) return raw // no /media/ segment – return as-is

  const mediaPath = raw.slice(mediaIdx) // e.g. "/media/products/42/img.jpg"

  let mediaBase = ''
  try {
    const config = useRuntimeConfig()
    mediaBase = (config.public.mediaBaseUrl as string) ?? ''
  } catch (e) {
    // Nuxt instance context might be unavailable after async await in SSR
  }

  // If no CDN is configured, return relative path to prevent mixed content (HTTP vs HTTPS) issues
  if (!mediaBase) return mediaPath

  // Already pointing at the CDN
  if (raw.startsWith(mediaBase)) return raw

  // Do not rewrite local scraped images
  if (raw.includes('/media/scraped/')) return raw

  return `${mediaBase.replace(/\/$/, '')}${mediaPath}`
}
