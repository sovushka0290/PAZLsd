// server/api/catalog/products/[id].put.ts
import { defineEventHandler, readBody, getRouterParam, setResponseStatus } from 'h3'
import { updateProduct } from '../../../utils/catalogStore'

export default defineEventHandler(async (event) => {
  const idStr = getRouterParam(event, 'id')
  if (!idStr) {
    setResponseStatus(event, 400)
    return { error: 'ID товара не указан' }
  }

  const id = Number(idStr)
  const body = await readBody(event)

  const updated = updateProduct(id, {
    name: body.name,
    price: body.price !== undefined ? Number(body.price) : undefined,
    category: body.category !== undefined ? Number(body.category) : undefined,
    description: body.description,
    image: body.image,
    code: body.code,
    brand: body.brand,
    stock: body.stock !== undefined ? Number(body.stock) : undefined
  })

  if (!updated) {
    setResponseStatus(event, 404)
    return { error: 'Товар не найден' }
  }

  return {
    success: true,
    product: updated
  }
})
