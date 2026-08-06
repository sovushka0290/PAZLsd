// server/api/supplier/pending-products.get.ts
import { defineEventHandler } from 'h3'
import { getPendingBatches } from '../../utils/supplierStore'

export default defineEventHandler(() => {
  return getPendingBatches()
})
