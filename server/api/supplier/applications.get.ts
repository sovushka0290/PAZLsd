import { getSupplierApplications } from '../../utils/supplierStore'

export default defineEventHandler(async () => {
  const apps = getSupplierApplications()
  // Map 'pending' to 'reviewing' if needed by UI
  return apps.map((a: any) => ({
    ...a,
    status: a.status === 'pending' ? 'reviewing' : a.status
  }))
})
