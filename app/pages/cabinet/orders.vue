<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Мои заказы</h1>
      <div class="w-64">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Поиск по номеру..." 
          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="loadOrders(1)"
        >
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-2 border-b border-slate-200">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        @click="currentStatus = tab.value; loadOrders(1)"
        class="px-4 py-2 font-medium text-sm transition-colors border-b-2"
        :class="currentStatus === tab.value ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-6 space-y-4 animate-pulse">
        <div v-for="i in 5" :key="i" class="h-12 bg-slate-100 rounded-lg"></div>
      </div>
      
      <div v-else-if="orders.length === 0" class="p-16 text-center flex flex-col items-center">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Заказов не найдено</h3>
        <p class="text-slate-500">По вашему запросу нет заказов.</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th class="py-4 px-6 font-medium">№ заказа</th>
                <th class="py-4 px-6 font-medium">Дата</th>
                <th class="py-4 px-6 font-medium">Поставщик</th>
                <th class="py-4 px-6 font-medium">Статус</th>
                <th class="py-4 px-6 font-medium text-right">Сумма</th>
                <th class="py-4 px-6 font-medium text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="py-4 px-6 font-medium text-slate-800">
                  {{ order.number || order.id }}
                </td>
                <td class="py-4 px-6 text-slate-600">
                  {{ formatDate(order.created_at) }}
                </td>
                <td class="py-4 px-6 text-slate-600">
                  {{ order.supplier?.name || 'PAZL' }}
                </td>
                <td class="py-4 px-6">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadgeClass(order.status)">
                    {{ order.status_display || order.status }}
                  </span>
                </td>
                <td class="py-4 px-6 text-right font-bold text-slate-800">
                  {{ formatPrice(order.total_amount) }}
                </td>
                <td class="py-4 px-6 text-center">
                  <NuxtLink :to="localePath(`/cabinet/orders/${order.id}`)" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Подробнее →
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="p-4 border-t border-slate-200 flex items-center justify-between">
          <button 
            @click="loadOrders(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          <span class="text-sm text-slate-500">Страница {{ currentPage }} из {{ totalPages }}</span>
          <button 
            @click="loadOrders(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вперед
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCabinetApi } from '~/composables/useCabinetApi'

const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  layout: 'cabinet',
  middleware: 'cabinet-auth'
})

const { fetchMyOrders } = useCabinetApi()

const tabs = [
  { label: 'Все', value: '' },
  { label: 'Активные', value: 'active' },
  { label: 'Завершённые', value: 'completed' },
  { label: 'Отменённые', value: 'cancelled' }
]

const currentStatus = ref('')
const searchQuery = ref('')
const orders = ref<any[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(price || 0)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })
}

const getStatusBadgeClass = (status: string) => {
  const s = (status || '').toLowerCase()
  if (['active', 'new', 'processing'].includes(s)) return 'bg-blue-100 text-blue-800'
  if (['completed', 'delivered'].includes(s)) return 'bg-green-100 text-green-800'
  if (['cancelled', 'canceled'].includes(s)) return 'bg-red-100 text-red-800'
  if (['pending'].includes(s)) return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-800'
}

const loadOrders = async (page = 1) => {
  loading.value = true
  try {
    const params: any = { page, page_size: 10 }
    if (currentStatus.value) params.status = currentStatus.value
    if (searchQuery.value) params.search = searchQuery.value
    
    const res = await fetchMyOrders(params)
    orders.value = res.results || []
    currentPage.value = page
    totalPages.value = Math.ceil((res.count || 0) / 10) || 1
  } catch (e) {
    console.error(e)
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>
