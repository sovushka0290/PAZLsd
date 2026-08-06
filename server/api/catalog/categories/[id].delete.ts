// server/api/catalog/categories/[id].delete.ts
import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { deleteCategory } from '../../../utils/catalogStore'

export default defineEventHandler((event) => {
  const idStr = getRouterParam(event, 'id')
  if (!idStr) {
    setResponseStatus(event, 400)
    return { error: 'ID категории не указан' }
  }

  const id = Number(idStr)
  const deleted = deleteCategory(id)

  if (!deleted) {
    setResponseStatus(event, 404)
    return { error: 'Категория не найдена' }
  }

  return {
    success: true,
    message: 'Категория успешно удалена'
  }
})
