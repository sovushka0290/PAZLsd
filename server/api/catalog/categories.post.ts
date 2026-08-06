// server/api/catalog/categories.post.ts
import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { addCategory } from '../../utils/catalogStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.name) {
    setResponseStatus(event, 400)
    return { error: 'Название категории обязательно' }
  }

  const newCat = addCategory({
    name: body.name,
    parent: body.parent ? Number(body.parent) : null,
    icon: body.icon || '🦷'
  })

  return {
    success: true,
    category: newCat
  }
})
