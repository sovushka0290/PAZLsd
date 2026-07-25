import { exec } from 'node:child_process'
import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  console.log('[trigger-snapshot] Triggered snapshot rebuild from backend')
  
  // Запускаем пересборку в фоновом режиме
  exec('npm run api-snapshot', (error, stdout, stderr) => {
    if (error) {
      console.error(`[trigger-snapshot] Error: ${error.message}`)
      return
    }
    if (stderr) {
      console.warn(`[trigger-snapshot] Stderr: ${stderr}`)
    }
    console.log(`[trigger-snapshot] Success: ${stdout}`)
  })
  
  return {
    status: 'ok',
    message: 'Snapshot rebuild started in the background'
  }
})
