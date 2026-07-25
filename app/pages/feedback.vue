<template>
  <div class="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        ← На главную витрину
      </NuxtLink>

      <div class="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <UIcon name="i-lucide-message-square" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Обратная связь и вопросы</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Оставьте заявку, и дежурный оператор свяжется с вами в течение 5 минут.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <a href="tel:87077120190" class="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
            <UIcon name="i-lucide-phone-call" class="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Прямой телефон</p>
              <p class="text-sm font-bold text-slate-800 group-hover:text-blue-600">8 (707) 712-01-90</p>
            </div>
          </a>
          <div class="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <UIcon name="i-lucide-clock" class="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Время работы</p>
              <p class="text-sm font-bold text-slate-800">Пн-Сб с 09:00 до 19:00</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-5">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Имя или Клиника</label>
            <input v-model="form.name" required placeholder="Например: Клиника «Ару Дент» или доктор Аскар" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-900" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Телефон / Telegram / Email</label>
            <input v-model="form.contact" required placeholder="+7 (707) 123-45-67 или @telegram_contact" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-900" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Суть обращения или вопрос по прайс-листу</label>
            <textarea v-model="form.message" required rows="4" placeholder="Опишите нужный товар, количество или вопрос к операторам..." class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-900 resize-none"></textarea>
          </div>

          <div v-if="success" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3">
            <span class="text-xl">✅</span>
            <div>
              <p class="text-sm font-bold">Ваше обращение отправлено операторам!</p>
              <p class="text-xs text-emerald-600">Мы оперативно перезвоним или напишем вам по указанному контакту.</p>
            </div>
          </div>

          <p v-if="error" class="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl">{{ error }}</p>

          <button type="submit" :disabled="isSubmitting || success" class="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
            <span>{{ isSubmitting ? 'Отправка...' : 'Отправить операторам' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const form = reactive({
  name: '',
  contact: '',
  message: ''
})

const isSubmitting = ref(false)
const success = ref(false)
const error = ref('')

async function onSubmit() {
  isSubmitting.value = true
  error.value = ''
  
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: form
    })
    success.value = true
    form.name = ''
    form.contact = ''
    form.message = ''
  } catch (e) {
    error.value = 'Произошла ошибка при отправке сообщения. Попробуйте позже.'
  } finally {
    isSubmitting.value = false
  }
}

useSeoMeta({ title: 'Обратная связь' })
</script>
