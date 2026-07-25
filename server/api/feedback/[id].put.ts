import fs from 'node:fs'
import path from 'node:path'

const dbPath = path.resolve(process.cwd(), 'feedback.json')

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  if (!fs.existsSync(dbPath)) throw createError({ statusCode: 404, statusMessage: 'No feedbacks found' })

  let list = []
  try {
    list = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  } catch(e) {}

  const fIndex = list.findIndex(f => f.id === id)
  if (fIndex === -1) throw createError({ statusCode: 404, statusMessage: 'Feedback not found' })

  list[fIndex].status = body.status
  fs.writeFileSync(dbPath, JSON.stringify(list, null, 2))

  return { success: true }
})
