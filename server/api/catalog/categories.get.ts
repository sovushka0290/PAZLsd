// server/api/catalog/categories.get.ts
import { defineEventHandler } from 'h3'
import { getCategories } from '../../utils/catalogStore'

export default defineEventHandler(() => {
  const categories = getCategories()
  return {
    count: categories.length,
    results: categories
  }
})
