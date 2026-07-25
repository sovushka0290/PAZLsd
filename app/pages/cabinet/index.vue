<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {{ userInitials }}
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-800">{{ t('cabinet.welcome', 'Добро пожаловать') }}, {{ userName }}! 👋</h1>
            <p class="text-slate-500 mt-1">📞 {{ userPhone }} <span v-if="phoneVerified" class="text-green-500 ml-1">✅</span></p>
          </div>
        </div>
        <NuxtLink :to="localePath('/')" class="text-blue-600 hover:text-blue-800 font-medium">
          Вернуться в магазин
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      <div v-for="i in 3" :key="i" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-32"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
      Не удалось загрузить данные
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">📦</div>
        <div>
          <p class="text-slate-500 text-sm">Активные заказы</p>
          <p class="text-2xl font-bold text-slate-800">{{ stats?.active_orders_count || 0 }}</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl">✅</div>
        <div>
          <p class="text-slate-500 text-sm">Завершено заказов</p>
          <p class="text-2xl font-bold text-slate-800">{{ stats?.completed_orders_count || 0 }}</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl">💰</div>
        <div>
          <p class="text-slate-500 text-sm">Общая сумма</p>
          <p class="text-2xl font-bold text-slate-800">{{ formatPrice(stats?.total_spent || 0) }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 class="text-xl font-bold text-slate-800">Последние заказы</h2>
        <NuxtLink :to="localePath('/cabinet/orders')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Все заказы →
        </NuxtLink>
      </div>
      <div v-if="loadingOrders" class="p-6 text-center text-slate-500">Загрузка...</div>
      <div v-else-if="recentOrders.length === 0" class="p-10 text-center text-slate-500">
        У вас пока нет заказов
      </div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
            <th class="py-3 px-6 font-medium">№</th>
            <th class="py-3 px-6 font-medium">Дата</th>
            <th class="py-3 px-6 font-medium">Статус</th>
            <th class="py-3 px-6 font-medium text-right">Сумма</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="py-4 px-6">
              <NuxtLink :to="localePath(`/cabinet/orders/${order.id}`)" class="text-blue-600 hover:underline font-medium">
                {{ order.number || order.id }}
              </NuxtLink>
            </td>
            <td class="py-4 px-6 text-slate-600">{{ formatDate(order.created_at) }}</td>
            <td class="py-4 px-6">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadgeClass(order.status)">
                {{ order.status_display || order.status }}
              </span>
            </td>
            <td class="py-4 px-6 text-right font-medium text-slate-800">{{ formatPrice(order.total_amount) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCabinetApi } from '~/composables/useCabinetApi'

definePageMeta({
  layout: 'cabinet',
  middleware: 'cabinet-auth'
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()

const { fetchDashboardStats, fetchMyOrders } = useCabinetApi()

const user = computed(() => authStore.user)
const userName = computed(() => user.value?.first_name || user.value?.phone || 'Пользователь')
const userPhone = computed(() => user.value?.phone || '')
const phoneVerified = computed(() => user.value?.phone_verified)
const userInitials = computed(() => {
  const name = user.value?.first_name || ''
  const last = user.value?.last_name || ''
  if (name && last) return `${name[0]}${last[0]}`.toUpperCase()
  if (name) return name[0].toUpperCase()
  return '👤'
})

const loading = ref(true)
const error = ref(false)
const stats = ref<any>(null)

const loadingOrders = ref(true)
const recentOrders = ref<any[]>([])

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(price)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

const getStatusBadgeClass = (status: string) => {
  const s = (status || '').toLowerCase()
  if (['active', 'new', 'processing'].includes(s)) return 'bg-blue-100 text-blue-800'
  if (['completed', 'delivered'].includes(s)) return 'bg-green-100 text-green-800'
  if (['cancelled', 'canceled'].includes(s)) return 'bg-red-100 text-red-800'
  if (['pending'].includes(s)) return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-800'
}

onMounted(async () => {
  try {
    const statsData = await fetchDashboardStats()
    stats.value = statsData
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }

  try {
    const res = await fetchMyOrders({ page_size: 5 })
    recentOrders.value = res.results || []
  } catch (e) {
    console.error('Failed to load recent orders', e)
  } finally {
    loadingOrders.value = false
  }
})
</script>
