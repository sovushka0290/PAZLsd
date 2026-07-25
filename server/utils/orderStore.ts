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

const mockOrdersStore: GuestOrder[] = [
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

export function getStoredOrders(): GuestOrder[] {
  return mockOrdersStore
}

export function addOrderToStore(order: GuestOrder): GuestOrder {
  mockOrdersStore.unshift(order)
  return order
}
