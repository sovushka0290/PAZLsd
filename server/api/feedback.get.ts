import fs from 'node:fs'
import path from 'node:path'

const dbPath = path.resolve(process.cwd(), 'feedback.json')

export default defineEventHandler(async () => {
  if (!fs.existsSync(dbPath)) return []
  try {
    const list: any[] = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    return list.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch(e) {
    return []
  }
})
