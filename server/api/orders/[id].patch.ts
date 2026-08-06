import { defineEventHandler, readBody, getRouterParam } from 'h3'
import { updateOrderStatus } from '../../utils/orderStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') || ''
  const body = await readBody(event).catch(() => ({}))
  const order = updateOrderStatus(id, body.status || 'Новый')
  if (!order) {
    throw createError({ statusCode: 404, message: 'Order not found' })
  }
  return { success: true, order }
})
