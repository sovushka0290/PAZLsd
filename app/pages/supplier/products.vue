<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupplierApi, type SupplierProduct } from '~/composables/useSupplierApi'

definePageMeta({ layout: 'cabinet', middleware: 'cabinet-auth' })

const { t } = useI18n()
const { fetchSupplierProducts } = useSupplierApi()

const loading = ref(false)
const products = ref<SupplierProduct[]>([])
const error = ref<string | null>(null)
const searchQuery = ref('')
const totalProducts = ref(0)
const page = ref(1)

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

onMounted(() => {
  fetchProducts()
})

const formatPrice = (price: number | string | null | undefined) => {
  if (!price) return '0'
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('ru-RU').format(num)
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-2xl font-semibold text-slate-900">🛍️ Каталог товаров <span class="text-slate-400 text-lg font-normal">({{ totalProducts }})</span></h1>
      <div class="relative w-full md:w-80">
        <input 
          v-model="searchQuery" 
          @keyup.enter="fetchProducts"
          type="text" 
          placeholder="Поиск по названию или артикулу..." 
          class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
        <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl">
      ❌ {{ error }}
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4 animate-pulse">
        <div class="h-40 bg-slate-200 rounded-xl w-full"></div>
        <div class="h-4 bg-slate-200 rounded w-3/4"></div>
        <div class="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Product Grid -->
    <div v-else-if="products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col transition-shadow hover:shadow-md">
        <div class="aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-6xl">
          <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover rounded-xl" />
          <span v-else>📦</span>
        </div>
        
        <div class="flex-grow space-y-1">
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-medium text-slate-900 line-clamp-2">{{ product.name }}</h3>
            <span v-if="product.is_active" class="shrink-0 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">Активен</span>
            <span v-else class="shrink-0 bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">Неактивен</span>
          </div>
          <p class="text-sm text-slate-500">Арт: {{ product.sku }}</p>
        </div>
        
        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span class="text-lg font-bold text-slate-900">{{ formatPrice(product.price) }} ₸</span>
          <span :class="['text-sm font-medium px-2 py-1 rounded-lg', product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700']">
            В наличии: {{ product.stock || 0 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <div class="text-4xl mb-4">📭</div>
      <h3 class="text-lg font-medium text-slate-900 mb-1">Нет товаров в каталоге</h3>
      <p class="text-slate-500">Загрузите каталог через оператора.</p>
    </div>

    <!-- Pagination -->
    <div v-if="products.length > 0" class="flex justify-center mt-8">
      <nav class="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button class="relative inline-flex items-center px-4 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
          Назад
        </button>
        <button class="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
          1
        </button>
        <button class="relative inline-flex items-center px-4 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
          Вперед
        </button>
      </nav>
    </div>
  </div>
</template>
