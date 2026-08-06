// server/utils/catalogStore.ts
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import dbData from '../../data/scraped_products_500.json'

export interface CategoryItem {
  id: number
  name: string
  slug: string
  parent: number | null
  icon?: string
  products_count?: number
}

export interface ProductItem {
  id: number
  name: string
  code?: string
  category: number
  category_detail?: { id: number; name: string; slug: string }
  description: string
  images?: { id: number; image: string; is_base?: boolean }[]
  modifications?: any[]
  stock?: number
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

function loadCatalog(): CatalogData {
  if (catalogCache) return catalogCache

  // Start with base data from scraped_products_500.json
  const baseCategories: CategoryItem[] = (dbData.categories || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug || `cat-${c.id}`,
    parent: c.parent ?? null,
    icon: c.icon || getAutoIcon(c.name)
  }))

  const baseProducts: ProductItem[] = (dbData.products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    code: p.code || `SKU-${p.id}`,
    category: p.category,
    category_detail: p.category_detail,
    description: p.description || '',
    images: p.images || [],
    modifications: p.modifications || [
      {
        id: p.id * 10,
        name: p.name,
        prices: [{ currency_price: 15000, price_type: 1 }]
      }
    ],
    stock: p.stock ?? 25,
    brand: p.brand || 'PAZL Dental'
  }))

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

function getAutoIcon(name: string): string {
  const n = (name || '').toLowerCase()
  if (n.includes('зуб') || n.includes('пломб') || n.includes('дент')) return '🦷'
  if (n.includes('инструмент') || n.includes('бор') || n.includes('фрез')) return '🪛'
  if (n.includes('наконечник') || n.includes('лампа') || n.includes('скалер')) return '🔦'
  if (n.includes('стерил') || n.includes('автоклав') || n.includes('дезинф')) return '🧼'
  if (n.includes('перчатк') || n.includes('маск') || n.includes('защит')) return '🧤'
  if (n.includes('оттиск') || n.includes('слепоч') || n.includes('слепок')) return '🥣'
  if (n.includes('ортопед') || n.includes('коронк') || n.includes('мост')) return '👑'
  if (n.includes('хирург') || n.includes('имплант') || n.includes('шовн')) return '💉'
  if (n.includes('эндодонт') || n.includes('канал') || n.includes('файл')) return '📍'
  if (n.includes('гигиен') || n.includes('щетк') || n.includes('паст')) return '🪥'
  if (n.includes('оборудован') || n.includes('установк') || n.includes('компрессор')) return '⚙️'
  if (n.includes('расход') || n.includes('ват') || n.includes('валик')) return '📦'
  return '🦷'
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
    slug: `cat-${newId}`,
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
  const newId = Math.max(...data.products.map(p => p.id), 2000) + 1
  const cat = data.categories.find(c => c.id === product.category)

  const newProduct: ProductItem = {
    id: newId,
    name: product.name,
    code: product.code || `SKU-${newId}`,
    category: product.category,
    category_detail: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : undefined,
    description: product.description || '',
    images: product.image
      ? [{ id: newId * 10, image: product.image, is_base: true }]
      : [{ id: newId * 10, image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80', is_base: true }],
    modifications: [
      {
        id: newId * 10,
        name: product.name,
        prices: [{ currency_price: product.price, price_type: 1 }]
      }
    ],
    stock: product.stock ?? 50,
    brand: product.brand || 'PAZL Dental',
    supplier_name: product.supplier_name || 'PAZL Partner',
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
    if (fields.image !== undefined) {
      prod.images = [{ id: id * 10, image: fields.image, is_base: true }]
    }
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
