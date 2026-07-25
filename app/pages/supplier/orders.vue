<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupplierApi } from '~/composables/useSupplierApi'

definePageMeta({ layout: 'cabinet', middleware: 'cabinet-auth' })

const { t } = useI18n()
const { fetchSupplierOrders, updateOrderStatus } = useSupplierApi()

const loading = ref(false)
const orders = ref<SupplierOrder[]>([])
const error = ref<string | null>(null)

const activeTab = ref('all')
const tabs = [
  { id: 'all', name: 'Все' },
  { id: 'new', name: 'Новые' },
  { id: 'processing', name: 'В обработке' },
  { id: 'shipped', name: 'Отгружено' },
  { id: 'completed', name: 'Завершено' },
]

const searchQuery = ref('')
const page = ref(1)

const totalOrders = ref(0)

const fetchOrders = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetchSupplierOrders({ 
      status: activeTab.value !== 'all' ? activeTab.value : undefined,
      search: searchQuery.value,
      page: page.value
    })
    orders.value = response.results || []
    totalOrders.value = response.count || 0
  } catch (err: any) {
    error.value = err.message || 'Ошибка загрузки заказов'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    processing: 'bg-amber-100 text-amber-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return map[status] || 'bg-slate-100 text-slate-800'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    new: 'Новый',
    processing: 'В обработке',
    shipped: 'Отгружен',
    completed: 'Завершен',
    cancelled: 'Отменен'
  }
  return map[status] || status
}

const changeStatus = async (id: number | string, newStatus: string) => {
  try {
    await updateOrderStatus(id, newStatus)
    fetchOrders()
  } catch (err) {
    console.error('Failed to update status', err)
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-semibold text-slate-900">📦 Входящие заказы</h1>
      <div class="relative w-full md:w-64">
        <input 
          v-model="searchQuery" 
          @keyup.enter="fetchOrders"
          type="text" 
          placeholder="Поиск заказов..." 
          class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
        <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200">
      <nav class="-mb-px flex space-x-8 overflow-x-auto">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id; fetchOrders()"
          :class="[
            activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Error state -->
    <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl">
      ❌ {{ error }}
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse flex space-x-4">
        <div class="h-10 bg-slate-200 rounded w-full"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="orders.length > 0" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">№ Заказа</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Покупатель</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Дата</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Статус</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Сумма</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{{ order.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ order.buyerName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ order.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(order.status)]">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ order.total }} ₸</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button v-if="order.status === 'new'" @click="changeStatus(order.id, 'processing')" class="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg transition-colors">Принять</button>
                  <button v-if="order.status === 'processing'" @click="changeStatus(order.id, 'shipped')" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg transition-colors">Отгрузить</button>
                  <button v-if="order.status === 'shipped'" @click="changeStatus(order.id, 'completed')" class="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg transition-colors">Завершить</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-slate-700">
              Показано от <span class="font-medium">1</span> до <span class="font-medium">10</span>
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                Назад
              </button>
              <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                Вперед
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <div class="text-4xl mb-4">📭</div>
      <h3 class="text-lg font-medium text-slate-900 mb-1">Нет заказов</h3>
      <p class="text-slate-500">В данной категории пока нет заказов.</p>
    </div>
  </div>
</template>
