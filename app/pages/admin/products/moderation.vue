<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900">Модерация товаров поставщиков</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Проверка прайс-листов и загруженных партий. Одобренные товары мгновенно попадают в витрину и PIM-каталог.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-for="s in ['all', 'pending', 'approved', 'rejected']"
          :key="s"
          type="button"
          @click="activeStatusFilter = s"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
            activeStatusFilter === s ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          ]"
        >
          {{ s === 'all' ? 'Все партии' : (s === 'pending' ? 'Ожидают проверки' : (s === 'approved' ? 'Одобренные' : 'Отклонённые')) }}
        </button>

        <button
          type="button"
          @click="fetchBatches"
          class="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer text-xs font-bold"
          title="Обновить"
        >
          🔄
        </button>
      </div>
    </div>

    <!-- Alert / Notice if action performed -->
    <div v-if="successMsg" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
      <div class="flex items-center gap-2">
        <span class="text-base">🎉</span>
        <span>{{ successMsg }}</span>
      </div>
      <button type="button" @click="successMsg = ''" class="text-emerald-600 hover:text-emerald-900 font-black">✕</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-12 text-center text-slate-400">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
      <p class="text-xs font-bold">Загрузка партий товаров...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredBatches.length === 0" class="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
      <div class="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-3xl mx-auto">
        📦
      </div>
      <h3 class="text-base font-bold text-slate-800">Нет партий по выбранному фильтру</h3>
      <p class="text-xs text-slate-400">Поставщики пока не загружали прайс-листы или все партии обработаны.</p>
    </div>

    <!-- Batches Accordion / Cards List -->
    <div v-else class="space-y-6">
      <div
        v-for="batch in filteredBatches"
        :key="batch.id"
        class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all"
      >
        <!-- Batch Header -->
        <div class="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-xs font-black bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg">
                {{ batch.id }}
              </span>
              <h3 class="text-base font-black text-slate-900">{{ batch.supplierName }}</h3>
              <span class="text-xs text-slate-500 font-medium">({{ batch.supplierPhone }})</span>
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-bold', getStatusClass(batch.status)]">
                {{ getStatusLabel(batch.status) }}
              </span>
            </div>
            <p class="text-xs text-slate-400">
              Дата отправки: {{ formatDate(batch.createdAt) }} • Всего позиций: {{ batch.products.length }}
            </p>
          </div>

          <!-- Moderation Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <button
              v-if="batch.status === 'pending' || batch.status === 'partially_approved'"
              type="button"
              @click="moderateBatch(batch.id, 'approve_all')"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>✅</span> Одобрить всё ({{ batch.products.length }})
            </button>

            <button
              v-if="batch.status === 'pending' || batch.status === 'partially_approved'"
              type="button"
              :disabled="getSelectedInBatch(batch.id).length === 0"
              @click="moderateBatch(batch.id, 'approve_selected')"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>☑️</span> Одобрить выбранные ({{ getSelectedInBatch(batch.id).length }})
            </button>

            <button
              v-if="batch.status === 'pending'"
              type="button"
              @click="moderateBatch(batch.id, 'reject')"
              class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              ✕ Отклонить
            </button>
          </div>
        </div>

        <!-- Batch Product Cards Grid -->
        <div class="p-5 sm:p-6 space-y-4">
          <div class="flex items-center justify-between text-xs">
            <label class="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                :checked="isAllSelectedInBatch(batch)"
                @change="toggleSelectAllInBatch(batch)"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span>Выбрать все товары в этой партии</span>
            </label>
            <span class="text-slate-400">Нажмите на товар, чтобы выбрать для одобрения</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="prod in batch.products"
              :key="prod.id"
              @click="toggleSelectProduct(batch.id, String(prod.id))"
              :class="[
                'border rounded-2xl p-4 transition-all cursor-pointer relative flex flex-col justify-between',
                isSelected(batch.id, String(prod.id)) ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'
              ]"
            >
              <!-- Card Header -->
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  :checked="isSelected(batch.id, String(prod.id))"
                  @click.stop
                  @change="toggleSelectProduct(batch.id, String(prod.id))"
                  class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-1 cursor-pointer"
                />

                <div class="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                  <img
                    :src="prod.image"
                    :alt="prod.name"
                    class="w-full h-full object-cover"
                    @error="(e: any) => e.target.src = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'"
                  />
                </div>

                <div class="space-y-0.5 grow">
                  <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {{ prod.category }}
                  </span>
                  <h4 class="text-xs font-black text-slate-900 line-clamp-2 leading-snug">{{ prod.name }}</h4>
                  <p class="text-[11px] text-slate-400 font-mono">SKU: {{ prod.sku || prod.id }}</p>
                </div>
              </div>

              <!-- Card Body -->
              <p class="text-xs text-slate-500 mt-2 line-clamp-2">{{ prod.description }}</p>

              <!-- Card Footer -->
              <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-400 block">Прайс</span>
                  <span class="text-sm font-black text-blue-600">{{ formatPrice(prod.price) }} ₸</span>
                </div>

                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-md',
                    prod.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : (prod.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700')
                  ]"
                >
                  {{ prod.status === 'approved' ? 'Одобрен' : (prod.status === 'rejected' ? 'Отклонен' : 'На проверке') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })

interface ModerationBatch {
  id: string
  supplierId: string | number
  supplierName: string
  supplierPhone: string
  createdAt: string
  status: 'pending' | 'approved' | 'partially_approved' | 'rejected'
  products: {
    id: string
    name: string
    price: number
    category: string
    description: string
    image: string
    sku?: string
    brand?: string
    stock?: number
    status?: 'pending' | 'approved' | 'rejected'
  }[]
}

const batches = ref<ModerationBatch[]>([])
const isLoading = ref(true)
const activeStatusFilter = ref('all')
const successMsg = ref('')
const selectedProducts = ref<Record<string, string[]>>({})

async function fetchBatches() {
  isLoading.value = true
  try {
    const data = await $fetch<ModerationBatch[]>('/api/supplier/pending-products')
    batches.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    console.error('Error fetching batches:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBatches()
})

const filteredBatches = computed(() => {
  if (activeStatusFilter.value === 'all') return batches.value
  return batches.value.filter(b => b.status === activeStatusFilter.value)
})

function getSelectedInBatch(batchId: string): string[] {
  return selectedProducts.value[batchId] || []
}

function isSelected(batchId: string, productId: string): boolean {
  return (selectedProducts.value[batchId] || []).includes(productId)
}

function toggleSelectProduct(batchId: string, productId: string) {
  if (!selectedProducts.value[batchId]) {
    selectedProducts.value[batchId] = []
  }
  const idx = selectedProducts.value[batchId].indexOf(productId)
  if (idx > -1) {
    selectedProducts.value[batchId].splice(idx, 1)
  } else {
    selectedProducts.value[batchId].push(productId)
  }
}

function isAllSelectedInBatch(batch: ModerationBatch): boolean {
  const current = selectedProducts.value[batch.id] || []
  return batch.products.length > 0 && current.length === batch.products.length
}

function toggleSelectAllInBatch(batch: ModerationBatch) {
  if (isAllSelectedInBatch(batch)) {
    selectedProducts.value[batch.id] = []
  } else {
    selectedProducts.value[batch.id] = batch.products.map(p => String(p.id))
  }
}

async function moderateBatch(batchId: string, action: 'approve_all' | 'approve_selected' | 'reject') {
  try {
    const body: any = {
      batchId,
      action
    }
    if (action === 'approve_selected') {
      body.productIds = selectedProducts.value[batchId] || []
    }

    const res = await $fetch<{ success: boolean; message: string; batch: any }>('/api/supplier/moderate', {
      method: 'POST',
      body
    })

    if (res.success) {
      successMsg.value = res.message
      selectedProducts.value[batchId] = []
      await fetchBatches()
    }
  } catch (err: any) {
    alert(err.message || 'Ошибка модерации')
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Ожидает проверки'
    case 'approved': return 'Одобрена полностью'
    case 'partially_approved': return 'Частично одобрена'
    case 'rejected': return 'Отклонена'
    default: return status
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-800'
    case 'approved': return 'bg-emerald-100 text-emerald-800'
    case 'partially_approved': return 'bg-blue-100 text-blue-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-800'
  }
}

function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(num) ? '0' : num.toLocaleString('ru-RU')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}
</script>
