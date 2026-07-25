export type AppLocaleCode = 'kk' | 'ru' | 'en'

export interface ProductViewModel {
  id: number
  /** Category slug from the marketplace filter (or synthetic id for grouped views). */
  categoryId: string
  /** Resolved label for UI (from API). */
  categoryName: string
  /** `null` when the backend has no price in modifications / measure_prices. */
  price: number | null
  /** ISO 4217 from the winning price row (e.g. `KZT`). */
  currencyCode: string | null
  image: string
  name: string
  description: string
  /** Brand or Manufacturer name */
  brand?: string
  /** Marketing badges like New, Hit, Sale */
  stickers?: string[]
}

export interface CartLine extends ProductViewModel {
  quantity: number
}
