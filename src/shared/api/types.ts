/** Paginated list shape from Django REST framework. */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiCategory {
  id: number
  slug: string
  name: string
  parent: number | null
  products_count?: number
  hidden?: boolean
}

export interface ApiCompactCategoryResponse {
  fields: string[]
  result: [number, number | null, number, string][]
}

export interface ApiProductImage {
  id: number
  image: string | null
  is_base?: boolean
}

export interface ApiProductPrice {
  currency_price?: number | null
  original_currency_price?: number | null
  currency?: string
  price_type?: string
  is_default?: boolean
}

export interface ApiProductModification {
  id: number
  name?: string
  prices?: ApiProductPrice[]
}

export interface ApiProductDetailed {
  id: number
  name: string
  code?: string
  description?: string
  category?: number
  category_detail?: { id: number, name: string }
  images?: ApiProductImage[]
  modifications?: ApiProductModification[]
  measure_prices?: unknown[]
}
