import { defineEventHandler } from 'h3'
import { getStoredOrders } from '../utils/orderStore'

export default defineEventHandler(() => {
  return getStoredOrders()
})
