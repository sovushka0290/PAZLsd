import fs from 'node:fs'
import path from 'node:path'

const dbPath = path.resolve(process.cwd(), 'feedback.json')

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!fs.existsSync(dbPath)) {
    return { success: false, message: 'Database not found' }
  }

  const raw = fs.readFileSync(dbPath, 'utf-8')
  let feedbackList: any[] = JSON.parse(raw)

  const index = feedbackList.findIndex((f: any) => f.id === id)

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Feedback not found',
    })
  }

  feedbackList.splice(index, 1)

  fs.writeFileSync(dbPath, JSON.stringify(feedbackList, null, 2))

  return { success: true }
})
