import { defineEventHandler, getRouterParam } from 'h3'
import { deleteOrder } from '../../utils/orderStore'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''
  const deleted = deleteOrder(id)
  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Order not found' })
  }
  return { success: true, message: 'Order deleted' }
})
