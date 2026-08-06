<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Clinic Profile Welcome Banner -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div class="flex items-start sm:items-center gap-4 sm:gap-5">
          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md shadow-blue-500/20 shrink-0">
            🏥
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900">
                {{ clinicName }}
              </h1>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                ✅ Клиника верифицирована
              </span>
            </div>
            <p class="text-slate-500 text-sm mt-1 flex items-center gap-2 flex-wrap font-medium">
              <span>📱 {{ clinicPhone }}</span>
              <span v-if="contactPerson" class="text-slate-300">•</span>
              <span v-if="contactPerson">👤 {{ contactPerson }}</span>
              <span v-if="clinicAddress" class="text-slate-300">•</span>
              <span v-if="clinicAddress">📍 {{ clinicAddress }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            :to="localePath('/')"
            class="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <span>🛍️ В каталог товаров</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex items-center gap-4">
        <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
          📦
        </div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Активные заказы</p>
          <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{{ activeOrdersCount }}</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex items-center gap-4">
        <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
          ✅
        </div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Завершено заказов</p>
          <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{{ completedOrdersCount }}</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex items-center gap-4">
        <div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
          💰
        </div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Сумма покупок</p>
          <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{{ formatPrice(totalSpent) }}</p>
        </div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 class="text-lg font-black text-slate-900">История заказов</h2>
          <p class="text-xs text-slate-500 font-medium">Все заказы сохраняются на сервере в реальном времени</p>
        </div>
        <NuxtLink :to="localePath('/cabinet/orders')" class="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          Все заказы →
        </NuxtLink>
      </div>

      <div v-if="loadingOrders" class="p-8 text-center text-slate-400 font-medium">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        Загрузка заказов...
      </div>

      <div v-else-if="orders.length === 0" class="p-12 text-center text-slate-500">
        <div class="text-5xl mb-3">🛍️</div>
        <h3 class="text-base font-bold text-slate-800">У вас пока нет оформленных заказов</h3>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Перейдите в каталог стоматологических товаров, добавьте позиции в корзину и оформите первый заказ.
        </p>
        <NuxtLink :to="localePath('/')" class="inline-block mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
          Перейти к покупкам
        </NuxtLink>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr class="bg-slate-50/80 text-slate-400 text-xs font-extrabold uppercase tracking-wider border-b border-slate-100">
              <th class="py-3.5 px-6">№ Заказа</th>
              <th class="py-3.5 px-6">Дата</th>
              <th class="py-3.5 px-6">Товары</th>
              <th class="py-3.5 px-6">Статус</th>
              <th class="py-3.5 px-6 text-right">Сумма</th>
              <th class="py-3.5 px-6 text-center">Действие</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="order in orders.slice(0, 5)" :key="order.id" class="hover:bg-slate-50/70 transition-colors">
              <td class="py-4 px-6 font-bold text-slate-900">
                #{{ order.id }}
              </td>
              <td class="py-4 px-6 text-slate-600 text-xs font-medium">
                {{ formatDate(order.date || order.date_created || order.created_at) }}
              </td>
              <td class="py-4 px-6 text-slate-600 text-xs font-medium max-w-xs truncate">
                <span v-if="order.items && order.items.length > 0">
                  {{ order.items[0]?.name || order.items[0]?.product_name }}
                  <span v-if="order.items.length > 1" class="text-slate-400">
                    (+ ещё {{ order.items.length - 1 }})
                  </span>
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" :class="getStatusBadgeClass(order.status)">
                  {{ order.status_display || order.status || 'Новый' }}
                </span>
              </td>
              <td class="py-4 px-6 text-right font-black text-slate-900">
                {{ formatPrice(order.total || order.total_amount || order.order_sum || 0) }}
              </td>
              <td class="py-4 px-6 text-center">
                <NuxtLink
                  :to="localePath(`/cabinet/orders/${order.id}`)"
                  class="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors"
                >
                  Детали →
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useFormattedPrice } from '~/composables/useFormattedPrice'

definePageMeta({
  layout: 'cabinet',
  middleware: 'cabinet-auth'
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const formatPrice = useFormattedPrice()

const user = computed(() => authStore.user)
const clinicName = computed(() => user.value?.company_name || user.value?.first_name || 'Стоматологическая клиника')
const clinicPhone = computed(() => user.value?.phone || '+7 (707) 123-45-67')
const contactPerson = computed(() => user.value?.last_name || '')
const clinicAddress = computed(() => (user.value as any)?.address || '')

const loadingOrders = ref(true)
const orders = ref<any[]>([])

const activeOrdersCount = computed(() => {
  return orders.value.filter(o => {
    const s = String(o.status || '').toLowerCase()
    return s.includes('нов') || s.includes('обработ') || s.includes('active') || s.includes('new') || s.includes('process')
  }).length
})

const completedOrdersCount = computed(() => {
  return orders.value.filter(o => {
    const s = String(o.status || '').toLowerCase()
    return s.includes('заверш') || s.includes('отгруж') || s.includes('достав') || s.includes('completed')
  }).length
})

const totalSpent = computed(() => {
  return orders.value.reduce((sum, o) => sum + (Number(o.total || o.total_amount || o.order_sum) || 0), 0)
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

const getStatusBadgeClass = (status: string) => {
  const s = String(status || '').toLowerCase()
  if (s.includes('нов') || s.includes('new') || s.includes('active')) return 'bg-blue-100 text-blue-800'
  if (s.includes('обработ') || s.includes('process') || s.includes('pending')) return 'bg-amber-100 text-amber-800'
  if (s.includes('заверш') || s.includes('отгруж') || s.includes('достав') || s.includes('completed')) return 'bg-emerald-100 text-emerald-800'
  if (s.includes('отмен') || s.includes('cancel')) return 'bg-red-100 text-red-800'
  return 'bg-slate-100 text-slate-700'
}

onMounted(async () => {
  try {
    const res = await $fetch<any[]>('/api/orders')
    orders.value = res || []
  } catch (e) {
    console.error('Failed to load orders', e)
    orders.value = []
  } finally {
    loadingOrders.value = false
  }
})
</script>
