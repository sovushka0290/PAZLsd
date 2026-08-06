import fs from 'node:fs'
import path from 'node:path'

const dbPath = path.resolve(process.cwd(), 'orders.json')

export default defineEventHandler((event) => {
  if (!fs.existsSync(dbPath)) return []
  const raw = fs.readFileSync(dbPath, 'utf-8')
  try {
    const list: any[] = JSON.parse(raw)
    return list.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch(e) {
    return []
  }
})
