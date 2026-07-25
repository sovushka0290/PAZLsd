import { describe, it, expect } from 'node:test'
import { shouldShowInCatalog } from '../src/shared/lib/mapApiProduct'

describe('shouldShowInCatalog', () => {
  it('keeps only products with image, price, name, and description', () => {
    const visible = shouldShowInCatalog({
      id: 1,
      name: 'Керамический материал',
      description: '<p>Надёжный материал</p>',
      images: [{ image: 'https://example.com/1.jpg' }],
      modifications: [{ prices: [{ currency_price: 1500, currency: 'KZT' }] }]
    } as any)

    const hidden = shouldShowInCatalog({
      id: 2,
      name: 'Без цены',
      description: '<p>Нет цены</p>',
      images: [{ image: 'https://example.com/2.jpg' }],
      modifications: [{ prices: [] }]
    } as any)

    expect(visible).toBe(true)
    expect(hidden).toBe(false)
  })
})
