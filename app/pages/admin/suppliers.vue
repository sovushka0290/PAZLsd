<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Заявки поставщиков</h1>
        <p class="text-sm text-slate-500 mt-1">Проверка документов и верификация торговых компаний</p>
      </div>
      <div class="flex gap-2">
        <button 
          v-for="s in ['all', 'reviewing', 'verified', 'rejected']" 
          :key="s"
          @click="activeFilter = s"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
            activeFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          {{ s === 'all' ? 'Все заявки' : (s === 'reviewing' ? 'На проверке' : (s === 'verified' ? 'Подтверждены' : 'Отклонены')) }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
          <tr>
            <th class="px-6 py-4">Компания / БИН</th>
            <th class="px-6 py-4">Контакты</th>
            <th class="px-6 py-4">Документ</th>
            <th class="px-6 py-4">Статус</th>
            <th class="px-6 py-4 text-right">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="supplier in filteredSuppliers" :key="supplier.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4">
              <p class="font-bold text-slate-900">{{ supplier.companyName }}</p>
              <p class="text-xs text-slate-500">БИН: {{ supplier.bin }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-slate-800">{{ supplier.phone }}</p>
              <p class="text-xs text-slate-400">{{ supplier.email || 'email@supplier.com' }}</p>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">📄</span>
                <span class="text-xs font-medium text-slate-700 truncate max-w-[150px]">{{ supplier.documentFile }}</span>
                <button @click="downloadDoc(supplier.documentFile)" class="text-xs text-blue-600 font-semibold hover:underline">
                  Скачать
                </button>
              </div>
            </td>
            <td class="px-6 py-4">
              <span :class="['px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(supplier.status).class]">
                {{ getStatusBadge(supplier.status).label }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button 
                v-if="supplier.status !== 'verified'"
                @click="updateStatus(supplier.id, 'verified')"
                class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all"
              >
                Подтвердить
              </button>
              <button 
                v-if="supplier.status !== 'rejected'"
                @click="updateStatus(supplier.id, 'rejected')"
                class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-all"
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
import { ref, computed } from 'vue'

definePageMeta({ layout: 'admin' })

const activeFilter = ref('all')

const suppliers = ref([
  { id: 1, companyName: 'ТОО «Стома-Депо»', bin: '210440012984', phone: '+7 777 987 65 43', email: 'depo@stoma.kz', documentFile: 'Лицензия_СтомаДепо.pdf', status: 'reviewing' },
  { id: 2, companyName: 'ИП «Дентал Про»', bin: '880312300451', phone: '+7 701 555 44 33', email: 'info@dentalpro.kz', documentFile: 'Справка_Регистрация_ДенталПро.pdf', status: 'reviewing' },
  { id: 3, companyName: 'ТОО «Альянс-Дент»', bin: '150940003412', phone: '+7 705 111 22 33', email: 'alyans@dent.kz', documentFile: 'Сертификат_Дистрибьютора.pdf', status: 'verified' }
])

const filteredSuppliers = computed(() => {
  if (activeFilter.value === 'all') return suppliers.value
  return suppliers.value.filter(s => s.status === activeFilter.value)
})

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; class: string }> = {
    reviewing: { label: 'На проверке', class: 'bg-amber-100 text-amber-800' },
    verified: { label: 'Подтвержден', class: 'bg-green-100 text-green-800' },
    rejected: { label: 'Отклонен', class: 'bg-red-100 text-red-800' }
  }
  return map[status] || map.reviewing
}

function updateStatus(id: number, newStatus: string) {
  const target = suppliers.value.find(s => s.id === id)
  if (target) {
    target.status = newStatus
  }
}

function downloadDoc(fileName: string) {
  alert(`Скачивание документа: ${fileName}`)
}
</script>
