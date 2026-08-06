// server/api/supplier/applications.get.ts
import { defineEventHandler } from 'h3'
import { getSupplierApplications } from '../../utils/supplierStore'

export default defineEventHandler(() => {
  return getSupplierApplications()
})
