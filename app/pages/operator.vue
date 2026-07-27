<template>
  <div class="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8 pb-20 sm:pb-8">
    <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
      <!-- Top Bar / Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs gap-3">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white font-extrabold">
            <UIcon name="i-lucide-shield-check" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-lg sm:text-2xl font-black text-slate-900 leading-tight">Панель оператора</h1>
            <p class="text-xs text-slate-500 font-medium">Управление заказами и обращениями клиник</p>
          </div>
        </div>
        
        <div class="flex gap-2 items-center w-full sm:w-auto justify-end">
          <UButton color="white" variant="solid" icon="i-lucide-external-link" :to="localePath('/')" size="sm" class="rounded-xl font-bold">На сайт</UButton>
          <UButton color="red" variant="soft" icon="i-lucide-log-out" @click="logout" size="sm" class="rounded-xl font-bold">Выйти</UButton>
        </div>
      </div>

      <!-- Navigation Tabs (Mobile Scrollable) -->
      <div class="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1 no-scrollbar">
        <button 
          v-for="(tab, i) in [{ label: 'Заказы клиник', icon: 'i-lucide-shopping-bag' }, { label: 'Обращения', icon: 'i-lucide-message-square' }, { label: 'Конвейер прайсов', icon: 'i-lucide-upload-cloud' }]" 
          :key="i"
          @click="activeTab = i"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-t-xl transition-all cursor-pointer whitespace-nowrap shrink-0',
            activeTab === i ? 'bg-white text-blue-600 shadow-xs border-t-2 border-x border-slate-200 border-t-blue-600' : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          <UIcon :name="tab.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- TAB 0: ORDERS -->
      <div v-if="activeTab === 0" class="space-y-4">
        <!-- Status Filter Pills (Scrollable on Mobile) -->
        <div class="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-x-auto">
          <div class="flex gap-1.5 sm:gap-2 min-w-max">
            <button
              v-for="s in ['Все', 'Новый', 'Ждет оплаты', 'Ждет доставки', 'Завершен', 'Отказан']"
              :key="s"
              type="button"
              @click="orderFilter = s"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                orderFilter === s 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              <span :class="['w-2 h-2 rounded-full', getStatusDotBgClass(s)]"></span>
              <span>{{ s === 'Все' ? 'Все заказы' : s }}</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredOrders.length === 0" class="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-2 opacity-30 text-blue-500" />
          <p class="font-extrabold text-sm text-slate-700">Нет заказов по выбранному фильтру</p>
          <p class="text-xs text-slate-400 mt-1">Оформите заказ в корзине или смените фильтр</p>
        </div>

        <!-- MOBILE VIEW (< md): Responsive Order Cards -->
        <div v-else class="block md:hidden space-y-3">
          <div 
            v-for="row in filteredOrders" 
            :key="row.id"
            @click="openOrderDetails(row)"
            class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-500 active:scale-99 transition-all cursor-pointer space-y-3"
          >
            <!-- Card Header: ID & Status -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span class="text-xs font-mono font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                #{{ row.id }}
              </span>
              <UBadge :color="getStatusColor(row.status)" variant="solid" size="xs" class="rounded-md font-extrabold">
                {{ row.status }}
              </UBadge>
            </div>

            <!-- Client / Clinic Details -->
            <div class="space-y-1">
              <div class="font-extrabold text-slate-900 text-base leading-snug">
                {{ row.name }}
              </div>
              <div class="text-xs font-bold text-blue-600 flex items-center gap-1">
                <UIcon name="i-lucide-phone" class="w-3.5 h-3.5" />
                {{ row.phone }}
              </div>
              <div class="text-xs text-slate-400 font-medium truncate flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span class="truncate">{{ row.address || 'г. Алматы' }}</span>
              </div>
            </div>

            <!-- Card Footer: Total Price & Tap Prompt -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Сумма заказа</span>
                <span class="text-lg font-black text-blue-600 leading-none">{{ formatPrice(row.total) }} ₸</span>
              </div>

              <div class="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                <span>Подробнее</span>
                <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <!-- DESKTOP VIEW (>= md): Table -->
        <div class="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="border-b border-slate-200 text-xs font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th class="py-3.5 px-4">ID Заказа</th>
                  <th class="py-3.5 px-4">Дата</th>
                  <th class="py-3.5 px-4">Заказчик (Клиника)</th>
                  <th class="py-3.5 px-4">Сумма</th>
                  <th class="py-3.5 px-4">Быстрый статус</th>
                  <th class="py-3.5 px-4 text-right">Действие</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr 
                  v-for="row in filteredOrders" 
                  :key="row.id" 
                  class="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  @click="openOrderDetails(row)"
                >
                  <td class="py-4 px-4 font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    <span class="inline-flex items-center gap-1 bg-slate-100 group-hover:bg-blue-100 text-slate-800 group-hover:text-blue-700 px-2.5 py-1 rounded-lg text-xs font-mono">
                      #{{ row.id }}
                    </span>
                  </td>
                  <td class="py-4 px-4 text-slate-500 text-xs font-semibold">
                    {{ formatDate(row.date) }}
                  </td>
                  <td class="py-4 px-4">
                    <div class="flex flex-col">
                      <span class="font-extrabold text-slate-900 text-sm">{{ row.name }}</span>
                      <span class="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
                        <UIcon name="i-lucide-phone" class="w-3 h-3" />
                        {{ row.phone }}
                      </span>
                    </div>
                  </td>
                  <td class="py-4 px-4 font-black text-blue-600 text-base">
                    {{ formatPrice(row.total) }} ₸
                  </td>
                  <td class="py-4 px-4" @click.stop>
                    <div class="flex items-center gap-1 flex-wrap">
                      <button
                        v-for="st in ['Новый', 'Ждет оплаты', 'Ждет доставки', 'Завершен', 'Отказан']"
                        :key="st"
                        type="button"
                        @click="updateOrderStatus(row.id, st)"
                        :class="[
                          'px-2 py-1 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1 border cursor-pointer',
                          row.status === st 
                            ? getStatusBadgeClasses(st)
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                        ]"
                      >
                        <span :class="['w-1.5 h-1.5 rounded-full', getStatusDotBgClass(st)]"></span>
                        <span>{{ st }}</span>
                      </button>
                    </div>
                  </td>
                  <td class="py-4 px-4 text-right" @click.stop>
                    <div class="flex items-center justify-end gap-2">
                      <UButton size="xs" color="blue" variant="soft" icon="i-lucide-eye" @click="openOrderDetails(row)" class="rounded-lg font-bold">Детали</UButton>
                      <UButton size="xs" color="red" variant="ghost" icon="i-lucide-trash-2" @click="deleteOrder(row.id)" class="rounded-lg hover:bg-red-50" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 1: FEEDBACK -->
      <div v-else-if="activeTab === 1" class="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <UButton v-for="s in ['Все', 'новое', 'в работе', 'завершено']" :key="s"
            :color="feedbackFilter === s ? 'primary' : 'gray'"
            :variant="feedbackFilter === s ? 'soft' : 'ghost'"
            @click="feedbackFilter = s"
            class="rounded-xl font-bold shrink-0"
            size="sm"
          >
            {{ s === 'Все' ? 'Все обращения' : s }}
          </UButton>
        </div>

        <div v-if="filteredFeedbacks.length === 0" class="py-12 text-center text-slate-400">
          <UIcon name="i-lucide-message-square" class="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
          <p class="font-bold text-slate-600">Нет обращений</p>
        </div>

        <div v-else class="space-y-2">
          <div 
            v-for="row in filteredFeedbacks" 
            :key="row.id" 
            @click="openFeedbackDetails(row)"
            class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-all cursor-pointer flex justify-between items-center"
          >
            <div class="space-y-1">
              <div class="font-bold text-blue-600 text-sm">{{ row.contact }}</div>
              <div class="text-xs text-slate-600 max-w-md truncate">{{ row.message }}</div>
              <div class="text-[10px] text-slate-400">{{ formatDate(row.date) }}</div>
            </div>
            <UBadge :color="getFeedbackStatusColor(row.status)" variant="subtle" size="xs" class="rounded-md font-bold">
              {{ row.status }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- TAB 2: CATALOG UPLOAD -->
      <div v-else-if="activeTab === 2" class="bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div class="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 transition-all cursor-pointer bg-slate-50 hover:bg-blue-50/50 group" @click="fileInput.click()">
          <UIcon name="i-lucide-upload-cloud" class="w-14 h-14 text-slate-400 group-hover:text-blue-600 mb-3" />
          <h3 class="text-lg font-extrabold text-slate-800 group-hover:text-blue-600 mb-1">Загрузить Excel прайс-лист</h3>
          <p class="text-slate-500 text-xs mb-4">Форматы: .xlsx, .xls</p>
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileUpload" />
          <UButton color="blue" variant="solid" size="md" icon="i-lucide-file-spreadsheet" class="rounded-xl font-bold">Выбрать прайс-лист</UButton>
        </div>
      </div>

    </div>

    <!-- MOBILE-OPTIMIZED ORDER DETAILS MODAL -->
    <UModal v-model="isOrderModalOpen" :ui="{ width: 'w-full sm:max-w-xl', margin: 'm-2 sm:m-auto' }">
      <div v-if="selectedOrder" class="bg-white rounded-3xl p-5 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Top Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-mono font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">#{{ selectedOrder.id }}</span>
              <UBadge :color="getStatusColor(selectedOrder.status)" variant="solid" class="rounded-lg font-extrabold text-xs">
                {{ selectedOrder.status }}
              </UBadge>
            </div>
            <p class="text-[11px] text-slate-400 font-semibold mt-1">Оформлен: {{ formatDate(selectedOrder.date) }}</p>
          </div>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" class="rounded-xl" @click="isOrderModalOpen = false" />
        </div>

        <!-- CLIENT / CLINIC HIGHLIGHT BOX (Сразу видно имя и телефон!) -->
        <div class="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl space-y-2">
          <div class="flex items-center justify-between text-xs font-extrabold uppercase text-blue-700 tracking-wider">
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-building-2" class="w-4 h-4" />
              Заказчик (Клиника)
            </span>
          </div>

          <div class="text-lg font-black text-slate-900 leading-tight">
            {{ selectedOrder.name }}
          </div>

          <div class="flex items-center gap-2 pt-1 flex-wrap">
            <a 
              :href="`tel:${selectedOrder.phone}`" 
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 transition-colors shadow-xs"
            >
              <UIcon name="i-lucide-phone-call" class="w-3.5 h-3.5" />
              <span>{{ selectedOrder.phone }}</span>
            </a>

            <a 
              :href="`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, '')}`" 
              target="_blank"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <UIcon name="i-lucide-message-circle" class="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div class="text-xs text-slate-500 font-semibold flex items-center gap-1 pt-1">
            <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Адрес: {{ selectedOrder.address || 'г. Алматы' }}</span>
          </div>
        </div>

        <!-- SUPPLIER INFO BOX -->
        <div class="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-1">
          <div class="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <UIcon name="i-lucide-truck" class="w-3.5 h-3.5 text-emerald-600" />
            <span>Поставщик</span>
          </div>
          <div class="font-extrabold text-slate-800 text-sm">ТОО «Стома Поставщик» (КазМедИмпорт)</div>
          <div class="text-xs text-slate-500 font-medium">Центральный склад отгрузки (Алматы)</div>
        </div>

        <!-- ITEMS LIST -->
        <div>
          <h4 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Товары в заказе</h4>
          <div class="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
            <div 
              v-for="(item, idx) in selectedOrder.items" 
              :key="idx" 
              class="p-3 bg-slate-50/40 flex justify-between items-center gap-2 text-xs"
            >
              <div class="font-bold text-slate-800 min-w-0 pr-2">
                {{ item.name }}
              </div>
              <div class="text-right shrink-0">
                <span class="text-[11px] text-slate-400 block">{{ item.quantity }} шт × {{ formatPrice(item.price) }} ₸</span>
                <span class="font-extrabold text-blue-600 text-xs">{{ formatPrice(item.price * item.quantity) }} ₸</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TOTAL SUM ACCENT BANNER -->
        <div class="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <span class="text-xs font-extrabold uppercase tracking-wider text-slate-300">Итоговая сумма:</span>
          <span class="text-xl sm:text-2xl font-black text-emerald-400 leading-none">{{ formatPrice(selectedOrder.total) }} ₸</span>
        </div>

        <!-- CHANGE STATUS PANELS (Big Touch Friendly Buttons) -->
        <div class="space-y-2 pt-2 border-t border-slate-100">
          <label class="block text-xs font-extrabold uppercase text-slate-400 tracking-wider">Изменить статус заказа:</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="st in ['Новый', 'Ждет оплаты', 'Ждет доставки', 'Завершен', 'Отказан']"
              :key="st"
              type="button"
              @click="updateOrderStatus(selectedOrder.id, st)"
              :class="[
                'p-2.5 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer text-center',
                selectedOrder.status === st 
                  ? getStatusBadgeClasses(st)
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              ]"
            >
              <span :class="['w-2 h-2 rounded-full shrink-0', getStatusDotBgClass(st)]"></span>
              <span class="truncate">{{ st }}</span>
            </button>
          </div>
        </div>

        <!-- MODAL FOOTER CONTROLS -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
          <UButton 
            color="red" 
            variant="soft" 
            icon="i-lucide-trash-2" 
            @click="deleteOrder(selectedOrder.id)"
            size="sm"
            class="rounded-xl font-extrabold"
          >
            Удалить
          </UButton>

          <UButton 
            color="gray" 
            variant="solid" 
            @click="isOrderModalOpen = false"
            size="sm"
            class="rounded-xl font-extrabold"
          >
            Закрыть
          </UButton>
        </div>

      </div>
    </UModal>

    <!-- MOBILE FEEDBACK MODAL -->
    <UModal v-model="isFeedbackModalOpen">
      <div v-if="selectedFeedback" class="bg-white rounded-3xl p-5 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 class="text-base font-bold text-slate-900">Обращение от {{ selectedFeedback.contact }}</h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" class="rounded-xl" @click="isFeedbackModalOpen = false" />
        </div>
        <div class="text-xs text-slate-400">{{ formatDate(selectedFeedback.date) }}</div>
        <div class="bg-slate-50 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
          {{ selectedFeedback.message }}
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
          name: o.name || 'Стоматологическая клиника',
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
    toast.add({ title: `Статус заказа изменен на "${newStatus}"`, color: 'green', icon: 'i-lucide-check-circle' })
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

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
