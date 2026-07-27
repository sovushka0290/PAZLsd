<template>
  <div class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white font-extrabold">
              <UIcon name="i-lucide-shield-check" class="w-6 h-6" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900">Панель оператора</h1>
              <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Полное управление заказами, статусами и обращениями клиник</p>
            </div>
          </div>
        </div>
        <div class="flex gap-3 items-center w-full sm:w-auto">
          <UButton color="white" variant="solid" icon="i-lucide-external-link" :to="localePath('/')" class="rounded-xl font-bold">На сайт</UButton>
          <UButton color="red" variant="soft" icon="i-lucide-log-out" @click="logout" class="rounded-xl font-bold">Выйти</UButton>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="flex space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        <button 
          v-for="(tab, i) in [{ label: 'Заказы клиник', icon: 'i-lucide-shopping-bag' }, { label: 'Обращения и Отзывы', icon: 'i-lucide-message-square' }, { label: 'Конвейер каталога', icon: 'i-lucide-upload-cloud' }]" 
          :key="i"
          @click="activeTab = i"
          :class="[
            'flex items-center gap-2 px-5 py-3 text-sm font-extrabold rounded-t-2xl transition-all cursor-pointer whitespace-nowrap',
            activeTab === i ? 'bg-white text-blue-600 shadow-xs border-t-2 border-x border-slate-200 border-t-blue-600' : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          <UIcon :name="tab.icon" class="w-5 h-5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab 1: Orders -->
      <UCard v-if="activeTab === 0" class="shadow-sm rounded-3xl border border-slate-200/80 bg-white">
        <!-- Status Filter Pills -->
        <div class="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
          <UButton v-for="s in ['Все', 'Новый', 'Ждет оплаты', 'Ждет доставки', 'Завершен', 'Отказан']" :key="s"
            :color="orderFilter === s ? 'primary' : 'gray'"
            :variant="orderFilter === s ? 'solid' : 'soft'"
            @click="orderFilter = s"
            class="rounded-xl font-bold transition-all"
            size="sm"
          >
            <span v-if="s === 'Новый'" class="w-2 h-2 rounded-full bg-orange-400 mr-1 inline-block"></span>
            <span v-else-if="s === 'Ждет оплаты'" class="w-2 h-2 rounded-full bg-blue-500 mr-1 inline-block"></span>
            <span v-else-if="s === 'Ждет доставки'" class="w-2 h-2 rounded-full bg-purple-500 mr-1 inline-block"></span>
            <span v-else-if="s === 'Завершен'" class="w-2 h-2 rounded-full bg-emerald-500 mr-1 inline-block"></span>
            <span v-else-if="s === 'Отказан'" class="w-2 h-2 rounded-full bg-red-500 mr-1 inline-block"></span>
            {{ s === 'Все' ? 'Все заказы' : s }}
          </UButton>
        </div>

        <div v-if="filteredOrders.length === 0" class="py-16 text-center text-slate-400">
          <UIcon name="i-lucide-inbox" class="w-14 h-14 mx-auto mb-3 opacity-30 text-blue-500" />
          <p class="font-extrabold text-base text-slate-700">Нет заказов по выбранному фильтру</p>
          <p class="text-xs text-slate-400 mt-1">Оформите заказ в корзине или смените фильтр</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/80">
                <th class="py-3.5 px-4 rounded-tl-xl">ID Заказа</th>
                <th class="py-3.5 px-4">Дата</th>
                <th class="py-3.5 px-4">Заказчик (Клиника)</th>
                <th class="py-3.5 px-4">Сумма</th>
                <th class="py-3.5 px-4">Быстрый статус</th>
                <th class="py-3.5 px-4 text-right rounded-tr-xl">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr 
                v-for="row in filteredOrders" 
                :key="row.id" 
                class="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                @click="openOrderDetails(row)"
              >
                <!-- Order ID -->
                <td class="py-4 px-4 font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  <span class="inline-flex items-center gap-1.5 bg-slate-100 group-hover:bg-blue-100 text-slate-800 group-hover:text-blue-700 px-2.5 py-1 rounded-lg text-xs font-mono">
                    #{{ row.id }}
                  </span>
                </td>

                <!-- Date -->
                <td class="py-4 px-4 text-slate-500 text-xs font-semibold">
                  {{ formatDate(row.date) }}
                </td>

                <!-- Client / Clinic -->
                <td class="py-4 px-4">
                  <div class="flex flex-col">
                    <span class="font-extrabold text-slate-900 text-sm">{{ row.name }}</span>
                    <span class="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
                      <UIcon name="i-lucide-phone" class="w-3 h-3" />
                      {{ row.phone }}
                    </span>
                  </div>
                </td>

                <!-- Total Sum -->
                <td class="py-4 px-4 font-black text-blue-600 text-base">
                  {{ formatPrice(row.total) }} ₸
                </td>

                <!-- Quick Status Dots/Pills -->
                <td class="py-4 px-4" @click.stop>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <button
                      v-for="st in ['Новый', 'Ждет оплаты', 'Ждет доставки', 'Завершен', 'Отказан']"
                      :key="st"
                      type="button"
                      :title="`Сменить статус на: ${st}`"
                      @click="updateOrderStatus(row.id, st)"
                      :class="[
                        'px-2 py-1 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1 border cursor-pointer',
                        row.status === st 
                          ? getStatusBadgeClasses(st)
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700 opacity-65 hover:opacity-100'
                      ]"
                    >
                      <span :class="['w-1.5 h-1.5 rounded-full', getStatusDotBgClass(st)]"></span>
                      <span>{{ st }}</span>
                    </button>
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-4 px-4 text-right" @click.stop>
                  <div class="flex items-center justify-end gap-2">
                    <UButton 
                      size="xs" 
                      color="blue" 
                      variant="soft" 
                      icon="i-lucide-eye" 
                      @click="openOrderDetails(row)"
                      class="rounded-lg font-bold"
                    >
                      Детали
                    </UButton>

                    <UButton 
                      size="xs" 
                      color="red" 
                      variant="ghost" 
                      icon="i-lucide-trash-2" 
                      @click="deleteOrder(row.id)"
                      title="Удалить заказ"
                      class="rounded-lg hover:bg-red-50"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- Tab 2: Feedback -->
      <UCard v-else-if="activeTab === 1" class="shadow-sm rounded-3xl border border-slate-200/80 bg-white">
        <div class="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
          <UButton v-for="s in ['Все', 'новое', 'в работе', 'завершено']" :key="s"
            :color="feedbackFilter === s ? 'primary' : 'gray'"
            :variant="feedbackFilter === s ? 'soft' : 'ghost'"
            @click="feedbackFilter = s"
            class="rounded-xl font-bold"
            size="sm"
          >
            {{ s === 'Все' ? 'Все обращения' : s }}
          </UButton>
        </div>

        <div v-if="filteredFeedbacks.length === 0" class="py-12 text-center text-slate-400">
          <UIcon name="i-lucide-message-square" class="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
          <p class="font-bold text-slate-600">Нет обращений по выбранному фильтру</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                <th class="py-3.5 px-4">Дата</th>
                <th class="py-3.5 px-4">Контакт</th>
                <th class="py-3.5 px-4">Сообщение</th>
                <th class="py-3.5 px-4">Статус</th>
                <th class="py-3.5 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              <tr v-for="row in filteredFeedbacks" :key="row.id" class="hover:bg-slate-50 transition-colors">
                <td class="py-3.5 px-4 text-slate-500 text-xs">{{ formatDate(row.date) }}</td>
                <td class="py-3.5 px-4 font-bold text-blue-600">{{ row.contact }}</td>
                <td class="py-3.5 px-4 text-slate-700 max-w-xs truncate">{{ row.message }}</td>
                <td class="py-3.5 px-4">
                  <UBadge :color="getFeedbackStatusColor(row.status)" variant="subtle" size="sm" class="capitalize rounded-lg font-bold">
                    {{ row.status }}
                  </UBadge>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <UButton size="xs" color="primary" variant="soft" icon="i-lucide-eye" @click="openFeedbackDetails(row)" class="rounded-lg">Просмотр</UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- Tab 3: Catalog Conveyor -->
      <UCard v-else-if="activeTab === 2" class="shadow-sm rounded-3xl border border-slate-200/80 bg-white">
        <div class="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 transition-all cursor-pointer bg-slate-50 hover:bg-blue-50/50 group" @click="fileInput.click()">
          <UIcon name="i-lucide-upload-cloud" class="w-16 h-16 text-slate-400 group-hover:text-blue-600 mb-4 transition-transform group-hover:-translate-y-1" />
          <h3 class="text-xl font-extrabold text-slate-800 group-hover:text-blue-600 mb-2">Загрузить Excel прайс-лист</h3>
          <p class="text-slate-500 text-sm mb-6">Поддерживаемые форматы: .xlsx, .xls</p>
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileUpload" />
          <UButton color="blue" variant="solid" size="lg" icon="i-lucide-file-spreadsheet" class="rounded-xl font-bold shadow-md shadow-blue-500/20">Выбрать прайс-лист</UButton>
        </div>
      </UCard>
    </div>

    <!-- Модальное окно ПОЛНОЙ информации о заказе -->
    <UModal v-model="isOrderModalOpen" :ui="{ width: 'sm:max-w-2xl' }">
      <div v-if="selectedOrder" class="bg-white rounded-3xl p-6 sm:p-8 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">#{{ selectedOrder.id }}</span>
              <UBadge :color="getStatusColor(selectedOrder.status)" variant="solid" class="rounded-lg font-bold">
                {{ selectedOrder.status }}
              </UBadge>
            </div>
            <p class="text-xs text-slate-400 font-semibold mt-1">Оформлен: {{ formatDate(selectedOrder.date) }}</p>
          </div>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" class="rounded-xl" @click="isOrderModalOpen = false" />
        </div>

        <!-- Info Grid (Client & Supplier) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Client Card -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
            <div class="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              <UIcon name="i-lucide-building-2" class="w-4 h-4 text-blue-600" />
              <span>Заказчик (Клиника)</span>
            </div>
            <div class="font-extrabold text-slate-900 text-base">{{ selectedOrder.name }}</div>
            <div class="text-xs font-bold text-blue-600 flex items-center gap-1">
              <UIcon name="i-lucide-phone" class="w-3.5 h-3.5" />
              {{ selectedOrder.phone }}
            </div>
            <div class="text-xs text-slate-500 font-medium flex items-center gap-1">
              <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-slate-400" />
              {{ selectedOrder.address || 'г. Алматы' }}
            </div>
          </div>

          <!-- Supplier Card -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
            <div class="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              <UIcon name="i-lucide-truck" class="w-4 h-4 text-emerald-600" />
              <span>Поставщик и Склад</span>
            </div>
            <div class="font-extrabold text-slate-900 text-base">ТОО «Стома Поставщик»</div>
            <div class="text-xs text-slate-500 font-medium flex items-center gap-1">
              <UIcon name="i-lucide-warehouse" class="w-3.5 h-3.5 text-emerald-600" />
              Центральный склад (Алматы)
            </div>
            <div class="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              Прямая отгрузка PAZL
            </div>
          </div>
        </div>

        <!-- Order Items Table -->
        <div>
          <h4 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-3">Состав заказа</h4>
          <div class="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
            <div 
              v-for="(item, idx) in selectedOrder.items" 
              :key="idx" 
              class="flex items-center justify-between p-3.5 bg-slate-50/40 hover:bg-slate-50 text-sm transition-colors"
            >
              <div class="font-bold text-slate-800 pr-2 max-w-xs">{{ item.name }}</div>
              <div class="text-right shrink-0">
                <span class="text-xs font-semibold text-slate-500 block">{{ item.quantity }} шт × {{ formatPrice(item.price) }} ₸</span>
                <span class="font-extrabold text-blue-600 text-sm">{{ formatPrice(item.price * item.quantity) }} ₸</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Sum Accent Box -->
        <div class="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl flex items-center justify-between">
          <span class="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Итого к оплате:</span>
          <span class="text-2xl font-black text-blue-600 leading-none">{{ formatPrice(selectedOrder.total) }} ₸</span>
        </div>

        <!-- Status Action Buttons in Modal -->
        <div class="pt-2 border-t border-slate-100 space-y-3">
          <label class="block text-xs font-extrabold uppercase text-slate-400 tracking-wider">Быстро изменить статус:</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="st in ['Новый', 'Ждет оплаты', 'Ждет доставки', 'Завершен', 'Отказан']"
              :key="st"
              type="button"
              @click="updateOrderStatus(selectedOrder.id, st)"
              :class="[
                'px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer',
                selectedOrder.status === st 
                  ? getStatusBadgeClasses(st)
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              ]"
            >
              <span :class="['w-2 h-2 rounded-full', getStatusDotBgClass(st)]"></span>
              {{ st }}
            </button>
          </div>
        </div>

        <!-- Footer Modal Controls -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-100">
          <UButton 
            color="red" 
            variant="soft" 
            icon="i-lucide-trash-2" 
            @click="deleteOrder(selectedOrder.id)"
            class="rounded-xl font-bold"
          >
            Удалить заказ
          </UButton>
          <UButton 
            color="gray" 
            variant="solid" 
            @click="isOrderModalOpen = false"
            class="rounded-xl font-bold"
          >
            Закрыть
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Модальное окно Деталей отзыва -->
    <UModal v-model="isFeedbackModalOpen">
      <div v-if="selectedFeedback" class="bg-white rounded-3xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-lg font-bold text-slate-900">Обращение от {{ selectedFeedback.contact }}</h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" class="rounded-xl" @click="isFeedbackModalOpen = false" />
        </div>
        
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <UBadge :color="getFeedbackStatusColor(selectedFeedback.status)" variant="subtle">{{ selectedFeedback.status }}</UBadge>
            <span class="text-xs text-slate-400">{{ formatDate(selectedFeedback.date) }}</span>
          </div>
          
          <div class="bg-slate-50 p-4 rounded-2xl text-sm text-slate-700 leading-relaxed font-medium">
            {{ selectedFeedback.message }}
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['admin-auth']
})

const localePath = useLocalePath()
const authStore = useAuthStore()
const toast = useToast()

const activeTab = ref(0)
const orderFilter = ref('Все')
const feedbackFilter = ref('Все')

// Modals state
const isOrderModalOpen = ref(false)
const selectedOrder = ref<any>(null)

const isFeedbackModalOpen = ref(false)
const selectedFeedback = ref<any>(null)

const uploading = ref(false)
const fileInput = ref<any>(null)

function formatDate(d: string | undefined): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return d
  }
}

function formatPrice(val: number | undefined): string {
  if (val === undefined || val === null) return '0'
  return new Intl.NumberFormat('ru-RU').format(val)
}

function normalizeStatus(s: any): string {
  if (!s) return 'Новый'
  const lower = String(s).toLowerCase()
  if (lower.includes('new') || lower.includes('нов')) return 'Новый'
  if (lower.includes('pay') || lower.includes('оплат')) return 'Ждет оплаты'
  if (lower.includes('ship') || lower.includes('достав') || lower.includes('процесс')) return 'Ждет доставки'
  if (lower.includes('complete') || lower.includes('заверш') || lower.includes('доставлен')) return 'Завершен'
  if (lower.includes('cancel') || lower.includes('отказ') || lower.includes('отмен')) return 'Отказан'
  return String(s)
}

const defaultOperatorOrders = [
  {
    id: 'ORD-501',
    date: new Date(Date.now() - 3600000 * 1).toISOString(),
    name: 'Стоматология «Ару Дент»',
    phone: '+7 (707) 123-45-67',
    contact: '+7 (707) 123-45-67',
    total: 185000,
    status: 'Новый',
    address: 'г. Алматы, ул. Достык 105',
    items: [
      { name: 'TG6 машинные файлы для обработки каналов', quantity: 4, price: 5625 },
      { name: 'Стоматологический реставрационный композит', quantity: 2, price: 24500 }
    ]
  },
  {
    id: 'ORD-502',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    name: 'Клиника «Smile Pro»',
    phone: '+7 (777) 987-65-43',
    contact: '+7 (777) 987-65-43',
    total: 480000,
    status: 'Ждет оплаты',
    address: 'г. Астана, пр. Кабанбай батыра 21',
    items: [
      { name: 'Бестеневая светодиодная лампа LED Smile', quantity: 1, price: 480000 }
    ]
  },
  {
    id: 'ORD-503',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
    name: 'Стоматологический центр «Дент Плюс»',
    phone: '+7 (701) 555-12-34',
    contact: '+7 (701) 555-12-34',
    total: 135000,
    status: 'Завершен',
    address: 'г. Шымкент, ул. Трасса 12',
    items: [
      { name: 'Ультразвуковой скайлер Woodpecker UDS-E', quantity: 1, price: 135000 }
    ]
  }
]

const { data: ordersData, pending: pendingOrders, refresh: refreshOrders } = await useAsyncData('operator-orders', async () => {
  let results: any[] = []
  try {
    const res = await $fetch('/api/v2/operator/orders/')
    results = Array.isArray((res as any)?.results) ? (res as any).results : (Array.isArray(res) ? res : [])
  } catch (e) {
    console.warn('[Operator] Orders fetch issue:', e)
  }

  if (import.meta.client) {
    try {
      const local = JSON.parse(localStorage.getItem('mock_orders') || '[]')
      if (local.length > 0) {
        const formattedLocal = local.map((o: any) => ({
          id: o.id,
          date: o.date || new Date().toISOString(),
          name: o.name || 'Клиент',
          phone: o.phone || '+7 (707) 123-45-67',
          contact: o.contact || o.phone || '+7 (707) 123-45-67',
          total: o.total || 0,
          status: normalizeStatus(o.status),
          address: o.address || 'г. Алматы',
          items: o.items || []
        }))
        const existingIds = new Set(results.map((r: any) => String(r.id)))
        const newFromLocal = formattedLocal.filter((l: any) => !existingIds.has(String(l.id)))
        results = [...newFromLocal, ...results]
      }
    } catch(e) {}
  }

  if (!results || results.length === 0) {
    results = defaultOperatorOrders
  } else {
    const existingIds = new Set(results.map((r: any) => String(r.id)))
    const missingDefaults = defaultOperatorOrders.filter((d: any) => !existingIds.has(String(d.id)))
    results = [...results, ...missingDefaults]
  }

  return results.map((o: any) => ({
    ...o,
    status: normalizeStatus(o.status)
  }))
})

const orders = computed(() => Array.isArray(ordersData.value) ? ordersData.value : (ordersData.value?.results || []))

const { data: feedbacks, pending: pendingFeedbacks, refresh: refreshFeedbacks } = await useAsyncData('feedbacks', () => {
  if (authStore.isAuthenticated) return $fetch('/api/feedback')
  return []
}, { watch: [() => authStore.isAuthenticated] })

onMounted(() => {
  refreshOrders()
})

const filteredOrders = computed(() => {
  if (!orders.value) return []
  let list = [...orders.value]
  if (orderFilter.value !== 'Все') {
    list = list.filter(o => normalizeStatus(o.status) === normalizeStatus(orderFilter.value))
  }
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const filteredFeedbacks = computed(() => {
  if (!feedbacks.value) return []
  let list = [...feedbacks.value]
  if (feedbackFilter.value !== 'Все') list = list.filter(f => f.status === feedbackFilter.value)
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

function openOrderDetails(order: any) {
  selectedOrder.value = order
  isOrderModalOpen.value = true
}

function openFeedbackDetails(feedback: any) {
  selectedFeedback.value = feedback
  isFeedbackModalOpen.value = true
}

function updateOrderStatus(id: string, newStatus: string) {
  try {
    if (ordersData.value) {
      const list = Array.isArray(ordersData.value) ? ordersData.value : (ordersData.value as any)?.results
      if (list) {
        const item = list.find((o: any) => String(o.id) === String(id))
        if (item) {
          item.status = newStatus
        }
      }
    }
    if (selectedOrder.value && String(selectedOrder.value.id) === String(id)) {
      selectedOrder.value.status = newStatus
    }
    if (import.meta.client) {
      const local = JSON.parse(localStorage.getItem('mock_orders') || '[]')
      const item = local.find((o: any) => String(o.id) === String(id))
      if (item) {
        item.status = newStatus
        localStorage.setItem('mock_orders', JSON.stringify(local))
      }
    }
    toast.add({ title: `Статус заказа изменено на "${newStatus}"`, color: 'green', icon: 'i-lucide-check-circle' })
  } catch (e) {
    console.error('Update status error', e)
  }
}

function deleteOrder(id: string) {
  if (!confirm(`Вы уверены, что хотите безвозвратно удалить заказ #${id}?`)) return
  try {
    if (import.meta.client) {
      const local = JSON.parse(localStorage.getItem('mock_orders') || '[]')
      const updated = local.filter((o: any) => String(o.id) !== String(id))
      localStorage.setItem('mock_orders', JSON.stringify(updated))
    }
    if (ordersData.value) {
      if (Array.isArray(ordersData.value)) {
        ordersData.value = ordersData.value.filter((o: any) => String(o.id) !== String(id))
      }
    }
    if (selectedOrder.value && String(selectedOrder.value.id) === String(id)) {
      isOrderModalOpen.value = false
    }
    toast.add({ title: 'Заказ успешно удален', color: 'gray', icon: 'i-lucide-trash' })
  } catch (e) {
    console.error('Delete order error', e)
  }
}

function getStatusColor(status: string) {
  switch (normalizeStatus(status)) {
    case 'Новый': return 'orange'
    case 'Ждет оплаты': return 'blue'
    case 'Ждет доставки': return 'purple'
    case 'Завершен': return 'emerald'
    case 'Отказан': return 'red'
    default: return 'gray'
  }
}

function getStatusDotBgClass(status: string) {
  switch (normalizeStatus(status)) {
    case 'Новый': return 'bg-orange-500'
    case 'Ждет оплаты': return 'bg-blue-500'
    case 'Ждет доставки': return 'bg-purple-500'
    case 'Завершен': return 'bg-emerald-500'
    case 'Отказан': return 'bg-red-500'
    default: return 'bg-slate-400'
  }
}

function getStatusBadgeClasses(status: string) {
  switch (normalizeStatus(status)) {
    case 'Новый': return 'bg-orange-500 text-white border-orange-500 shadow-xs'
    case 'Ждет оплаты': return 'bg-blue-600 text-white border-blue-600 shadow-xs'
    case 'Ждет доставки': return 'bg-purple-600 text-white border-purple-600 shadow-xs'
    case 'Завершен': return 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
    case 'Отказан': return 'bg-red-600 text-white border-red-600 shadow-xs'
    default: return 'bg-slate-600 text-white border-slate-600'
  }
}

function getFeedbackStatusColor(status: string) {
  switch (status) {
    case 'новое': return 'orange'
    case 'в работе': return 'blue'
    case 'завершено': return 'emerald'
    default: return 'gray'
  }
}

async function handleFileUpload(event: any) {
  const file = event.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  uploading.value = true
  try {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiBaseUrl
    const url = `${baseUrl}/api/v2/operator/upload-catalog/`
    await $fetch(url, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Token ${authStore.token}` }
    })
    toast.add({ title: 'Файл отправлен на конвейер!', description: 'Каталог обновится автоматически.', color: 'green', icon: 'i-lucide-check-circle' })
  } catch (e: any) {
    toast.add({ title: 'Ошибка загрузки', description: e.message, color: 'red', icon: 'i-lucide-x-circle' })
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function logout() {
  authStore.logout()
}

useHead({ title: 'Панель оператора | PAZL' })
</script>
