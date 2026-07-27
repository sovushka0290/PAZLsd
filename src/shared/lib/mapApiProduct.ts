import type { ApiProductDetailed } from '@fsd/shared/api/types'
import type { ProductViewModel } from '@fsd/entities/product/model/types'
import { resolveMediaUrl } from '@fsd/shared/lib/resolveMediaUrl'

const PLACEHOLDER_IMAGE = '/images/nophoto.png'

function stripHtml(text: string | undefined): string {
  return (text ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function shouldShowInCatalog(product: Partial<ApiProductDetailed>): boolean {
  const name = product.name?.trim()
  
  // Temporarily return true if name exists, regardless of image or price or description
  // This will show all products while backend image/price issues are being debugged.
  return Boolean(name)
}

export function extractPriceFromDetailed(product: ApiProductDetailed): {
  price: number | null
  currencyCode: string | null
} {
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
  return { price: min, currencyCode: currencyAtMin }
}

function pickDescription(product: ApiProductDetailed): string {
  const cleaned = stripHtml(product.description)
  if (cleaned) {
    return cleaned
  }
  const firstMod = product.modifications?.[0]
  if (firstMod?.name && firstMod.name !== product.name) {
    return firstMod.name
  }
  return product.category_detail?.name ?? ''
}

function pickImage(product: ApiProductDetailed): string {
  const raw = product.images?.find(i => i.image)?.image
  return resolveMediaUrl(raw) ?? PLACEHOLDER_IMAGE
}

export function apiProductToViewModel(
  product: ApiProductDetailed,
  categorySlug: string,
  categoryName: string
): ProductViewModel {
  if (!shouldShowInCatalog(product)) {
    return {
      id: product.id,
      categoryId: categorySlug,
      categoryName,
      price: null,
      currencyCode: null,
      image: PLACEHOLDER_IMAGE,
      name: product.name ?? 'Товар',
      description: stripHtml(product.description),
      brand: '',
      stickers: undefined
    }
  }
  const { price, currencyCode } = extractPriceFromDetailed(product)
  
  // TODO: Replace with real data from backend when available
  const mockStickers = []
  if (product.id % 5 === 0) mockStickers.push('Хит')
  if (product.id % 7 === 0) mockStickers.push('Новинка')

  return {
    id: product.id,
    categoryId: categorySlug,
    categoryName,
    price,
    currencyCode,
    image: pickImage(product),
    name: product.name,
    description: pickDescription(product),
    brand: product.name.split(' ')[0], // Dummy brand based on first word
    stickers: mockStickers.length ? mockStickers : undefined
  }
}
