// server/api/catalog/categories/[id].put.ts
import { defineEventHandler, readBody, getRouterParam, setResponseStatus } from 'h3'
import { updateCategory } from '../../../utils/catalogStore'

export default defineEventHandler(async (event) => {
  const idStr = getRouterParam(event, 'id')
  if (!idStr) {
    setResponseStatus(event, 400)
    return { error: 'ID категории не указан' }
  }

  const id = Number(idStr)
  const body = await readBody(event)

  const updated = updateCategory(id, {
    name: body.name,
    parent: body.parent !== undefined ? (body.parent ? Number(body.parent) : null) : undefined,
    icon: body.icon
  })

  if (!updated) {
    setResponseStatus(event, 404)
    return { error: 'Категория не найдена' }
  }

  return {
    success: true,
    category: updated
  }
})
