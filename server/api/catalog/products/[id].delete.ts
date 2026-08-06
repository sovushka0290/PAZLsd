// server/api/catalog/products/[id].delete.ts
import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { deleteProduct } from '../../../utils/catalogStore'

export default defineEventHandler((event) => {
  const idStr = getRouterParam(event, 'id')
  if (!idStr) {
    setResponseStatus(event, 400)
    return { error: 'ID товара не указан' }
  }

  const id = Number(idStr)
  const deleted = deleteProduct(id)

  if (!deleted) {
    setResponseStatus(event, 404)
    return { error: 'Товар не найден' }
  }

  return {
    success: true,
    message: 'Товар успешно удален'
  }
})
