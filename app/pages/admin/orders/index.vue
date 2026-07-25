<template>
  <div>
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Управление заказами</h1>
        <p class="text-slate-500 mt-1">Просмотр и обработка заказов клиентов</p>
      </div>
    </div>

    <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100', body: { padding: 'p-0' } }">
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
        <!-- Tabs for filtering -->
        <div class="flex space-x-1 bg-slate-100 p-1 rounded-xl">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="activeTab === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'"
          >
            {{ tab.label }}
          </button>
        </div>

        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Поиск по ID или телефону..."
          class="w-full sm:w-64"
          :ui="{ rounded: 'rounded-xl' }"
        />
      </div>

      <!-- Orders List -->
      <div v-if="filteredOrders.length > 0" class="divide-y divide-slate-100">
        <div v-for="order in filteredOrders" :key="order.id" class="p-4 hover:bg-slate-50 transition-colors">
          <div class="flex flex-col md:flex-row justify-between gap-4">
            <!-- Order Info -->
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="font-bold text-slate-900">#{{ order.id }}</span>
                <UBadge :color="getStatusColor(order.status)" variant="subtle" size="sm" class="rounded-lg">
                  {{ getStatusLabel(order.status) }}
                </UBadge>
                <span class="text-xs text-slate-500">{{ order.date }}</span>
              </div>
              <div class="text-sm text-slate-600 mb-1">
                <span class="font-medium text-slate-900">{{ order.customerName }}</span> 
                <template v-if="order.company">({{ order.company }})</template>
              </div>
              <div class="text-sm text-slate-500 flex items-center gap-4">
                <span class="flex items-center"><UIcon name="i-lucide-phone" class="w-4 h-4 mr-1"/> {{ order.phone }}</span>
                <span class="flex items-center"><UIcon name="i-lucide-map-pin" class="w-4 h-4 mr-1"/> {{ order.address }}</span>
              </div>
            </div>

            <!-- Order Total & Actions -->
            <div class="flex flex-col md:items-end justify-between">
              <div class="text-lg font-bold text-slate-900 mb-3">
                {{ order.totalPrice }} ₸
              </div>
              <div class="flex gap-2">
                <USelect 
                  v-model="order.status" 
                  :options="statusOptions" 
                  size="sm" 
                  :ui="{ rounded: 'rounded-lg' }"
                  class="w-36"
                />
                <UButton color="neutral" variant="soft" size="sm" class="rounded-lg">
                  Детали
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="p-12 text-center text-slate-500">
        <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p class="font-medium text-slate-900 text-lg">Заказов не найдено</p>
        <p class="text-sm mt-1">По вашему запросу ничего не найдено или в этой категории пока нет заказов.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const searchQuery = ref('')
const activeTab = ref('all')

const tabs = [
  { label: 'Все', value: 'all' },
  { label: 'Новые', value: 'new' },
  { label: 'В работе', value: 'in_progress' },
  { label: 'Выполнены', value: 'completed' },
  { label: 'Отменены', value: 'rejected' }
]

const statusOptions = [
  { label: 'Новый', value: 'new' },
  { label: 'В работе', value: 'in_progress' },
  { label: 'Выполнен', value: 'completed' },
  { label: 'Отменен', value: 'rejected' }
]

// Mock orders for now
const orders = ref([
  {
    id: '1001',
    date: '21.06.2026 14:30',
    customerName: 'Иван Иванов',
    company: 'Стоматология Улыбка',
    phone: '+7 777 123 4567',
    address: 'Алматы, Абая 10',
    totalPrice: '150 000',
    status: 'new'
  },
  {
    id: '1002',
    date: '20.06.2026 10:15',
    customerName: 'Анна Смирнова',
    company: '',
    phone: '+7 701 987 6543',
    address: 'Астана, Мангилик Ел 5',
    totalPrice: '45 500',
    status: 'in_progress'
  },
  {
    id: '1003',
    date: '18.06.2026 09:00',
    customerName: 'Ерлан Омаров',
    company: 'Dent Clinic',
    phone: '+7 705 555 1234',
    address: 'Шымкент, Рыскулова 20',
    totalPrice: '320 000',
    status: 'completed'
  }
])

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    // Filter by tab
    if (activeTab.value !== 'all' && order.status !== activeTab.value) return false
    
    // Filter by search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return order.id.toLowerCase().includes(q) || order.phone.toLowerCase().includes(q) || order.customerName.toLowerCase().includes(q)
    }
    
    return true
  })
})

function getStatusColor(status: string) {
  switch(status) {
    case 'new': return 'blue'
    case 'in_progress': return 'orange'
    case 'completed': return 'green'
    case 'rejected': return 'red'
    default: return 'gray'
  }
}

function getStatusLabel(status: string) {
  return statusOptions.find(o => o.value === status)?.label || status
}

useSeoMeta({
  title: 'Заказы | PAZL Admin'
})
</script>
