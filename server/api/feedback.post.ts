import fs from 'node:fs'
import path from 'node:path'

const dbPath = path.resolve(process.cwd(), 'feedback.json')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  let list = []
  if (fs.existsSync(dbPath)) {
    try {
      list = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    } catch(e) {}
  }

  const newFeedback = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    status: 'новое',
    name: body.name || '',
    contact: body.contact || '',
    message: body.message || ''
  }

  list.unshift(newFeedback)
  fs.writeFileSync(dbPath, JSON.stringify(list, null, 2))

  return { success: true, id: newFeedback.id }
})
