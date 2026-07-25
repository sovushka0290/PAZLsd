<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">Дашборд поставщика</h1>
      <NuxtLink :to="localePath('/')" class="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
        Вернуться в магазин
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <p class="text-sm font-medium text-slate-500">Заказы (всего)</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">
          <span v-if="isLoading" class="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" />
          <template v-else>{{ kpis.new_orders }}</template>
        </p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <p class="text-sm font-medium text-slate-500">Товары в каталоге</p>
        <p class="text-3xl font-bold text-slate-900 mt-2">
          <span v-if="isLoading" class="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" />
          <template v-else>{{ kpis.total_products }}</template>
        </p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <p class="text-sm font-medium text-slate-500">Сумма продаж</p>
        <p class="text-3xl font-bold text-green-600 mt-2">
          <span v-if="isLoading" class="inline-block w-12 h-8 bg-slate-100 rounded animate-pulse" />
          <template v-else>{{ formatPrice(kpis.total_sales) }} ₸</template>
        </p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <p class="text-sm font-medium text-slate-500">Рейтинг</p>
        <p class="text-3xl font-bold text-amber-500 mt-2">{{ kpis.rating.toFixed(1) }} ⭐</p>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Orders -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900">Последние заказы</h2>
          <NuxtLink :to="localePath('/supplier/orders')" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Все заказы</NuxtLink>
        </div>

        <div v-if="isLoadingOrders" class="p-6 space-y-3">
          <div v-for="i in 3" :key="i" class="h-12 bg-slate-50 rounded-lg animate-pulse" />
        </div>
        <div v-else-if="recentOrders.length === 0" class="p-8 text-center text-slate-500">
          У вас пока нет новых заказов.
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
                #{{ order.contractor_number || order.id }}
              </div>
              <div>
                <p class="font-medium text-slate-900 text-sm">{{ order.buyer_name || order.contractor_name || 'Покупатель' }}</p>
                <p class="text-xs text-slate-500">{{ formatDate(order.date_created) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="px-2.5 py-1 rounded-full text-xs font-medium"
                :class="statusColor(order.status_name || order.status)"
              >
                {{ order.status_name || order.status_display || order.status }}
              </span>
              <span class="text-sm font-bold text-slate-900">{{ formatPrice(order.order_sum) }} ₸</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Info -->
      <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-bold text-slate-900 mb-4">Быстрые действия</h2>
          <div class="space-y-3">
            <NuxtLink :to="localePath('/supplier/products')" class="w-full flex items-center p-3 text-left bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors group border border-slate-100">
              <span class="text-2xl mr-3">🏷️</span>
              <div>
                <p class="font-medium text-slate-900 group-hover:text-blue-700">Мои товары</p>
                <p class="text-xs text-slate-500">Управление каталогом</p>
              </div>
            </NuxtLink>
            <NuxtLink :to="localePath('/supplier/orders')" class="w-full flex items-center p-3 text-left bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors group border border-slate-100">
              <span class="text-2xl mr-3">📦</span>
              <div>
                <p class="font-medium text-slate-900 group-hover:text-blue-700">Заказы</p>
                <p class="text-xs text-slate-500">Входящие заказы от покупателей</p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-sm p-6 text-white">
          <h3 class="font-bold mb-2">Добро пожаловать в PAZL!</h3>
          <p class="text-blue-100 text-sm mb-4">
            Ваш магазин успешно активирован. Загружайте товары и начните получать заказы от клиник.
          </p>
          <NuxtLink :to="localePath('/supplier/profile')" class="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
            Настройки профиля
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSupplierApi } from '~/composables/useSupplierApi'

definePageMeta({
  layout: 'cabinet',
  middleware: 'cabinet-auth'
})

const localePath = useLocalePath()
const { fetchDashboardKPIs, fetchSupplierOrders } = useSupplierApi()

const isLoading = ref(true)
const isLoadingOrders = ref(true)
const kpis = ref({ new_orders: 0, total_products: 0, total_sales: 0 as number | string, rating: 5.0 })
const recentOrders = ref<any[]>([])

onMounted(async () => {
  const [kpiData, ordersData] = await Promise.all([
    fetchDashboardKPIs(),
    fetchSupplierOrders({ page_size: 5 })
  ])
  kpis.value = kpiData
  isLoading.value = false
  recentOrders.value = ordersData.results
  isLoadingOrders.value = false
})

function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  return num.toLocaleString('ru-RU')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function statusColor(status: string): string {
  const s = String(status).toLowerCase()
  if (s.includes('новый') || s.includes('new') || s === '18') return 'bg-blue-100 text-blue-700'
  if (s.includes('обработ') || s.includes('process') || s === '1') return 'bg-amber-100 text-amber-700'
  if (s.includes('отгруж') || s.includes('ship') || s === '4') return 'bg-indigo-100 text-indigo-700'
  if (s.includes('закрыт') || s.includes('closed') || s.includes('заверш') || s === '10') return 'bg-green-100 text-green-700'
  if (s.includes('отмен') || s.includes('cancel') || s === '15') return 'bg-red-100 text-red-700'
  return 'bg-slate-100 text-slate-700'
}
</script>
