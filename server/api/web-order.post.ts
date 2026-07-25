import { defineEventHandler, readBody } from 'h3'
import { addOrderToStore } from '../utils/orderStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  
  const items = (body?.items || []).map((i: any) => ({
    name: i.name || 'Стоматологический товар',
    quantity: i.quantity || 1,
    price: i.price || 0
  }))

  const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  
  const newOrder = addOrderToStore({
    id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString(),
    name: body?.name || 'Клиника (Без названия)',
    phone: body?.phone || 'Не указан',
    contact: body?.telegram || body?.phone || 'Контакты не указаны',
    address: 'Казахстан, Доставка / Самовывоз',
    total,
    status: 'Новый',
    items: items.length > 0 ? items : [{ name: 'Тестовый товар', quantity: 1, price: 5000 }]
  })

  return {
    success: true,
    order_id: newOrder.id,
    message: 'Заказ успешно сохранен',
    order: newOrder
  }
})
