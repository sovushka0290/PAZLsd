/** ISO 4217 → display symbol for storefront UI. */
const ISO_TO_SYMBOL: Record<string, string> = {
  KZT: '₸',
  RUB: '₽',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥'
}

export function currencySymbol(iso: string | null | undefined): string {
  if (!iso) {
    return '₸'
  }
  const key = iso.trim().toUpperCase()
  return ISO_TO_SYMBOL[key] ?? key
}
