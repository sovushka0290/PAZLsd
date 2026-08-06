// server/api/supplier/applications/[id].patch.ts
import { defineEventHandler, readBody, getRouterParam, setResponseStatus } from 'h3'
import { updateSupplierApplicationStatus } from '../../../utils/supplierStore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    setResponseStatus(event, 400)
    return { error: 'ID заявки не указан' }
  }

  const body = await readBody(event)
  const status = body?.status as 'pending' | 'verified' | 'rejected'
  if (!['pending', 'verified', 'rejected'].includes(status)) {
    setResponseStatus(event, 400)
    return { error: 'Некорректный статус' }
  }

  const updated = updateSupplierApplicationStatus(id, status)
  if (!updated) {
    setResponseStatus(event, 404)
    return { error: 'Заявка не найдена' }
  }

  return {
    success: true,
    application: updated
  }
})
