<template>
  <div class="feedback-feature">
    <UButton
      color="primary"
      variant="soft"
      class="font-semibold transition-transform hover:scale-105 active:scale-95"
      @click="isOpen = true"
    >
      <IconPhone class="mr-2 h-4 w-4" />
      Обратная связь
    </UButton>

    <UModal v-model:open="isOpen">
      <template #content>
        <UCard
          :ui="{ ring: 'ring-1 ring-slate-100 dark:ring-neutral-800', divide: 'divide-y divide-slate-100 dark:divide-neutral-800', rounded: 'rounded-3xl', shadow: 'shadow-2xl' }" class="bg-white dark:bg-neutral-900"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold leading-6 text-slate-900 dark:text-white">
                Заказать звонок
              </h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                class="-my-1"
                @click="isOpen = false"
              />
            </div>
          </template>

          <form v-if="!isSubmitted" @submit.prevent="submitForm" class="space-y-4">
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Оставьте свои контактные данные, и наш менеджер свяжется с вами в ближайшее время.
            </p>

            <UFormField label="Ваше имя" required>
              <UInput v-model="form.name" placeholder="Иван Иванов" icon="i-lucide-user" />
            </UFormField>

            <UFormField label="Телефон" required>
              <UInput v-model="form.phone" type="tel" placeholder="+7 (___) ___-__-__" icon="i-lucide-phone" />
            </UFormField>

            <UFormField label="Сообщение (необязательно)">
              <UTextarea v-model="form.message" placeholder="Интересует товар..." :rows="3" />
            </UFormField>

            <div class="pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-neutral-800 mt-6">
              <UButton color="neutral" variant="soft" size="lg" class="rounded-xl font-medium" @click="isOpen = false">
                Отмена
              </UButton>
              <UButton type="submit" color="primary" size="lg" class="rounded-xl font-bold shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0" :loading="isSubmitting">
                Отправить
              </UButton>
            </div>
          </form>

          <div v-else class="py-8 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <IconCheckCircle class="h-6 w-6" />
            </div>
            <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Спасибо!</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Ваша заявка успешно отправлена. Мы скоро свяжемся с вами.
            </p>
            <UButton class="mt-6" color="primary" variant="soft" @click="isOpen = false">
              Закрыть
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)
const isSubmitting = ref(false)
const isSubmitted = ref(false)

const form = reactive({
  name: '',
  phone: '',
  message: ''
})

async function submitForm() {
  if (!form.name || !form.phone) return

  isSubmitting.value = true
  
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        name: form.name,
        contact: form.phone,
        message: form.message
      }
    })
  } catch (e) {
    console.error('Feedback submission error', e)
  } finally {
    isSubmitting.value = false
    isSubmitted.value = true
  }
  
  setTimeout(() => {
    form.name = ''
    form.phone = ''
    form.message = ''
    isSubmitted.value = false
  }, 2000)
}
</script>
