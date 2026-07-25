import dbProducts from '../../data/scraped_products.json'

const fallbackProducts = [
  {
    id: 101,
    name: 'Стоматологический микроскоп Flexion',
    description: 'Премиальный микроскоп для стоматологической клиники. Подходит для точной диагностики и комфортной работы врача.',
    category_detail: { name: 'Микроскопы' },
    images: [{ image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80' }],
    modifications: [{ id: 1, name: 'Стандарт', prices: [{ currency_price: 1250000, currency: 'KZT' }] }]
  },
  {
    id: 102,
    name: 'Коффердам Easy Dam',
    description: 'Надёжный коффердам для качественной изоляции рабочего поля. Удобный в установке и безопасный для пациента.',
    category_detail: { name: 'Изоляция' },
    images: [{ image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80' }],
    modifications: [{ id: 2, name: 'Стандарт', prices: [{ currency_price: 18500, currency: 'KZT' }] }]
  },
  {
    id: 103,
    name: 'Светодиодная лампа для стоматологии',
    description: 'Яркое и стабильное освещение для стоматологического кабинета. Подходит для лечения и диагностики.',
    category_detail: { name: 'Осветительные установки' },
    images: [{ image: 'https://images.unsplash.com/photo-1580281657527-2e6be6f5bc0d?auto=format&fit=crop&w=900&q=80' }],
    modifications: [{ id: 3, name: 'Стандарт', prices: [{ currency_price: 980000, currency: 'KZT' }] }]
  },
  {
    id: 104,
    name: 'Композитный материал Esthet-X',
    description: 'Высококачественный композит для эстетичного восстановления зубов. Подходит для работы в клинике.',
    category_detail: { name: 'Материалы' },
    images: [{ image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80' }],
    modifications: [{ id: 4, name: 'Стандарт', prices: [{ currency_price: 42000, currency: 'KZT' }] }]
  },
  {
    id: 105,
    name: 'Ультразвуковая чистка наконечников',
    description: 'Надёжный инструмент для стерилизации и подготовки рабочего инструмента. Упрощает процесс в клинике.',
    category_detail: { name: 'Инструменты' },
    images: [{ image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=900&q=80' }],
    modifications: [{ id: 5, name: 'Стандарт', prices: [{ currency_price: 760000, currency: 'KZT' }] }]
  }
]

export default defineEventHandler((event) => {
  try {
    const data = dbProducts as any[]


    const source = Array.isArray(data) && data.length ? data : fallbackProducts

    return source
      .filter((product: any) => {
        const name = typeof product.name === 'string' ? product.name.trim() : ''
        const description = (product.description ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        const hasImage = Array.isArray(product.images) && product.images.some((img: any) => typeof img?.image === 'string' && img.image.trim())
        const hasPrice = Array.isArray(product.modifications) && product.modifications.some((mod: any) => {
          return Array.isArray(mod?.prices) && mod.prices.some((pr: any) => {
            const value = pr?.currency_price ?? pr?.original_currency_price
            return typeof value === 'number' && !Number.isNaN(value)
          })
        })

        return Boolean(name && description && hasImage && hasPrice)
      })
      .map((product: any, index: number) => ({
      id: product.id ?? index + 1,
      name: product.name ?? '',
      description: product.description ?? '',
      categories: [product.category_detail?.name || 'Без категории'],
      brand: { name: '' },
      price: product.modifications?.[0]?.prices?.[0]?.currency_price ?? null,
      images: (product.images || []).map((img: any) => img.image || ''),
      modifications: (product.modifications || []).map((mod: any) => ({
        id: mod.id,
        name: mod.name ?? 'Стандарт',
        price: mod.prices?.[0]?.currency_price ?? null,
        prices: mod.prices || []
      }))
    }))
  } catch (err) {
    console.error('Error reading mock products:', err)
    return []
  }
})
