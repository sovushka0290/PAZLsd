// server/api/supplier/register.post.ts
import { defineEventHandler, readBody } from 'h3'
import { addSupplierApplication } from '../../utils/supplierStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.companyName || !body?.phone) {
    return { error: 'Необходимо указать название компании и телефон' }
  }

  const app = addSupplierApplication({
    companyName: body.companyName,
    bin: body.bin || '',
    phone: body.phone,
    email: body.email || '',
    contactPerson: body.contactPerson || '',
    categories: body.categories || '',
    documentFile: body.documentFile || 'Справка_госрегистрация.pdf'
  })

  return {
    success: true,
    message: 'Заявка успешно принята в обработку. Зайдите на сайт с этим же номером телефона через 20 минут - 1 час.',
    application: app
  }
})
