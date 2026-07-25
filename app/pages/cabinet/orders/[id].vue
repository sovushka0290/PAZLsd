<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink :to="localePath('/cabinet/orders')" class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
          ←
        </NuxtLink>
        <h1 class="text-2xl font-bold text-slate-800">Заказ {{ order?.number || route.params.id }}</h1>
        <span v-if="order" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="getStatusBadgeClass(order.status)">
          {{ order.status_display || order.status }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="space-y-6 animate-pulse">
      <div class="h-32 bg-slate-100 rounded-2xl"></div>
      <div class="h-64 bg-slate-100 rounded-2xl"></div>
    </div>

    <div v-else-if="error || !order" class="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-200">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-bold text-slate-800 mb-2">Заказ не найден</h3>
      <p class="text-slate-500 mb-6">Возможно, он был удален или вы перешли по неверной ссылке.</p>
      <NuxtLink :to="localePath('/cabinet/orders')" class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
        Вернуться к списку заказов
      </NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 class="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Информация</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-slate-500">Дата оформления:</span>
              <span class="font-medium text-slate-800">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Поставщик:</span>
              <span class="font-medium text-slate-800">{{ order.supplier?.name || 'PAZL' }}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 class="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Доставка</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-start gap-4">
              <span class="text-slate-500 whitespace-nowrap">Адрес:</span>
              <span class="font-medium text-slate-800 text-right">{{ order.delivery_address || 'Не указан' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-200">
          <h3 class="text-lg font-bold text-slate-800">Состав заказа</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th class="py-3 px-6 font-medium">Товар</th>
                <th class="py-3 px-6 font-medium text-center">Кол-во</th>
                <th class="py-3 px-6 font-medium text-right">Цена</th>
                <th class="py-3 px-6 font-medium text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id" class="border-b border-slate-100">
                <td class="py-4 px-6">
                  <div class="font-medium text-slate-800">{{ item.product_name || item.name }}</div>
                  <div v-if="item.sku" class="text-xs text-slate-500 mt-1">Артикул: {{ item.sku }}</div>
                </td>
                <td class="py-4 px-6 text-center text-slate-800">{{ item.quantity }}</td>
                <td class="py-4 px-6 text-right text-slate-600">{{ formatPrice(item.price) }}</td>
                <td class="py-4 px-6 text-right font-medium text-slate-800">{{ formatPrice(item.quantity * item.price) }}</td>
              </tr>
              <tr v-if="!order.items || order.items.length === 0">
                <td colspan="4" class="py-8 text-center text-slate-500">Нет товаров</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-6 bg-slate-50 flex justify-end">
          <div class="text-right">
            <span class="text-slate-500 mr-4">Итого к оплате:</span>
            <span class="text-2xl font-bold text-slate-800">{{ formatPrice(order.total_amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCabinetApi } from '~/composables/useCabinetApi'
import { useRoute } from '#app'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

definePageMeta({
  layout: 'cabinet',
  middleware: 'cabinet-auth'
})

const { fetchOrderById } = useCabinetApi()

const order = ref<any>(null)
const loading = ref(true)
const error = ref(false)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(price || 0)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })
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
    const id = route.params.id as string
    order.value = await fetchOrderById(id)
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
