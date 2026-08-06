// server/utils/orderStore.ts
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

export interface GuestOrder {
  id: string
  date: string
  name: string
  phone: string
  contact?: string
  company?: string
  address?: string
  total: number
  status: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

// In production (Docker), use /data/orders.json
// In dev/Vercel, use in-memory fallback
const DATA_DIR = process.env.DATA_DIR || '/tmp'
const ORDERS_FILE = join(DATA_DIR, 'orders.json')

const defaultOrders: GuestOrder[] = [
  {
    id: 'ORD-501',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    name: 'Стоматология «Ару Дент»',
    phone: '+7 707 123 4567',
    contact: '@arudent_kz',
    address: 'г. Алматы, ул. Достык 105',
    total: 185000,
    status: 'Новый',
    items: [
      { name: 'TG6 машинные файлы для обработки корневых каналов', quantity: 4, price: 5625 },
      { name: 'Megafill Flow Megadenta Dentalprodukte', quantity: 2, price: 4750 }
    ]
  },
  {
    id: 'ORD-502',
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    name: 'Клиника «Престиж Дент»',
    phone: '+7 777 987 6543',
    contact: 'Telegram: @marzhan_dent',
    address: 'г. Астана, ул. Кабанбай батыра 21',
    total: 9125,
    status: 'Новый',
    items: [
      { name: 'Prime-Dent Veneer Cement (White Opaque)', quantity: 1, price: 9125 }
    ]
  }
]

let memoryCache: GuestOrder[] | null = null

function loadOrders(): GuestOrder[] {
  if (memoryCache) return memoryCache
  try {
    if (existsSync(ORDERS_FILE)) {
      const data = readFileSync(ORDERS_FILE, 'utf-8')
      memoryCache = JSON.parse(data)
      return memoryCache!
    }
  } catch {}
  memoryCache = [...defaultOrders]
  saveOrders(memoryCache)
  return memoryCache
}

function saveOrders(orders: GuestOrder[]): void {
  try {
    const dir = dirname(ORDERS_FILE)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8')
  } catch {}
}

export function getStoredOrders(): GuestOrder[] {
  return loadOrders()
}

export function addOrderToStore(order: GuestOrder): GuestOrder {
  const orders = loadOrders()
  orders.unshift(order)
  memoryCache = orders
  saveOrders(orders)
  return order
}

export function updateOrderStatus(orderId: string, status: string): GuestOrder | null {
  const orders = loadOrders()
  const order = orders.find(o => o.id === orderId)
  if (order) {
    order.status = status
    memoryCache = orders
    saveOrders(orders)
  }
  return order || null
}

export function deleteOrder(orderId: string): boolean {
  const orders = loadOrders()
  const idx = orders.findIndex(o => o.id === orderId)
  if (idx !== -1) {
    orders.splice(idx, 1)
    memoryCache = orders
    saveOrders(orders)
    return true
  }
  return false
}
