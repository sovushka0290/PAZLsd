// server/utils/catalogStore.ts
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import catalogProducts from '../../data/catalog-products.json'
import catalogCategories from '../../data/categories.json'

export interface CategoryItem {
  id: number
  name: string
  slug: string
  parent: number | null
  icon?: string
  products_count?: number
  subcategories?: { id: string; name: string; product_count: number }[]
}

export interface ProductItem {
  id: number
  name: string
  code?: string
  sku?: string
  category: number
  category_name?: string
  subcategory?: string
  category_detail?: { id: number; name: string; slug: string }
  description: string
  manufacturer?: string
  country?: string
  unit?: string
  min_price?: number | null
  max_price?: number | null
  stock?: number
  supplier_count?: number
  shelf_life?: string | null
  reg_number?: string | null
  images?: { id: number; image: string; is_base?: boolean }[]
  modifications?: any[]
  brand?: string
  supplier_name?: string
  is_custom?: boolean
}

const DATA_DIR = process.env.DATA_DIR || '/tmp'
const CATALOG_MODS_FILE = join(DATA_DIR, 'catalog_custom_data.json')

interface CatalogData {
  categories: CategoryItem[]
  products: ProductItem[]
}

let catalogCache: CatalogData | null = null

function slugify(text: string): string {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ь': '', 'ъ': '',
    ' ': '-', ',': '', '.': '', '(': '', ')': '', '/': '-', '«': '', '»': ''
  }
  return text
    .toLowerCase()
    .split('')
    .map(ch => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getAutoIcon(name: string): string {
  const n = (name || '').toLowerCase()
  if (n.includes('анестез') || n.includes('гемостат')) return '💉'
  if (n.includes('дезинфек') || n.includes('стерилиз')) return '🧼'
  if (n.includes('имплант') || n.includes('хирург')) return '🔪'
  if (n.includes('инструмент') || n.includes('бор') || n.includes('фрез')) return '🪛'
  if (n.includes('красител') || n.includes('вспомогат')) return '🎨'
  if (n.includes('оборудов')) return '⚙️'
  if (n.includes('ортодонт')) return '😁'
  if (n.includes('ортопед') || n.includes('зуботехн')) return '👑'
  if (n.includes('полиров') || n.includes('шлифов')) return '✨'
  if (n.includes('профилакт') || n.includes('гигиен')) return '🪥'
  if (n.includes('реставрац') || n.includes('пломб')) return '🦷'
  if (n.includes('сиз') || n.includes('расходн')) return '📦'
  if (n.includes('эндодонт')) return '📍'
  if (n.includes('прочее')) return '📋'
  return '🦷'
}

function loadCatalog(): CatalogData {
  if (catalogCache) return catalogCache

  // Build categories from categories.json
  const baseCategories: CategoryItem[] = (catalogCategories as any[]).map((cat: any) => ({
    id: parseInt(cat.id, 10),
    name: cat.name,
    slug: slugify(cat.name),
    parent: null,
    icon: getAutoIcon(cat.name),
    products_count: cat.product_count || 0,
    subcategories: (cat.subcategories || []).map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      product_count: sub.product_count || 0
    }))
  }))

  // Build products from catalog-products.json
  const baseProducts: ProductItem[] = (catalogProducts as any[]).map((p: any) => {
    // Find the category for this product
    const cat = baseCategories.find(c => c.name === p.category)
    const catId = cat ? cat.id : 0

    return {
      id: p.id,
      name: p.name,
      code: p.sku || `SKU-${p.id}`,
      sku: p.sku || '',
      category: catId,
      category_name: p.category || '',
      subcategory: p.subcategory || '',
      category_detail: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : undefined,
      description: p.description || '',
      manufacturer: p.manufacturer || '',
      country: p.country || '',
      unit: p.unit || 'шт',
      min_price: p.min_price ?? null,
      max_price: p.max_price ?? null,
      stock: p.stock ?? 0,
      supplier_count: p.supplier_count ?? 1,
      shelf_life: p.shelf_life || null,
      reg_number: p.reg_number || null,
      images: [],
      modifications: p.min_price != null ? [
        {
          id: p.id * 10,
          name: p.modification || p.name,
          prices: [{ currency_price: p.min_price, currency: 'KZT', price_type: 1 }]
        }
      ] : [],
      brand: p.manufacturer || '',
      supplier_name: ''
    }
  })

  catalogCache = {
    categories: baseCategories,
    products: baseProducts
  }

  // Overlay any saved modifications from disk
  try {
    if (existsSync(CATALOG_MODS_FILE)) {
      const customData = JSON.parse(readFileSync(CATALOG_MODS_FILE, 'utf-8'))
      if (customData.categories && Array.isArray(customData.categories)) {
        catalogCache.categories = customData.categories
      }
      if (customData.products && Array.isArray(customData.products)) {
        catalogCache.products = customData.products
      }
    }
  } catch (err) {
    console.error('[CatalogStore] Error reading catalog_custom_data.json:', err)
  }

  return catalogCache
}

function saveCatalog(): void {
  if (!catalogCache) return
  try {
    const dir = dirname(CATALOG_MODS_FILE)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(CATALOG_MODS_FILE, JSON.stringify(catalogCache, null, 2), 'utf-8')
  } catch (err) {
    console.error('[CatalogStore] Error saving catalog_custom_data.json:', err)
  }
}

export function getCategories(): CategoryItem[] {
  return loadCatalog().categories
}

export function getProducts(): ProductItem[] {
  return loadCatalog().products
}

export const getCatalogCategories = getCategories
export const getCatalogProducts = getProducts

export function getProductById(id: number): ProductItem | undefined {
  return loadCatalog().products.find(p => p.id === id)
}

export function addCategory(category: { name: string; parent?: number | null; icon?: string }): CategoryItem {
  const data = loadCatalog()
  const newId = Math.max(...data.categories.map(c => c.id), 1000) + 1
  const newCategory: CategoryItem = {
    id: newId,
    name: category.name,
    slug: slugify(category.name),
    parent: category.parent ?? null,
    icon: category.icon || '🦷'
  }
  data.categories.push(newCategory)
  saveCatalog()
  return newCategory
}

export function updateCategory(id: number, fields: Partial<CategoryItem>): CategoryItem | null {
  const data = loadCatalog()
  const cat = data.categories.find(c => c.id === id)
  if (cat) {
    Object.assign(cat, fields)
    saveCatalog()
  }
  return cat || null
}

export function deleteCategory(id: number): boolean {
  const data = loadCatalog()
  const idx = data.categories.findIndex(c => c.id === id)
  if (idx !== -1) {
    data.categories.splice(idx, 1)
    // Also reassign or remove child categories
    data.categories = data.categories.filter(c => c.parent !== id)
    saveCatalog()
    return true
  }
  return false
}

export function addProduct(product: {
  name: string
  price: number
  category: number
  description: string
  image?: string
  code?: string
  brand?: string
  stock?: number
  supplier_name?: string
}): ProductItem {
  const data = loadCatalog()
  const newId = Math.max(...data.products.map(p => p.id), 20000) + 1
  const cat = data.categories.find(c => c.id === product.category)

  const newProduct: ProductItem = {
    id: newId,
    name: product.name,
    code: product.code || `SKU-${newId}`,
    sku: product.code || `SKU-${newId}`,
    category: product.category,
    category_detail: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : undefined,
    description: product.description || '',
    min_price: product.price,
    max_price: product.price,
    images: [],
    modifications: [
      {
        id: newId * 10,
        name: product.name,
        prices: [{ currency_price: product.price, price_type: 1 }]
      }
    ],
    stock: product.stock ?? 50,
    brand: product.brand || '',
    supplier_name: product.supplier_name || '',
    is_custom: true
  }

  data.products.unshift(newProduct)
  saveCatalog()
  return newProduct
}

export function updateProduct(id: number, fields: {
  name?: string
  price?: number
  category?: number
  description?: string
  image?: string
  code?: string
  brand?: string
  stock?: number
}): ProductItem | null {
  const data = loadCatalog()
  const prod = data.products.find(p => p.id === id)
  if (prod) {
    if (fields.name !== undefined) {
      prod.name = fields.name
      if (prod.modifications?.[0]) prod.modifications[0].name = fields.name
    }
    if (fields.price !== undefined) {
      prod.min_price = fields.price
      prod.max_price = fields.price
      if (prod.modifications?.[0]?.prices?.[0]) {
        prod.modifications[0].prices[0].currency_price = fields.price
      } else {
        prod.modifications = [{ id: id * 10, name: prod.name, prices: [{ currency_price: fields.price, price_type: 1 }] }]
      }
    }
    if (fields.category !== undefined) {
      prod.category = fields.category
      const cat = data.categories.find(c => c.id === fields.category)
      if (cat) prod.category_detail = { id: cat.id, name: cat.name, slug: cat.slug }
    }
    if (fields.description !== undefined) prod.description = fields.description
    if (fields.code !== undefined) prod.code = fields.code
    if (fields.brand !== undefined) prod.brand = fields.brand
    if (fields.stock !== undefined) prod.stock = fields.stock

    saveCatalog()
  }
  return prod || null
}

export function deleteProduct(id: number): boolean {
  const data = loadCatalog()
  const idx = data.products.findIndex(p => p.id === id)
  if (idx !== -1) {
    data.products.splice(idx, 1)
    saveCatalog()
    return true
  }
  return false
}
