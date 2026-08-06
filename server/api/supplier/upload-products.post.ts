// server/api/supplier/upload-products.post.ts
import { defineEventHandler, readBody } from 'h3'
import { addPendingBatch, type SupplierPendingProduct } from '../../utils/supplierStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (!body?.products || !Array.isArray(body.products) || body.products.length === 0) {
    return { error: 'Список товаров пуст' }
  }

  const products: SupplierPendingProduct[] = body.products.map((p: any, idx: number) => ({
    id: `SP-${Date.now()}-${idx + 1}`,
    name: p.name || 'Без названия',
    price: Number(p.price) || 0,
    category: p.category || 'Общее',
    description: p.description || '',
    image: p.image || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
    sku: p.sku || `SKU-${Date.now().toString().slice(-4)}-${idx + 1}`,
    brand: p.brand || body.supplierName || 'PAZL Partner',
    stock: Number(p.stock) || 50,
    status: 'pending'
  }))

  const batch = addPendingBatch({
    supplierId: body.supplierId || 'SUPP-DEFAULT',
    supplierName: body.supplierName || 'Поставщик',
    supplierPhone: body.supplierPhone || '+7 700 000 00 00',
    products
  })

  return {
    success: true,
    message: `Партия из ${products.length} товаров успешно отправлена на модерацию администратору.`,
    batch
  }
})
