<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupplierApi, type Warehouse } from '~/composables/useSupplierApi'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'cabinet', middleware: 'cabinet-auth' })

const { t } = useI18n()
const { fetchSupplierProfile, fetchWarehouses, updateSupplierProfile } = useSupplierApi()
const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const successMsg = ref('')

const profile = ref<Record<string, any>>({
  companyName: '',
  binIin: '',
  phone: '',
  email: '',
  address: '',
  categories: [],
  status: 'registered' // registered, reviewing, verified
})

const warehouses = ref<Warehouse[]>([])

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    const [profileData, warehousesData] = await Promise.all([
      fetchSupplierProfile(),
      fetchWarehouses()
    ])
    if (profileData) profile.value = { ...profile.value, ...profileData }
    if (warehousesData) warehouses.value = warehousesData
  } catch (err: any) {
    error.value = 'Ошибка загрузки данных профиля'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const saveProfile = async () => {
  saving.value = true
  error.value = null
  successMsg.value = ''
  try {
    await updateSupplierProfile(profile.value)
    successMsg.value = 'Профиль успешно обновлен'
  } catch (err: any) {
    error.value = 'Ошибка при сохранении профиля'
  } finally {
    saving.value = false
  }
}

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; class: string }> = {
    registered: { label: 'Зарегистрирован', class: 'bg-slate-100 text-slate-800' },
    reviewing: { label: 'На проверке', class: 'bg-amber-100 text-amber-800' },
    verified: { label: 'Верифицирован', class: 'bg-green-100 text-green-800' }
  }
  return map[status] || { label: 'Зарегистрирован', class: 'bg-slate-100 text-slate-800' }
}

const showAlert = (msg: string) => {
  if (typeof window !== 'undefined') {
    window.alert(msg)
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-semibold text-slate-900">👤 Профиль компании</h1>
    
    <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl">
      ❌ {{ error }}
    </div>
    
    <div v-if="successMsg" class="bg-green-50 text-green-700 p-4 rounded-xl">
      ✅ {{ successMsg }}
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 animate-pulse">
      <div class="h-8 bg-slate-200 rounded w-1/4"></div>
      <div class="space-y-4">
        <div class="h-10 bg-slate-200 rounded"></div>
        <div class="h-10 bg-slate-200 rounded"></div>
      </div>
    </div>

    <template v-else>
      <!-- Section 1: Профиль компании -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 class="text-lg font-medium text-slate-900">Основная информация</h2>
          <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusBadge(profile.status || 'registered').class]">
            {{ getStatusBadge(profile.status || 'registered').label }}
          </span>
        </div>
        
        <form @submit.prevent="saveProfile" class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Название компании</label>
              <input v-model="profile.companyName" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">БИН/ИИН</label>
              <input v-model="profile.binIin" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
              <input v-model="profile.phone" type="tel" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input v-model="profile.email" type="email" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-1">Адрес</label>
              <input v-model="profile.address" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-1">Документ компании (Лицензия / Справка)</label>
              <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span class="text-2xl">📄</span>
                <div>
                  <p class="text-sm font-medium text-slate-800">{{ profile.document_file || 'Справка_госрегистрация.pdf' }}</p>
                  <p class="text-xs text-slate-500">Документ загружен и передан на модерацию администратору</p>
                </div>
                <a href="#" @click.prevent="showAlert('Просмотр документа')" class="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800">
                  Просмотреть
                </a>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-1">Торговые категории (только для чтения)</label>
              <div class="flex flex-wrap gap-2 mt-2">
                <span v-if="profile.categories && profile.categories.length === 0" class="text-slate-500 text-sm">Категории не выбраны</span>
                <span v-for="(cat, idx) in profile.categories" :key="idx" class="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm">
                  {{ cat }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" :disabled="saving" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
              <span v-if="saving" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>

      <!-- Section 2: Склады -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div class="p-6 border-b border-slate-200 bg-slate-50">
          <h2 class="text-lg font-medium text-slate-900">Склады</h2>
        </div>
        
        <div class="p-6">
          <div v-if="warehouses.length === 0" class="text-center py-8 text-slate-500">
            Склады не добавлены
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="warehouse in warehouses" :key="warehouse.id" class="border border-slate-200 p-4 rounded-xl relative">
              <span v-if="warehouse.is_default" class="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">Основной</span>
              <h3 class="font-medium text-slate-900 mb-2">{{ warehouse.name }}</h3>
              <p class="text-sm text-slate-600 flex items-start gap-2">
                <span class="mt-0.5">📍</span> {{ warehouse.address }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
