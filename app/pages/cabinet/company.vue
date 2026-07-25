<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Данные организации</h1>
    </div>

    <div v-if="loading" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
      <div class="h-8 bg-slate-100 rounded w-1/3 mb-6"></div>
      <div class="space-y-4">
        <div class="h-4 bg-slate-100 rounded w-full"></div>
        <div class="h-4 bg-slate-100 rounded w-2/3"></div>
        <div class="h-4 bg-slate-100 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="!company" class="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
      <div class="text-6xl mb-4">🏢</div>
      <h3 class="text-xl font-bold text-slate-800 mb-2">Организация не найдена</h3>
      <p class="text-slate-500">Данные организации не заполнены. Обратитесь к менеджеру.</p>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-800">{{ company.name || 'Название организации' }}</h2>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="company.is_verified ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'">
          {{ company.is_verified ? '✅ Верифицирован' : '⏳ Не верифицирован' }}
        </span>
      </div>
      
      <div class="p-6 space-y-8">
        <div>
          <h3 class="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Основная информация</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-slate-500 mb-1">БИН/ИИН</p>
              <p class="font-medium text-slate-800">{{ company.bin || 'Не указан' }}</p>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-6">
          <h3 class="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Адреса</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-slate-500 mb-1">Юридический адрес</p>
              <p class="font-medium text-slate-800">{{ company.legal_address || 'Не указан' }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500 mb-1">Фактический адрес</p>
              <p class="font-medium text-slate-800">{{ company.actual_address || 'Не указан' }}</p>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-6">
          <h3 class="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Банковские реквизиты</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-slate-500 mb-1">Банк</p>
              <p class="font-medium text-slate-800">{{ company.bank_name || 'Не указан' }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500 mb-1">БИК</p>
              <p class="font-medium text-slate-800">{{ company.bik || 'Не указан' }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-sm text-slate-500 mb-1">Расчётный счёт (IBAN)</p>
              <p class="font-medium text-slate-800">{{ company.iban || 'Не указан' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCabinetApi } from '~/composables/useCabinetApi'

const { t } = useI18n()

definePageMeta({
  layout: 'cabinet',
  middleware: 'cabinet-auth'
})

const { fetchMyContractor } = useCabinetApi()

const company = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    company.value = await fetchMyContractor()
  } catch (e) {
    console.error(e)
    company.value = null
  } finally {
    loading.value = false
  }
})
</script>
