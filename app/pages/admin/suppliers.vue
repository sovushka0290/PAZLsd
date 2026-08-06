<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900">Заявки поставщиков на регистрацию</h1>
        <p class="text-xs text-slate-500 mt-0.5">Проверка юридических лиц, БИН и открытие доступа к личному кабинету</p>
      </div>

      <div class="flex items-center gap-2">
        <button 
          v-for="s in ['all', 'reviewing', 'verified', 'rejected']" 
          :key="s"
          @click="activeFilter = s"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
            activeFilter === s ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          ]"
        >
          {{ s === 'all' ? 'Все заявки' : (s === 'reviewing' ? 'На проверке' : (s === 'verified' ? 'Подтверждены' : 'Отклонены')) }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-12 text-center text-slate-400">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
      <p class="text-xs font-bold">Загрузка заявок...</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4">Компания / БИН</th>
            <th class="px-6 py-4">Контакты</th>
            <th class="px-6 py-4">Категории</th>
            <th class="px-6 py-4">Статус</th>
            <th class="px-6 py-4 text-right">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="supplier in filteredSuppliers" :key="supplier.id" class="hover:bg-slate-50/80 transition-colors">
            <td class="px-6 py-4">
              <p class="font-black text-slate-900 text-sm">{{ supplier.companyName }}</p>
              <p class="text-xs text-slate-400 font-mono">БИН: {{ supplier.bin }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-slate-800 font-bold">{{ supplier.phone }}</p>
              <p class="text-xs text-slate-400">{{ supplier.email || '—' }} ({{ supplier.contactPerson || 'Контакт' }})</p>
            </td>
            <td class="px-6 py-4">
              <span class="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                {{ supplier.categories || 'Стоматологические материалы' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span :class="['px-2.5 py-1 rounded-full text-xs font-bold', getStatusBadge(supplier.status).class]">
                {{ getStatusBadge(supplier.status).label }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button 
                v-if="supplier.status !== 'verified'"
                @click="updateStatus(supplier.id, 'verified')"
                class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                ✓ Одобрить
              </button>
              <button 
                v-if="supplier.status !== 'rejected'"
                @click="updateStatus(supplier.id, 'rejected')"
                class="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Отклонить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })

const activeFilter = ref('all')
const isLoading = ref(true)

interface SupplierApp {
  id: string | number
  companyName: string
  bin: string
  phone: string
  contactPerson?: string
  email?: string
  categories?: string
  status: 'reviewing' | 'verified' | 'rejected'
}

const suppliers = ref<SupplierApp[]>([])

async function fetchSuppliers() {
  isLoading.value = true
  try {
    const data = await $fetch<SupplierApp[]>('/api/supplier/applications')
    suppliers.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching suppliers:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSuppliers()
})

const filteredSuppliers = computed(() => {
  if (activeFilter.value === 'all') return suppliers.value
  return suppliers.value.filter(s => s.status === activeFilter.value)
})

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; class: string }> = {
    reviewing: { label: 'На проверке', class: 'bg-amber-100 text-amber-800' },
    verified: { label: 'Подтвержден', class: 'bg-emerald-100 text-emerald-800' },
    rejected: { label: 'Отклонен', class: 'bg-red-100 text-red-800' }
  }
  return map[status] || map.reviewing
}

async function updateStatus(id: string | number, newStatus: 'verified' | 'rejected') {
  try {
    const res = await $fetch<{ success: boolean; application: any }>(`/api/supplier/applications/${id}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    if (res.success) {
      const target = suppliers.value.find(s => String(s.id) === String(id))
      if (target) {
        target.status = newStatus
      }
    }
  } catch (err: any) {
    alert(err.message || 'Ошибка обновления статуса')
  }
}
</script>
