// server/api/catalog/products.get.ts
import { defineEventHandler, getQuery } from 'h3'
import { getProducts } from '../../utils/catalogStore'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = String(query.search || '').trim().toLowerCase()
  const category = query.category ? Number(query.category) : null

  let products = getProducts()
  if (category) {
    products = products.filter(p => p.category === category)
  }
  if (search) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(search) ||
      (p.code && p.code.toLowerCase().includes(search)) ||
      (p.description && p.description.toLowerCase().includes(search))
    )
  }

  return {
    count: products.length,
    results: products
  }
})
