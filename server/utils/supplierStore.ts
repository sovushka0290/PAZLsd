// server/utils/supplierStore.ts
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

export interface SupplierApplication {
  id: string | number
  companyName: string
  bin: string
  phone: string
  email?: string
  contactPerson?: string
  categories?: string
  documentFile?: string
  status: 'pending' | 'verified' | 'rejected'
  date: string
}

export interface SupplierPendingProduct {
  id: string | number
  name: string
  price: number
  category: string
  description: string
  image: string
  sku?: string
  brand?: string
  stock?: number
  selected?: boolean
  status?: 'pending' | 'approved' | 'rejected'
}

export interface SupplierProductBatch {
  id: string
  supplierId: string | number
  supplierName: string
  supplierPhone: string
  date: string
  status: 'pending' | 'approved' | 'partially_approved' | 'rejected'
  products: SupplierPendingProduct[]
}

const DATA_DIR = process.env.DATA_DIR || '/tmp'
const APPLICATIONS_FILE = join(DATA_DIR, 'supplier_applications.json')
const PENDING_PRODUCTS_FILE = join(DATA_DIR, 'pending_supplier_products.json')

const defaultApplications: SupplierApplication[] = [
  {
    id: 'APP-101',
    companyName: 'ТОО «Стома-Депо»',
    bin: '210440012984',
    phone: '+7 777 987 65 43',
    email: 'depo@stoma.kz',
    contactPerson: 'Ерлан Сагитов',
    categories: 'Терапия, Эндодонтия, Инструменты',
    documentFile: 'Лицензия_СтомаДепо_РК.pdf',
    status: 'pending',
    date: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'APP-102',
    companyName: 'ИП «Дентал Про Импорт»',
    bin: '880312300451',
    phone: '+7 701 555 44 33',
    email: 'info@dentalpro.kz',
    contactPerson: 'Асель Нурланова',
    categories: 'Оборудование, Стерилизация, Наконечники',
    documentFile: 'Справка_Регистрация_ДенталПро.pdf',
    status: 'pending',
    date: new Date(Date.now() - 3600000 * 7).toISOString()
  },
  {
    id: 'APP-103',
    companyName: 'ТОО «Альянс-Дент»',
    bin: '150940003412',
    phone: '+7 705 111 22 33',
    email: 'alyans@dent.kz',
    contactPerson: 'Максим Ким',
    categories: 'Ортодонтия, Зуботехника, Композиты',
    documentFile: 'Сертификат_Дистрибьютора_2026.pdf',
    status: 'verified',
    date: new Date(Date.now() - 3600000 * 24).toISOString()
  }
]

const defaultBatches: SupplierProductBatch[] = [
  {
    id: 'BATCH-201',
    supplierId: 'APP-103',
    supplierName: 'ТОО «Альянс-Дент»',
    supplierPhone: '+7 705 111 22 33',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending',
    products: [
      {
        id: 'SP-1',
        name: 'Фотополимерная лампа Woodpecker LED.F',
        price: 85000,
        category: 'Оборудование',
        description: 'Беспроводная светодиодная полимеризационная лампа высокой мощности со встроенным радиометром.',
        image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
        sku: 'WD-LED-F',
        brand: 'Woodpecker',
        stock: 12,
        status: 'pending'
      },
      {
        id: 'SP-2',
        name: 'Набор композитов Gradia Direct (6 шприцев)',
        price: 64500,
        category: 'Терапия',
        description: 'Светоотверждаемый реставрационный микрогибридный композит для всех классов полостей.',
        image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80',
        sku: 'GC-GRADIA-6',
        brand: 'GC Dental',
        stock: 25,
        status: 'pending'
      },
      {
        id: 'SP-3',
        name: 'Турбинный наконечник с подсветкой Pana-Max Plus',
        price: 49000,
        category: 'Инструменты',
        description: 'Ортопедический турбинный наконечник с четырехточечным спреем и керамическими подшипниками.',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80',
        sku: 'NSK-PANA-P',
        brand: 'NSK Japan',
        stock: 18,
        status: 'pending'
      }
    ]
  }
]

let appsCache: SupplierApplication[] | null = null
let batchesCache: SupplierProductBatch[] | null = null

function loadApplications(): SupplierApplication[] {
  if (appsCache) return appsCache
  try {
    if (existsSync(APPLICATIONS_FILE)) {
      appsCache = JSON.parse(readFileSync(APPLICATIONS_FILE, 'utf-8'))
      return appsCache!
    }
  } catch {}
  appsCache = [...defaultApplications]
  saveApplications(appsCache)
  return appsCache
}

function saveApplications(apps: SupplierApplication[]): void {
  try {
    const dir = dirname(APPLICATIONS_FILE)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2), 'utf-8')
  } catch {}
}

function loadBatches(): SupplierProductBatch[] {
  if (batchesCache) return batchesCache
  try {
    if (existsSync(PENDING_PRODUCTS_FILE)) {
      batchesCache = JSON.parse(readFileSync(PENDING_PRODUCTS_FILE, 'utf-8'))
      return batchesCache!
    }
  } catch {}
  batchesCache = [...defaultBatches]
  saveBatches(batchesCache)
  return batchesCache
}

function saveBatches(batches: SupplierProductBatch[]): void {
  try {
    const dir = dirname(PENDING_PRODUCTS_FILE)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(PENDING_PRODUCTS_FILE, JSON.stringify(batches, null, 2), 'utf-8')
  } catch {}
}

export function getSupplierApplications(): SupplierApplication[] {
  return loadApplications()
}

export function addSupplierApplication(app: Omit<SupplierApplication, 'id' | 'date' | 'status'>): SupplierApplication {
  const apps = loadApplications()
  const newApp: SupplierApplication = {
    ...app,
    id: `APP-${Date.now().toString().slice(-4)}`,
    status: 'pending',
    date: new Date().toISOString()
  }
  apps.unshift(newApp)
  appsCache = apps
  saveApplications(apps)
  return newApp
}

export function updateSupplierApplicationStatus(id: string | number, status: 'pending' | 'verified' | 'rejected'): SupplierApplication | null {
  const apps = loadApplications()
  const target = apps.find(a => String(a.id) === String(id))
  if (target) {
    target.status = status
    appsCache = apps
    saveApplications(apps)
  }
  return target || null
}

export function getPendingBatches(): SupplierProductBatch[] {
  return loadBatches()
}

export function addPendingBatch(batch: Omit<SupplierProductBatch, 'id' | 'date' | 'status'>): SupplierProductBatch {
  const batches = loadBatches()
  const newBatch: SupplierProductBatch = {
    ...batch,
    id: `BATCH-${Date.now().toString().slice(-4)}`,
    status: 'pending',
    date: new Date().toISOString()
  }
  batches.unshift(newBatch)
  batchesCache = batches
  saveBatches(batches)
  return newBatch
}

export function updateBatchStatus(batchId: string, status: 'pending' | 'approved' | 'partially_approved' | 'rejected', productStatuses?: Record<string, 'approved' | 'rejected'>): SupplierProductBatch | null {
  const batches = loadBatches()
  const batch = batches.find(b => b.id === batchId)
  if (batch) {
    batch.status = status
    if (productStatuses) {
      batch.products.forEach(p => {
        if (productStatuses[String(p.id)]) {
          p.status = productStatuses[String(p.id)]
        }
      })
    }
    batchesCache = batches
    saveBatches(batches)
  }
  return batch || null
}
