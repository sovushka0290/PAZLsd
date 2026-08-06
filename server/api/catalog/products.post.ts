// server/api/catalog/products.post.ts
import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { addProduct } from '../../utils/catalogStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.name || body?.price === undefined || !body?.category) {
    setResponseStatus(event, 400)
    return { error: 'Поля name, price и category обязательны для заполнения' }
  }

  const newProduct = addProduct({
    name: body.name,
    price: Number(body.price),
    category: Number(body.category),
    description: body.description || '',
    image: body.image,
    code: body.code,
    brand: body.brand,
    stock: Number(body.stock) || 50,
    supplier_name: body.supplier_name
  })

  return {
    success: true,
    product: newProduct
  }
})
