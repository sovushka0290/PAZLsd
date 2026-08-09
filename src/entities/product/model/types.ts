export type AppLocaleCode = 'kk' | 'ru' | 'en'

export interface ProductViewModel {
  id: number
  /** Category slug from the marketplace filter (or synthetic id for grouped views). */
  categoryId: string
  /** Resolved label for UI (from API). */
  categoryName: string
  /** Subcategory name */
  subcategory?: string
  /** `null` when the backend has no price in modifications / measure_prices. */
  price: number | null
  /** Max price if range exists */
  maxPrice?: number | null
  /** ISO 4217 from the winning price row (e.g. `KZT`). */
  currencyCode: string | null
  name: string
  description: string
  /** SKU / Article number */
  sku?: string
  /** Brand or Manufacturer name */
  manufacturer?: string
  /** Country of origin */
  country?: string
  /** Unit of measurement */
  unit?: string
  /** Shelf life / warranty */
  shelfLife?: string
  /** Registration number */
  regNumber?: string
  /** Number of suppliers */
  supplierCount?: number
  /** Stock quantity */
  stock?: number
  /** Marketing badges like New, Hit, Sale */
  stickers?: string[]
}

export interface CartLine extends ProductViewModel {
  quantity: number
}
