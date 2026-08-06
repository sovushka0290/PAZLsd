import {
  defineEventHandler,
  getRequestURL,
  setResponseHeader,
  setResponseStatus
} from 'h3'
import { getStoredOrders } from '../../../utils/orderStore'
import { getCatalogCategories, getCatalogProducts } from '../../../utils/catalogStore'

interface Category {
  id: number
  name: string
  slug: string
  parent: number | null
  products_count?: number
}

interface Product {
  id: number
  name: string
  code?: string
  category: number
  category_detail?: { id: number; name: string; slug: string }
  description: string
  images?: { id: number; image: string; is_base?: boolean }[]
  modifications?: any[]
}

export default defineEventHandler(async (event) => {
  const u = new URL(getRequestURL(event).href)
  const pathname = u.pathname // e.g., /api/v2/categories/ or /api/v2/products_detailed/
  console.log('[Mock API v2] Request pathname:', pathname)
  
  // Statically bundled & cached catalog data (100% reliable on Vercel / serverless)
  const categories = getCatalogCategories()
  const products = getCatalogProducts()
  console.log('[Mock API v2] DB loaded. categories:', categories?.length, 'products:', products?.length)

  // Helper to paginate array
  const paginate = (items: any[], page: number, pageSize: number) => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const results = items.slice(start, end)
    const hasNext = end < items.length
    const hasPrev = start > 0
    return {
      count: items.length,
      next: hasNext ? `${u.origin}${pathname}?page=${page + 1}&page_size=${pageSize}` : null,
      previous: hasPrev ? `${u.origin}${pathname}?page=${page - 1}&page_size=${pageSize}` : null,
      results
    }
  }

  // Calculate products count per category (including all nested subcategories recursively)
  const getAllSubCatIds = (catId: number): number[] => {
    const children = categories.filter(c => c.parent === catId).map(c => c.id)
    let all = [...children]
    for (const childId of children) {
      all = all.concat(getAllSubCatIds(childId))
    }
    return all
  }

  const getProductCount = (catId: number): number => {
    const targetCatIds = [catId, ...getAllSubCatIds(catId)]
    return products.filter(p => targetCatIds.includes(p.category)).length
  }

  setResponseHeader(event, 'content-type', 'application/json; charset=utf-8')

  // 1. GET /api/v2/categories/
  if (pathname.endsWith('/categories/')) {
    console.log('[Mock API v2] Handling /categories/')
    const results = categories.map(c => ({
      ...c,
      products_count: getProductCount(c.id)
    }))
    console.log('[Mock API v2] Done categories mapping')
    return {
      count: results.length,
      next: null,
      previous: null,
      results
    }
  }

  // 2. GET /api/v2/categories/root/
  if (pathname.endsWith('/categories/root/')) {
    console.log('[Mock API v2] Handling /categories/root/')
    const results = categories
      .filter(c => c.parent === null)
      .map(c => ({
        ...c,
        products_count: getProductCount(c.id)
      }))
    console.log('[Mock API v2] Done categories root mapping')
    return {
      count: results.length,
      next: null,
      previous: null,
      results
    }
  }

  // 2.5 GET /api/v2/catalog/product-autocomplete/
  if (pathname.endsWith('/catalog/product-autocomplete/')) {
    const q = (u.searchParams.get('query') || '').trim().toLowerCase()
    if (!q || q.length < 2) {
      return { categories: [], products: [] }
    }
    const matchedCategories = categories.filter(c => c.name.toLowerCase().includes(q)).slice(0, 5)
    const matchedProducts = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.code && p.code.toLowerCase().includes(q))
    ).slice(0, 8)
    return {
      categories: matchedCategories,
      products: matchedProducts
    }
  }

  // 3. GET /api/v2/categories/{category_slug_or_id}/products_detailed/
  const catProductsRegex = /\/categories\/([^/]+)\/products_detailed\/?$/
  const catMatch = pathname.match(catProductsRegex)
  if (catMatch && catMatch[1]) {
    const catSlugOrId = decodeURIComponent(catMatch[1])
    const search = (u.searchParams.get('search') || '').trim().toLowerCase()
    const page = parseInt(u.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(u.searchParams.get('page_size') || '20', 10)

    // Find category
    const cat = categories.find(c => c.slug === catSlugOrId || String(c.id) === catSlugOrId)
    if (!cat) {
      return { count: 0, next: null, previous: null, results: [] }
    }

    // Recursively collect all descendant category IDs
    const getAllSubCategoryIds = (parentId: number): number[] => {
      const children = categories.filter(c => c.parent === parentId).map(c => c.id)
      let all = [...children]
      for (const childId of children) {
        all = all.concat(getAllSubCategoryIds(childId))
      }
      return all
    }

    const targetCatIds = [cat.id, ...getAllSubCategoryIds(cat.id)]

    let filtered = products.filter(p => targetCatIds.includes(p.category))
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      )
    }

    return paginate(filtered, page, pageSize)
  }

  // 4. GET /api/v2/products_detailed/ or /api/v2/my_products/
  if (pathname.endsWith('/products_detailed/') || pathname.endsWith('/my_products/')) {
    const search = (u.searchParams.get('search') || '').trim().toLowerCase()
    const page = parseInt(u.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(u.searchParams.get('page_size') || '20', 10)

    let filtered = products
    if (search) {
      filtered = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search) ||
        (p.code && p.code.toLowerCase().includes(search))
      )
    }

    return paginate(filtered, page, pageSize)
  }

  // 5. GET /api/v2/products/{id}/
  const productDetailRegex = /\/products\/(\d+)\/?$/
  const prodMatch = pathname.match(productDetailRegex)
  if (prodMatch && prodMatch[1]) {
    const prodId = parseInt(prodMatch[1], 10)
    const prod = products.find(p => p.id === prodId)
    if (!prod) {
      setResponseStatus(event, 404)
      return { detail: "Товар не найден" }
    }
    return prod
  }

  // 6. GET /api/v2/my_contractor/me/
  if (pathname.endsWith('/my_contractor/me/')) {
    return {
      id: 12,
      name: 'ТОО «Dent Smile»',
      bin_iin: '120940023412',
      address: 'г. Алматы, ул. Абая 42, офис 5',
      is_verified: true,
      is_retail: false,
      loyalty_amount: 150000,
      company: {
        id: 12,
        name: 'ТОО «Dent Smile»',
        bin_or_iin: '120940023412',
        legal_address: 'г. Алматы, ул. Абая 42, офис 5',
        actual_address: 'г. Алматы, ул. Розыбакиева 120',
        bank_name: 'AO «Kaspi Bank»',
        bank_account: 'KZ123456789098765432',
        bik: 'KSPIKZ2A'
      }
    }
  }

  // 7. GET /api/v2/contractor_profile/me/
  if (pathname.endsWith('/contractor_profile/me/')) {
    return {
      id: 12,
      contact_person: 'Алихан Бактыбай',
      phone: '+7 777 123 45 67',
      email: 'alikhan@dentsmile.kz',
      address: 'г. Алматы, ул. Абая 42, офис 5'
    }
  }

  // 8. GET /api/v2/contractor_debts/
  if (pathname.endsWith('/contractor_debts/')) {
    return {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          debt_sum: 45000,
          overdue_sum: 0,
          agreement_name: 'Основной договор поставки'
        }
      ]
    }
  }

  // 9. GET /api/v2/orders/
  if (pathname.endsWith('/orders/')) {
    const page = parseInt(u.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(u.searchParams.get('page_size') || '20', 10)

    const stored = getStoredOrders()

    const mockOrders = stored.map((o: any) => ({
      id: o.id,
      contractor_number: o.id,
      order_sum: o.total,
      currency: 'KZT',
      date_created: o.date,
      date: o.date,
      status: o.status,
      status_name: o.status,
      status_display: o.status,
      name: o.name,
      phone: o.phone,
      contact: o.contact || o.phone,
      total: o.total,
      address: o.address || 'г. Алматы',
      items: o.items.map((it: any, i: number) => ({
        id: i + 1,
        name: it.name,
        product_name: it.name,
        quantity: it.quantity,
        price: it.price,
        total: it.price * it.quantity
      }))
    }))

    return paginate(mockOrders, page, pageSize)
  }

  // 10. GET /api/v2/orders/{id}/
  const orderDetailRegex = /\/orders\/(\d+)\/?$/
  const orderMatch = pathname.match(orderDetailRegex)
  if (orderMatch && orderMatch[1]) {
    const orderId = parseInt(orderMatch[1], 10)
    if (orderId === 301) {
      return {
        id: 301,
        contractor_number: 'ORD-2026-001',
        order_sum: 250000,
        currency: 'KZT',
        date_created: '2026-07-15T12:00:00Z',
        status: 4,
        status_name: 'Отгружен',
        status_display: 'Отгружен',
        supplier_name: 'ТОО «Альянс-Дент»',
        pay_method_name: 'Безналичный расчет',
        delivery_address: 'г. Алматы, ул. Абая 42',
        items: [
          {
            id: 1,
            product_name: products[0]?.name || 'Тестовый товар 1',
            quantity: 2,
            price: products[0]?.modifications?.[0]?.prices?.[0]?.currency_price || 125000,
            total: (products[0]?.modifications?.[0]?.prices?.[0]?.currency_price || 125000) * 2
          }
        ]
      }
    }
    if (orderId === 302) {
      return {
        id: 302,
        contractor_number: 'ORD-2026-002',
        order_sum: 47500,
        currency: 'KZT',
        date_created: '2026-07-20T10:30:00Z',
        status: 1,
        status_name: 'Обработка',
        status_display: 'Обработка',
        supplier_name: 'ТОО «Стома-Маркет»',
        pay_method_name: 'Оплата картой',
        delivery_address: 'г. Алматы, ул. Абая 42',
        items: [
          {
            id: 2,
            product_name: products[1]?.name || 'Тестовый товар 2',
            quantity: 10,
            price: products[1]?.modifications?.[0]?.prices?.[0]?.currency_price || 4750,
            total: (products[1]?.modifications?.[0]?.prices?.[0]?.currency_price || 4750) * 10
          }
        ]
      }
    }
    setResponseStatus(event, 404)
    return { detail: "Заказ не найден" }
  }

  // 11. GET /api/v2/supplier_warehouse/
  if (pathname.endsWith('/supplier_warehouse/')) {
    return {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: 'Основной склад Алматы',
          address: 'г. Алматы, проспект Райымбека 160А',
          is_default: true
        }
      ]
    }
  }

  // 12. GET /api/v2/supplier_price_types/
  if (pathname.endsWith('/supplier_price_types/')) {
    return {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: 'Базовая розница',
          default: true
        }
      ]
    }
  }

  // Default fallback for any other GET endpoint
  setResponseStatus(event, 404)
  return { detail: `Mock API: GET endpoint "${pathname}" not implemented.` }
})
