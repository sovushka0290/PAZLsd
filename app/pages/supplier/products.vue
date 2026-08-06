<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">
          🛍️ Каталог товаров поставщика <span class="text-slate-400 text-lg font-normal">({{ totalProducts }})</span>
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">Управление позициями, загрузка прайсов и статус модерации</p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <button
          type="button"
          @click="showUploadModal = true"
          class="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>📥</span> Загрузить товары (Excel / CSV)
        </button>
      </div>
    </div>

    <!-- Banner after upload -->
    <div v-if="recentBatchNotice" class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-bold animate-in fade-in">
      <div class="flex items-center gap-2">
        <span class="text-lg">✅</span>
        <span>Партия товаров отправлена на модерацию администратору! Мы уведомим вас после проверки.</span>
      </div>
      <button type="button" @click="recentBatchNotice = false" class="text-emerald-600 hover:text-emerald-900">✕</button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative w-full sm:w-80">
        <input 
          v-model="searchQuery" 
          @keyup.enter="fetchProducts"
          type="text" 
          placeholder="Поиск по названию или артикулу..." 
          class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
        />
        <span class="absolute left-3.5 top-2 text-slate-400 text-sm">🔍</span>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          type="button"
          @click="fetchProducts"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Обновить список
        </button>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold">
      ❌ {{ error }}
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 flex flex-col gap-4 animate-pulse">
        <div class="h-40 bg-slate-200 rounded-xl w-full"></div>
        <div class="h-4 bg-slate-200 rounded w-3/4"></div>
        <div class="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Product Grid -->
    <div v-else-if="products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white rounded-2xl shadow-xs hover:shadow-md border border-slate-200 hover:border-blue-400 p-4 flex flex-col transition-all group"
      >
        <div class="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden relative border border-slate-100 flex items-center justify-center">
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform"
            @error="(e: any) => e.target.src = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'"
          />
          <span v-else class="text-5xl">📦</span>
          
          <span class="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
            {{ product.category_name || 'Товары' }}
          </span>
        </div>
        
        <div class="grow space-y-1">
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-extrabold text-slate-900 text-sm line-clamp-2 leading-snug">{{ product.name }}</h3>
          </div>
          <p class="text-xs text-slate-400 font-mono">Арт: {{ product.sku || (product as any).code || `SKU-${product.id}` }}</p>
        </div>
        
        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span class="text-base font-black text-blue-600">{{ formatPrice(product.price) }} ₸</span>
          <span :class="['text-xs font-bold px-2.5 py-1 rounded-lg', product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700']">
            В наличии: {{ product.stock || 50 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white rounded-3xl shadow-xs border border-slate-200 p-12 text-center space-y-4">
      <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto">
        📥
      </div>
      <div>
        <h3 class="text-lg font-bold text-slate-900">Каталог поставщика пуст</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Загрузите товары через Excel-файл или таблицу, и после быстрой модерации они появятся в каталоге для всех клиник.
        </p>
      </div>
      <button
        type="button"
        @click="showUploadModal = true"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
      >
        <span>📥</span> Загрузить первый прайс-лист
      </button>
    </div>

    <!-- Upload Modal -->
    <SupplierUploadModal
      :is-open="showUploadModal"
      @close="showUploadModal = false"
      @success="onUploadSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupplierApi, type SupplierProduct } from '~/composables/useSupplierApi'
import SupplierUploadModal from '~/components/supplier/SupplierUploadModal.vue'

definePageMeta({ layout: 'cabinet', middleware: 'cabinet-auth' })

const { fetchSupplierProducts } = useSupplierApi()

const loading = ref(false)
const products = ref<SupplierProduct[]>([])
const error = ref<string | null>(null)
const searchQuery = ref('')
const totalProducts = ref(0)
const page = ref(1)
const showUploadModal = ref(false)
const recentBatchNotice = ref(false)

const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetchSupplierProducts({ search: searchQuery.value, page: page.value }) || { results: [], count: 0 }
    products.value = response.results || []
    totalProducts.value = response.count || products.value.length
  } catch (err: any) {
    error.value = err.message || 'Ошибка загрузки товаров'
  } finally {
    loading.value = false
  }
}

function onUploadSuccess() {
  recentBatchNotice.value = true
  fetchProducts()
}

onMounted(() => {
  fetchProducts()
})

const formatPrice = (price: number | string | null | undefined) => {
  if (!price) return '0'
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('ru-RU').format(num)
}
</script>
