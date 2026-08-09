import type { ApiProductDetailed } from '@fsd/shared/api/types'
import type { ProductViewModel } from '@fsd/entities/product/model/types'

function stripHtml(text: string | undefined): string {
  return (text ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function shouldShowInCatalog(product: Partial<ApiProductDetailed>): boolean {
  const name = product.name?.trim()
  return Boolean(name)
}

export function extractPriceFromDetailed(product: ApiProductDetailed): {
  price: number | null
  maxPrice: number | null
  currencyCode: string | null
} {
  // New format: min_price / max_price directly on product
  if (product.min_price != null) {
    return {
      price: product.min_price,
      maxPrice: product.max_price ?? product.min_price,
      currencyCode: 'KZT'
    }
  }

  // Fallback: old format with modifications
  let min: number | null = null
  let currencyAtMin: string | null = null
  for (const m of product.modifications ?? []) {
    for (const pr of m.prices ?? []) {
      const v = pr.currency_price ?? pr.original_currency_price
      if (typeof v === 'number' && !Number.isNaN(v)) {
        if (min === null || v < min) {
          min = v
          const c = pr.currency?.trim()
          currencyAtMin = c ? c.toUpperCase() : null
        }
      }
    }
  }
  return { price: min, maxPrice: null, currencyCode: currencyAtMin ?? 'KZT' }
}

function pickDescription(product: ApiProductDetailed): string {
  const cleaned = stripHtml(product.description)
  if (cleaned) {
    return cleaned
  }
  return product.category_detail?.name ?? ''
}

export function apiProductToViewModel(
  product: ApiProductDetailed,
  categorySlug: string,
  categoryName: string
): ProductViewModel {
  const { price, maxPrice, currencyCode } = extractPriceFromDetailed(product)

  return {
    id: product.id,
    categoryId: categorySlug,
    categoryName,
    subcategory: product.subcategory ?? undefined,
    price,
    maxPrice,
    currencyCode,
    name: product.name,
    description: pickDescription(product),
    sku: product.sku ?? product.code ?? undefined,
    manufacturer: product.manufacturer ?? undefined,
    country: product.country ?? undefined,
    unit: product.unit ?? 'шт',
    shelfLife: product.shelf_life ?? undefined,
    regNumber: product.reg_number ?? undefined,
    supplierCount: product.supplier_count ?? undefined,
    stock: product.stock ?? undefined,
    stickers: undefined
  }
}
