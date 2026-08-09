import { getSupplierApplications, updateSupplierApplicationStatus } from '../../../utils/supplierStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID required' })
  }
  const status = body?.status === 'reviewing' ? 'pending' : (body?.status || 'pending')
  const updated = updateSupplierApplicationStatus(id, status)
  return {
    success: true,
    application: updated
  }
})
