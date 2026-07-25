<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">Панель оператора</h1>
          <p class="text-gray-500 mt-1">Управление заказами и обращениями клиентов</p>
        </div>
        <div class="flex gap-3 items-center">
          <UButton color="white" variant="solid" icon="i-lucide-external-link" :to="localePath('/')">Перейти на сайт</UButton>
          <UButton color="red" variant="soft" icon="i-lucide-log-out" @click="logout">Выйти</UButton>
        </div>
      </div>

      <div class="flex space-x-4 border-b border-gray-200 mb-6">
        <button 
          v-for="(tab, i) in [{ label: 'Заказы', icon: 'i-lucide-shopping-bag' }, { label: 'Обратная связь', icon: 'i-lucide-message-square' }, { label: 'Конвейер', icon: 'i-lucide-upload-cloud' }]" 
          :key="i"
          @click="activeTab = i"
          :class="[
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === i ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <UIcon :name="tab.icon" class="w-5 h-5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Заказы -->
      <UCard v-if="activeTab === 0" class="shadow-sm">
        <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
          <UButton v-for="s in ['Все', 'Новый', 'Ждет оплаты', 'Ждет доставки', 'Завершен', 'Отказан']" :key="s"
            :color="orderFilter === s ? 'primary' : 'gray'"
            :variant="orderFilter === s ? 'solid' : 'ghost'"
            @click="orderFilter = s"
            class="rounded-full"
            size="sm"
          >
            {{ s === 'Все' ? 'Все заказы' : s }}
          </UButton>
        </div>

        <UTable 
          :rows="filteredOrders" 
          :columns="orderColumns" 
          :loading="pendingOrders"
          class="w-full"
          :empty-state="{ icon: 'i-lucide-inbox', label: 'Нет заказов по выбранному фильтру' }"
        >
          <!-- Custom render for ID -->
          <template #id-cell="{ row }">
            <span class="font-bold text-slate-800">#{{ row.id }}</span>
          </template>
          <template #id-data="{ row }">
            <span class="font-bold text-slate-800">#{{ row.id }}</span>
          </template>

          <!-- Custom render for Date -->
          <template #date-cell="{ row }">
            <span class="text-slate-500 text-xs">{{ new Date(row.date).toLocaleString('ru-RU') }}</span>
          </template>
          <template #date-data="{ row }">
            <span class="text-slate-500 text-xs">{{ new Date(row.date).toLocaleString('ru-RU') }}</span>
          </template>

          <!-- Custom render for Client -->
          <template #client-cell="{ row }">
            <div class="flex flex-col">
              <span class="font-bold text-slate-900">{{ row.name }}</span>
              <span class="text-xs font-semibold text-blue-600">{{ row.phone }}</span>
            </div>
          </template>
          <template #client-data="{ row }">
            <div class="flex flex-col">
              <span class="font-bold text-slate-900">{{ row.name }}</span>
              <span class="text-xs font-semibold text-blue-600">{{ row.phone }}</span>
            </div>
          </template>

          <!-- Custom render for Total -->
          <template #total-cell="{ row }">
            <span class="font-bold text-blue-600">{{ row.total }} ₸</span>
          </template>
          <template #total-data="{ row }">
            <span class="font-bold text-blue-600">{{ row.total }} ₸</span>
          </template>

          <!-- Custom render for Status -->
          <template #status-cell="{ row }">
            <UBadge :color="getStatusColor(row.status)" variant="subtle" size="sm" class="capitalize">
              {{ row.status }}
            </UBadge>
          </template>
          <template #status-data="{ row }">
            <UBadge :color="getStatusColor(row.status)" variant="subtle" size="sm" class="capitalize">
              {{ row.status }}
            </UBadge>
          </template>

          <!-- Custom render for Actions -->
          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton size="xs" color="primary" variant="soft" icon="i-lucide-eye" @click="openOrderDetails(row)">Детали</UButton>
            </div>
          </template>
          <template #actions-data="{ row }">
            <div class="flex items-center gap-2">
              <UButton size="xs" color="primary" variant="soft" icon="i-lucide-eye" @click="openOrderDetails(row)">Детали</UButton>
            </div>
          </template>
        </UTable>
      </UCard>

      <!-- Обратная связь -->
      <UCard v-else-if="activeTab === 1" class="shadow-sm">
        <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
          <UButton v-for="s in ['Все', 'новое', 'в работе', 'завершено']" :key="s"
            :color="feedbackFilter === s ? 'primary' : 'gray'"
            :variant="feedbackFilter === s ? 'solid' : 'ghost'"
            @click="feedbackFilter = s"
            class="rounded-full"
            size="sm"
          >
            {{ s === 'Все' ? 'Все обращения' : s }}
          </UButton>
        </div>

        <UTable 
          :rows="filteredFeedbacks" 
          :columns="feedbackColumns" 
          :loading="pendingFeedbacks"
          class="w-full"
          :empty-state="{ icon: 'i-lucide-message-circle', label: 'Нет сообщений по выбранному фильтру' }"
        >
          <!-- Custom render for Date -->
          <template #date-data="{ row }">
            <span class="text-gray-500">{{ new Date(row.date).toLocaleString('ru-RU') }}</span>
          </template>

          <!-- Custom render for Contact -->
          <template #contact-data="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-gray-900">{{ row.name }}</span>
              <span class="text-sm text-gray-500">{{ row.contact }}</span>
            </div>
          </template>

          <!-- Custom render for Message -->
          <template #message-data="{ row }">
            <div class="max-w-xs truncate text-gray-700" :title="row.message">
              {{ row.message }}
            </div>
          </template>

          <!-- Custom render for Status -->
          <template #status-data="{ row }">
            <UBadge :color="getFeedbackStatusColor(row.status)" variant="subtle" size="sm" class="capitalize">
              {{ row.status }}
            </UBadge>
          </template>

          <!-- Custom render for Actions -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-2">
              <UButton size="xs" color="gray" variant="ghost" icon="i-lucide-eye" @click="openFeedbackDetails(row)">Текст</UButton>
              <UDropdown :items="getFeedbackActions(row)" :popper="{ placement: 'bottom-end' }">
                <UButton color="gray" variant="ghost" icon="i-lucide-more-horizontal" size="xs" />
              </UDropdown>
            </div>
          </template>
        </UTable>
      </UCard>

      <!-- Конвейер (Upload Catalog) -->
      <UCard v-else-if="activeTab === 2" class="shadow-sm">
        <div class="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50 group" @click="fileInput.click()">
          <UIcon name="i-lucide-upload-cloud" class="w-16 h-16 text-gray-400 group-hover:text-blue-500 mb-4" />
          <h3 class="text-xl font-bold text-gray-700 group-hover:text-blue-600 mb-2">Перетащите Excel-файл сюда</h3>
          <p class="text-gray-500 text-sm mb-6">Или нажмите, чтобы выбрать файл с компьютера</p>
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileUpload" />
          <UButton color="primary" variant="solid" size="lg" icon="i-lucide-file-spreadsheet">Выбрать прайс-лист</UButton>
        </div>
        <div v-if="uploading" class="mt-6 flex flex-col items-center">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-blue-500 animate-spin mb-2" />
          <p class="text-sm font-medium text-gray-600">Загрузка файла и запуск конвейера...</p>
        </div>
      </UCard>
    </div>

    <!-- Модальное окно Деталей заказа -->
    <UModal v-model="isOrderModalOpen">
      <UCard v-if="selectedOrder" :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Заказ #{{ selectedOrder.id.substring(0, 8) }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isOrderModalOpen = false" />
          </div>
        </template>
        
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <UBadge :color="getStatusColor(selectedOrder.status)" variant="subtle">{{ selectedOrder.status }}</UBadge>
            <span class="text-sm text-gray-500">{{ new Date(selectedOrder.date).toLocaleString('ru-RU') }}</span>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg text-sm grid grid-cols-2 gap-4">
            <div>
              <div class="text-gray-500 mb-1">Имя клиента</div>
              <div class="font-medium">{{ selectedOrder.name }}</div>
            </div>
            <div>
              <div class="text-gray-500 mb-1">Телефон</div>
              <div class="font-medium">{{ selectedOrder.phone }}</div>
            </div>
            <div v-if="selectedOrder.company">
              <div class="text-gray-500 mb-1">Компания</div>
              <div class="font-medium">{{ selectedOrder.company }}</div>
            </div>
            <div v-if="selectedOrder.address">
              <div class="text-gray-500 mb-1">Адрес</div>
              <div class="font-medium">{{ selectedOrder.address }}</div>
            </div>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-3">Состав заказа</h4>
            <div class="border border-gray-100 rounded-md divide-y divide-gray-100">
              <div v-for="(item, idx) in selectedOrder.items" :key="idx" class="flex justify-between p-3 text-sm">
                <div class="font-medium text-gray-700">{{ item.name }}</div>
                <div class="text-gray-500">{{ item.quantity }} × {{ item.price }} ₸</div>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-gray-100">
            <span class="text-gray-500">Итого:</span>
            <span class="text-xl font-bold text-blue-600">{{ selectedOrder.total }} ₸</span>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Модальное окно Деталей отзыва -->
    <UModal v-model="isFeedbackModalOpen">
      <UCard v-if="selectedFeedback" :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Сообщение от {{ selectedFeedback.name }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isFeedbackModalOpen = false" />
          </div>
        </template>
        
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <UBadge :color="getFeedbackStatusColor(selectedFeedback.status)" variant="subtle">{{ selectedFeedback.status }}</UBadge>
            <span class="text-sm text-gray-500">{{ new Date(selectedFeedback.date).toLocaleString('ru-RU') }}</span>
          </div>
          
          <div class="bg-gray-50 p-3 rounded-lg text-sm">
            <div class="text-gray-500 mb-1">Контакты:</div>
            <div class="font-medium text-blue-600">{{ selectedFeedback.contact }}</div>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-2">Текст сообщения:</h4>
            <div class="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {{ selectedFeedback.message }}
            </div>
          </div>
        </div>
      </UCard>
    </UModal>

  </div>
</template>

<script setup>
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
const selectedOrder = ref(null)

const isFeedbackModalOpen = ref(false)
const selectedFeedback = ref(null)

const uploading = ref(false)
const fileInput = ref(null)

// API fetchers
const { data: ordersData, pending: pendingOrders, refresh: refreshOrders } = await useAsyncData('operator-orders', async () => {
  try {
    const res = await $fetch('/api/v2/operator/orders/')
    return res?.results || res || []
  } catch (e) {
    console.warn('[Operator] Orders fetch issue:', e)
    return []
  }
})

const orders = computed(() => Array.isArray(ordersData.value) ? ordersData.value : (ordersData.value?.results || []))


// Columns for UTable
const orderColumns = [
  { accessorKey: 'id', header: 'ID заказа' },
  { accessorKey: 'date', header: 'Дата' },
  { accessorKey: 'client', header: 'Клиент' },
  { accessorKey: 'total', header: 'Сумма' },
  { accessorKey: 'status', header: 'Статус' },
  { id: 'actions', header: '' }
]

const feedbackColumns = [
  { accessorKey: 'date', header: 'Дата' },
  { accessorKey: 'contact', header: 'Контакт' },
  { accessorKey: 'message', header: 'Сообщение' },
  { accessorKey: 'status', header: 'Статус' },
  { id: 'actions', header: '' }
]



const { data: feedbacks, pending: pendingFeedbacks, refresh: refreshFeedbacks } = await useAsyncData('feedbacks', () => {
  if (authStore.isAuthenticated) return $fetch('/api/feedback')
  return []
}, { watch: [() => authStore.isAuthenticated] })

// Computed properties for filtering
const filteredOrders = computed(() => {
  if (!orders.value) return []
  let list = [...orders.value]
  if (orderFilter.value !== 'Все') list = list.filter(o => o.status === orderFilter.value)
  // Sort by date descending
  return list.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const filteredFeedbacks = computed(() => {
  if (!feedbacks.value) return []
  let list = [...feedbacks.value]
  if (feedbackFilter.value !== 'Все') list = list.filter(f => f.status === feedbackFilter.value)
  return list.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Colors
function getStatusColor(status) {
  switch (status) {
    case 'Новый': return 'orange'
    case 'Ждет оплаты': return 'blue'
    case 'Ждет доставки': return 'purple'
    case 'Завершен': return 'emerald'
    case 'Отказан': return 'red'
    default: return 'gray'
  }
}

function getFeedbackStatusColor(status) {
  switch (status) {
    case 'новое': return 'orange'
    case 'в работе': return 'blue'
    case 'завершено': return 'emerald'
    default: return 'gray'
  }
}

// Action Handlers
function openOrderDetails(order) {
  selectedOrder.value = order
  isOrderModalOpen.value = true
}

function openFeedbackDetails(msg) {
  selectedFeedback.value = msg
  isFeedbackModalOpen.value = true
}

async function updateOrderStatus(id, newStatus) {
  const config = useRuntimeConfig()
  await $fetch(`${config.public.apiBaseUrl}/api/v2/operator/orders/${id}/`, {
    method: 'PATCH',
    body: { status: newStatus },
    headers: { 'Authorization': `Token ${authStore.token}` }
  })
  refreshOrders()
  toast.add({ title: 'Статус обновлен', color: 'green', icon: 'i-lucide-check-circle' })
  if (selectedOrder.value?.id === id) {
    selectedOrder.value.status = newStatus
  }
}

async function deleteOrder(id) {
  if (!confirm('Вы уверены, что хотите безвозвратно удалить этот заказ?')) return
  try {
    const config = useRuntimeConfig()
    await $fetch(`${config.public.apiBaseUrl}/api/v2/operator/orders/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${authStore.token}` }
    })
    refreshOrders()
    toast.add({ title: 'Заказ удален', color: 'gray', icon: 'i-lucide-trash' })
    if (selectedOrder.value?.id === id) isOrderModalOpen.value = false
  } catch (e) {
    toast.add({ title: 'Ошибка удаления', description: e.message, color: 'red' })
  }
}

async function updateFeedbackStatus(id, newStatus) {
  await $fetch(`/api/feedback/${id}`, { method: 'PUT', body: { status: newStatus } })
  refreshFeedbacks()
  toast.add({ title: 'Статус обновлен', color: 'green', icon: 'i-lucide-check-circle' })
  if (selectedFeedback.value?.id === id) {
    selectedFeedback.value.status = newStatus
  }
}

async function deleteFeedback(id) {
  if (!confirm('Вы уверены, что хотите безвозвратно удалить этот отзыв?')) return
  try {
    await $fetch(`/api/feedback/${id}`, { method: 'DELETE' })
    refreshFeedbacks()
    toast.add({ title: 'Отзыв удален', color: 'gray', icon: 'i-lucide-trash' })
    if (selectedFeedback.value?.id === id) isFeedbackModalOpen.value = false
  } catch (e) {
    toast.add({ title: 'Ошибка удаления', description: e.message, color: 'red' })
  }
}

// Dropdown Menus
function getOrderActions(row) {
  return [
    [
      { label: 'Ждет оплаты', icon: 'i-lucide-credit-card', click: () => updateOrderStatus(row.id, 'Ждет оплаты'), disabled: row.status === 'Ждет оплаты' || row.status === 'Завершен' || row.status === 'Отказан' },
      { label: 'Ждет доставки', icon: 'i-lucide-truck', click: () => updateOrderStatus(row.id, 'Ждет доставки'), disabled: row.status === 'Ждет доставки' || row.status === 'Завершен' || row.status === 'Отказан' },
      { label: 'Завершить', icon: 'i-lucide-check-circle-2', click: () => updateOrderStatus(row.id, 'Завершен'), disabled: row.status === 'Завершен' || row.status === 'Отказан' },
      { label: 'Отказ', icon: 'i-lucide-x-circle', click: () => updateOrderStatus(row.id, 'Отказан'), disabled: row.status === 'Отказан' || row.status === 'Завершен' }
    ],
    [
      { label: 'Удалить заказ', icon: 'i-lucide-trash-2', color: 'red', click: () => deleteOrder(row.id) }
    ]
  ]
}

function getFeedbackActions(row) {
  return [
    [
      { label: 'В работу', icon: 'i-lucide-play-circle', click: () => updateFeedbackStatus(row.id, 'в работе'), disabled: row.status === 'в работе' || row.status === 'завершено' },
      { label: 'Завершить', icon: 'i-lucide-check-circle-2', click: () => updateFeedbackStatus(row.id, 'завершено'), disabled: row.status === 'завершено' }
    ],
    [
      { label: 'Удалить сообщение', icon: 'i-lucide-trash-2', color: 'red', click: () => deleteFeedback(row.id) }
    ]
  ]
}

async function handleFileUpload(event) {
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
      headers: {
        'Authorization': `Token ${authStore.token}`
      }
    })
    
    toast.add({ title: 'Файл отправлен на конвейер!', description: 'Каталог обновится автоматически в фоновом режиме.', color: 'green', icon: 'i-lucide-check-circle' })
  } catch (e) {
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
