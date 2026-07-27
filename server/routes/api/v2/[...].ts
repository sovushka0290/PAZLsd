import {
  defineEventHandler,
  getRequestURL,
  readBody,
  setResponseHeader,
  setResponseStatus,
  proxyRequest
} from 'h3'
import { getStoredOrders } from '../../../utils/orderStore'
import { defaultCategories, defaultProducts, Category, Product } from '../../../utils/defaultMockDb'

let scrapedCategories: Category[] = []
let scrapedProducts: Product[] = []

try {
  const dbData = require('../../../../data/scraped_products_500.json')
  if (Array.isArray(dbData?.categories) && dbData.categories.length > 0) {
    scrapedCategories = dbData.categories as Category[]
  }
  if (Array.isArray(dbData?.products) && dbData.products.length > 0) {
    scrapedProducts = dbData.products as Product[]
  }
} catch (e) {
  // If JSON file reading fails in Vercel serverless lambda, fall back to embedded DB
}

const activeCategories: Category[] = scrapedCategories.length > 0 ? scrapedCategories : defaultCategories
const activeProducts: Product[] = scrapedProducts.length > 0 ? scrapedProducts : defaultProducts

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // In production B2B mode (apiSnapshot === false), proxy ALL methods (GET, POST, PATCH, PUT, DELETE) to Django API
  if (!config.apiSnapshot) {
    const backendBase = config.apiBackendUrl || config.public.apiBaseUrl || 'http://backend:8000'
    const target = `${backendBase.replace(/\/$/, '')}${event.path}`
    return proxyRequest(event, target)
  }

  const u = new URL(getRequestURL(event).href)
  const pathname = u.pathname
  const method = event.method.toUpperCase()
  console.log(`[Mock API v2] ${method} ${pathname}`)

  const categories = activeCategories
  const products = activeProducts

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

  setResponseHeader(event, 'content-type', 'application/json; charset=utf-8')

  // --- POST / PATCH / PUT Handlers ---
  if (['POST', 'PATCH', 'PUT'].includes(method)) {
    const body = await readBody(event).catch(() => ({}))

    if (pathname.endsWith('/auth/register/')) {
      return {
        access: 'mock_jwt_access_token_' + Date.now(),
        refresh: 'mock_jwt_refresh_token_' + Date.now(),
        user: {
          id: Date.now(),
          phone: body?.phone || '+7 (707) 123-45-67',
          first_name: body?.first_name || 'Покупатель',
          last_name: body?.last_name || '',
          email: body?.email || 'buyer@pazl.kz',
          role: 'buyer',
          phone_confirmed: true
        }
      }
    }

    if (pathname.endsWith('/auth/register-supplier/')) {
      return {
        access: 'mock_jwt_access_token_' + Date.now(),
        refresh: 'mock_jwt_refresh_token_' + Date.now(),
        user: {
          id: Date.now(),
          phone: body?.phone || '+7 (707) 999-88-77',
          first_name: body?.company_name || 'Поставщик',
          last_name: '',
          email: 'supplier@pazl.kz',
          role: 'supplier',
          company_name: body?.company_name || 'ТОО Поставщик',
          company_bin: body?.bin || '123456789012',
          phone_confirmed: true
        }
      }
    }

    if (pathname.endsWith('/auth/phone-login/')) {
      const isSupplier = body?.phone?.includes('88') || body?.phone?.includes('supplier')
      return {
        access: 'mock_jwt_access_token_' + Date.now(),
        refresh: 'mock_jwt_refresh_token_' + Date.now(),
        user: {
          id: Date.now(),
          phone: body?.phone || '+7 (707) 123-45-67',
          first_name: isSupplier ? 'ТОО «Стома Поставщик»' : 'Доктор Аскар',
          last_name: '',
          email: 'user@pazl.kz',
          role: isSupplier ? 'supplier' : 'buyer',
          phone_confirmed: true
        }
      }
    }

    if (pathname.endsWith('/auth/token/refresh/')) {
      return {
        access: 'mock_jwt_access_token_refreshed_' + Date.now(),
        refresh: 'mock_jwt_refresh_token_' + Date.now()
      }
    }

    return {
      success: true,
      message: 'Обновлено успешно',
      data: body
    }
  }

  // --- GET Handlers ---
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

  if (pathname.endsWith('/categories/')) {
    const results = categories.map(c => ({
      ...c,
      products_count: getProductCount(c.id)
    }))
    return { count: results.length, next: null, previous: null, results }
  }

  if (pathname.endsWith('/categories/root/')) {
    const results = categories
      .filter(c => c.parent === null)
      .map(c => ({ ...c, products_count: getProductCount(c.id) }))
    return { count: results.length, next: null, previous: null, results }
  }

  if (pathname.endsWith('/catalog/product-autocomplete/')) {
    const q = (u.searchParams.get('query') || '').trim().toLowerCase()
    if (!q || q.length < 2) return { categories: [], products: [] }
    const matchedCategories = categories.filter(c => c.name.toLowerCase().includes(q)).slice(0, 5)
    const matchedProducts = products.filter(p => 
      p.name.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q))
    ).slice(0, 8)
    return { categories: matchedCategories, products: matchedProducts }
  }

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

  if (pathname.endsWith('/contractor_profile/me/') || pathname.endsWith('/account/supplier/me/') || pathname.endsWith('/auth/me/')) {
    return {
      id: 12,
      contact_person: 'Алихан Бактыбай',
      phone: '+7 777 123 45 67',
      email: 'alikhan@dentsmile.kz',
      address: 'г. Алматы, ул. Абая 42, офис 5',
      role: 'buyer'
    }
  }

  if (pathname.endsWith('/contractor_debts/')) {
    return {
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, debt_sum: 45000, overdue_sum: 0, agreement_name: 'Основной договор поставки' }]
    }
  }

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
      items: (o.items || []).map((it: any, i: number) => ({
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

  if (pathname.endsWith('/supplier_warehouse/')) {
    return {
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, name: 'Основной склад Алматы', address: 'г. Алматы, проспект Райымбека 160А', is_default: true }]
    }
  }

  if (pathname.endsWith('/supplier_price_types/')) {
    return {
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, name: 'Базовая розница', default: true }]
    }
  }

  setResponseStatus(event, 404)
  return { detail: `Mock API: Endpoint "${pathname}" not found.` }
})
