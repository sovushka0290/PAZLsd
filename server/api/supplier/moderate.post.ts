// server/api/supplier/moderate.post.ts
import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { updateBatchStatus, getPendingBatches } from '../../utils/supplierStore'
import { addProduct, getCategories, addCategory } from '../../utils/catalogStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { batchId, action, productIds, reason } = body

  if (!batchId || !action) {
    setResponseStatus(event, 400)
    return { error: 'Не указан batchId или action' }
  }

  const batches = getPendingBatches()
  const batch = batches.find((b: any) => b.id === batchId)
  if (!batch) {
    setResponseStatus(event, 404)
    return { error: 'Партия товаров не найдена' }
  }

  const allCategories = getCategories()

  if (action === 'approve_all') {
    // Approve all items in batch
    const productStatuses: Record<string, 'approved' | 'rejected'> = {}
    for (const prod of batch.products) {
      productStatuses[String(prod.id)] = 'approved'

      // Match or create category
      let matchedCat = allCategories.find((c: any) => c.name.toLowerCase() === prod.category.toLowerCase())
      if (!matchedCat) {
        matchedCat = addCategory({ name: prod.category })
      }

      addProduct({
        name: prod.name,
        price: prod.price,
        category: matchedCat.id,
        description: prod.description,
        image: prod.image,
        code: prod.sku,
        brand: prod.brand || batch.supplierName,
        stock: prod.stock || 50,
        supplier_name: batch.supplierName
      })
    }

    const updated = updateBatchStatus(batchId, 'approved', productStatuses)
    return {
      success: true,
      message: `Все ${batch.products.length} товаров успешно одобрены и добавлены в общий каталог!`,
      batch: updated
    }
  }

  if (action === 'approve_selected') {
    const selectedList: string[] = Array.isArray(productIds) ? productIds.map(String) : []
    const productStatuses: Record<string, 'approved' | 'rejected'> = {}
    let approvedCount = 0

    for (const prod of batch.products) {
      if (selectedList.includes(String(prod.id))) {
        productStatuses[String(prod.id)] = 'approved'
        approvedCount++

        let matchedCat = allCategories.find((c: any) => c.name.toLowerCase() === prod.category.toLowerCase())
        if (!matchedCat) {
          matchedCat = addCategory({ name: prod.category })
        }

        addProduct({
          name: prod.name,
          price: prod.price,
          category: matchedCat.id,
          description: prod.description,
          image: prod.image,
          code: prod.sku,
          brand: prod.brand || batch.supplierName,
          stock: prod.stock || 50,
          supplier_name: batch.supplierName
        })
      }
    }

    const newStatus = approvedCount === batch.products.length ? 'approved' : 'partially_approved'
    const updated = updateBatchStatus(batchId, newStatus, productStatuses)

    return {
      success: true,
      message: `Одобрено товаров: ${approvedCount}. Они добавлены в общий каталог!`,
      batch: updated
    }
  }

  if (action === 'reject') {
    const productStatuses: Record<string, 'approved' | 'rejected'> = {}
    batch.products.forEach((p: any) => {
      productStatuses[String(p.id)] = 'rejected'
    })
    const updated = updateBatchStatus(batchId, 'rejected', productStatuses)

    return {
      success: true,
      message: 'Партия товаров отклонена',
      reason: reason || 'Не соответствует требованиям каталога',
      batch: updated
    }
  }

  setResponseStatus(event, 400)
  return { error: 'Неизвестное действие' }
})
