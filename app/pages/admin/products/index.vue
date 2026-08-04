<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900">Товары</h1>
          <p class="text-slate-500 mt-1 font-medium">Управление ассортиментом магазина</p>
        </div>
        <button
          @click="openAddModal"
          class="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm active:scale-95 gap-2"
        >
          <UIcon name="lucide:plus" class="w-5 h-5" />
          <span>Добавить товар</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div class="flex-1 relative">
          <UIcon name="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск товаров..."
            class="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>
        <div class="w-full md:w-64 relative">
          <select
            v-model="selectedCategory"
            class="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium text-slate-900 appearance-none transition-all cursor-pointer"
          >
            <option value="">Все категории</option>
            <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
          <UIcon name="lucide:chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      <!-- Loading / Error -->
      <div v-if="pending" class="flex justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <UIcon name="lucide:loader-2" class="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <div v-else-if="error" class="p-6 bg-red-50 text-red-600 rounded-3xl font-medium text-center">
        Ошибка при загрузке товаров: {{ error.message }}
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Desktop Table -->
        <div class="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 bg-slate-50/50">
                  <th class="p-4 font-bold text-slate-500 text-sm w-16">Фото</th>
                  <th class="p-4 font-bold text-slate-500 text-sm">Название</th>
                  <th class="p-4 font-bold text-slate-500 text-sm">Категория</th>
                  <th class="p-4 font-bold text-slate-500 text-sm text-right">Цена</th>
                  <th class="p-4 font-bold text-slate-500 text-sm text-center">Статус</th>
                  <th class="p-4 font-bold text-slate-500 text-sm text-right w-24">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="product in paginatedProducts"
                  :key="product.id"
                  class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                >
                  <td class="p-4">
                    <img :src="product.image || 'https://via.placeholder.com/40'" alt="Product" class="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                  </td>
                  <td class="p-4">
                    <div class="font-bold text-slate-900 truncate max-w-xs">{{ product.name }}</div>
                    <div class="text-xs text-slate-400 font-medium mt-0.5">Арт: {{ product.sku || '-' }}</div>
                  </td>
                  <td class="p-4 font-medium text-slate-600">
                    <span class="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-xs text-slate-600">{{ product.category }}</span>
                  </td>
                  <td class="p-4 font-extrabold text-slate-900 text-right whitespace-nowrap">
                    {{ formatPrice(product.price) }}
                  </td>
                  <td class="p-4 text-center">
                    <span :class="getStatusClass(product.status)" class="inline-flex px-3 py-1 rounded-xl text-xs font-bold">
                      {{ getStatusLabel(product.status) }}
                    </span>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="openEditModal(product)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <UIcon name="lucide:pencil" class="w-4 h-4" />
                      </button>
                      <button @click="confirmDelete(product)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <UIcon name="lucide:trash-2" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedProducts.length === 0">
                  <td colspan="6" class="p-12 text-center text-slate-500 font-medium">Товары не найдены</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4">
          <div
            v-for="product in paginatedProducts"
            :key="product.id"
            @click="openEditModal(product)"
            class="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 relative active:scale-95 transition-transform"
          >
            <img :src="product.image || 'https://via.placeholder.com/80'" alt="Product" class="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100" />
            <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <h3 class="font-bold text-slate-900 text-sm line-clamp-2">{{ product.name }}</h3>
                <span class="inline-flex mt-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
                  {{ product.category }}
                </span>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="font-extrabold text-blue-600">{{ formatPrice(product.price) }}</span>
                <span :class="getStatusClass(product.status)" class="px-2 py-0.5 rounded-lg text-[10px] font-bold">
                  {{ getStatusLabel(product.status) }}
                </span>
              </div>
            </div>
            <div class="absolute top-2 right-2">
              <button @click.stop="confirmDelete(product)" class="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <UIcon name="lucide:trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-if="paginatedProducts.length === 0" class="p-8 text-center bg-white rounded-3xl border border-slate-100 text-slate-500 font-medium">
            Товары не найдены
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-6 flex justify-center gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="p-2 rounded-xl bg-white border border-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
          >
            <UIcon name="lucide:chevron-left" class="w-5 h-5" />
          </button>
          <div class="flex items-center gap-1 bg-white px-2 rounded-xl border border-slate-100">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors"
              :class="currentPage === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-xl bg-white border border-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
          >
            <UIcon name="lucide:chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div class="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <h2 class="text-xl font-extrabold text-slate-900">{{ isEditing ? 'Редактировать товар' : 'Новый товар' }}</h2>
          <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <UIcon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="saveProduct" class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="md:col-span-2 space-y-1.5">
              <label class="block text-sm font-bold text-slate-700">Название товара *</label>
              <input v-model="form.name" required type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 transition-all" />
            </div>
            
            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-700">Цена (₸) *</label>
              <input v-model.number="form.price" required type="number" min="0" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 transition-all" />
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-700">Категория</label>
              <div class="relative">
                <select v-model="form.category" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 appearance-none transition-all cursor-pointer">
                  <option value="">Выберите категорию</option>
                  <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <UIcon name="lucide:chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-700">Артикул / SKU</label>
              <input v-model="form.sku" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 transition-all" />
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-700">Производитель / Бренд</label>
              <input v-model="form.brand" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 transition-all" />
            </div>
            
            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-700">Единица измерения</label>
              <div class="relative">
                <select v-model="form.unit" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 appearance-none transition-all cursor-pointer">
                  <option value="шт">Штука (шт)</option>
                  <option value="уп">Упаковка (уп)</option>
                  <option value="кг">Килограмм (кг)</option>
                  <option value="м">Метр (м)</option>
                </select>
                <UIcon name="lucide:chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-700">Статус</label>
              <div class="relative">
                <select v-model="form.status" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 appearance-none transition-all cursor-pointer">
                  <option value="active">Активен</option>
                  <option value="hidden">Скрыт</option>
                  <option value="out_of_stock">Нет в наличии</option>
                </select>
                <UIcon name="lucide:chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label class="block text-sm font-bold text-slate-700">Описание</label>
              <textarea v-model="form.description" rows="3" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 transition-all resize-none"></textarea>
            </div>
            
            <div class="md:col-span-2 space-y-1.5">
              <label class="block text-sm font-bold text-slate-700">URL изображения</label>
              <input v-model="form.image" type="text" placeholder="https://..." class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 transition-all" />
            </div>
          </div>

          <div class="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" @click="closeModal" class="px-6 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors w-full md:w-auto text-center">
              Отмена
            </button>
            <button type="submit" class="px-6 py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors w-full md:w-auto text-center">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="itemToDelete" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <UIcon name="lucide:alert-triangle" class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-extrabold text-slate-900 mb-2">Удалить товар?</h3>
        <p class="text-slate-500 font-medium mb-6">
          Вы уверены, что хотите удалить товар "{{ itemToDelete.name }}"? Это действие нельзя отменить.
        </p>
        <div class="flex gap-3">
          <button @click="itemToDelete = null" class="flex-1 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
            Отмена
          </button>
          <button @click="executeDelete" class="flex-1 py-3 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '#imports'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const authStore = useAuthStore()
const toast = useToast()

const LOCAL_STORAGE_KEY = 'pazl_admin_products_edits'

interface Product {
  id: string | number
  name: string
  price: number
  category: string
  sku?: string
  brand?: string
  unit?: string
  status?: 'active' | 'hidden' | 'out_of_stock' | string
  description?: string
  image?: string
}

// Data fetching
const { data: serverProducts, pending, error } = await useFetch<Product[]>('/api/products-mock', {
  default: () => []
})

const localProducts = ref<Product[]>([])

onMounted(() => {
  // Merge server data with local storage modifications
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      localProducts.value = JSON.parse(saved)
    } else {
      localProducts.value = [...(serverProducts.value || [])]
    }
  } catch (e) {
    localProducts.value = [...(serverProducts.value || [])]
  }
})

// Save to local storage whenever list changes
const saveToStorage = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localProducts.value))
}

// Filters & Search
const searchQuery = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

const uniqueCategories = computed(() => {
  const cats = new Set(localProducts.value.map(p => p.category).filter(Boolean))
  return Array.from(cats).sort()
})

const filteredProducts = computed(() => {
  let result = localProducts.value

  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.sku?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    )
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

// Reset pagination on filter change
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
})

// Formatting
const formatPrice = (price: number | string | undefined) => {
  if (price == null) return '0 ₸'
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0
  }).format(num)
}

const getStatusLabel = (status: string | undefined) => {
  switch (status) {
    case 'active': return 'Активен'
    case 'hidden': return 'Скрыт'
    case 'out_of_stock': return 'Нет в наличии'
    default: return 'Активен'
  }
}

const getStatusClass = (status: string | undefined) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700'
    case 'hidden': return 'bg-slate-200 text-slate-700'
    case 'out_of_stock': return 'bg-red-100 text-red-700'
    default: return 'bg-green-100 text-green-700'
  }
}

// Modal Form
const isModalOpen = ref(false)
const isEditing = ref(false)
const defaultForm: Product = {
  id: '',
  name: '',
  price: 0,
  category: '',
  sku: '',
  brand: '',
  unit: 'шт',
  status: 'active',
  description: '',
  image: ''
}
const form = ref<Product>({ ...defaultForm })

const openAddModal = () => {
  isEditing.value = false
  form.value = { ...defaultForm, id: Date.now().toString() }
  isModalOpen.value = true
}

const openEditModal = (product: Product) => {
  isEditing.value = true
  form.value = { ...product, status: product.status || 'active', unit: product.unit || 'шт' }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveProduct = () => {
  if (isEditing.value) {
    const idx = localProducts.value.findIndex(p => p.id === form.value.id)
    if (idx !== -1) {
      localProducts.value[idx] = { ...form.value }
    }
  } else {
    localProducts.value.unshift({ ...form.value })
  }
  
  saveToStorage()
  closeModal()
  
  toast.add({
    title: isEditing.value ? 'Товар обновлен' : 'Товар добавлен',
    color: 'green'
  })
}

// Delete
const itemToDelete = ref<Product | null>(null)

const confirmDelete = (product: Product) => {
  itemToDelete.value = product
}

const executeDelete = () => {
  if (itemToDelete.value) {
    localProducts.value = localProducts.value.filter(p => p.id !== itemToDelete.value!.id)
    saveToStorage()
    
    toast.add({
      title: 'Товар удален',
      color: 'red'
    })
    itemToDelete.value = null
  }
}
</script>
