export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return {
    success: true,
    message: 'Заявка на регистрацию поставщика успешно отправлена и ожидает модерации',
    data: body
  }
})
