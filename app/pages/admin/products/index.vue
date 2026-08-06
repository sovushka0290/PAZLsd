<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-slate-900">Каталог товаров (PIM)</h1>
          <p class="text-slate-500 mt-1 font-medium text-xs">Управление ассортиментом магазина, остатками и ценами</p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/admin/products/moderation"
            class="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black transition-all gap-1.5"
          >
            <span>🛡️</span>
            <span>Модерация партий</span>
          </NuxtLink>
          <button
            @click="openAddModal"
            class="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-md shadow-blue-600/20 active:scale-95 gap-1.5 cursor-pointer"
          >
            <span>+</span>
            <span>Добавить товар</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div class="flex-1 relative">
          <UIcon name="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск товаров по названию или артикулу..."
            class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium text-xs text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>
        <div class="w-full md:w-64 relative">
          <select
            v-model="selectedCategory"
            class="w-full pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-xs text-slate-900 appearance-none transition-all cursor-pointer"
          >
            <option :value="null">Все категории</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.icon || '🦷' }} {{ cat.name }}
            </option>
          </select>
          <UIcon name="lucide:chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <!-- Loading / Error -->
      <div v-if="isLoading" class="flex justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <UIcon name="lucide:loader-2" class="w-8 h-8 text-blue-600 animate-spin" />
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Desktop Table -->
        <div class="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-100 bg-slate-50/50">
                  <th class="p-4 font-bold text-slate-400 uppercase tracking-wider w-16">Фото</th>
                  <th class="p-4 font-bold text-slate-400 uppercase tracking-wider">Название / Артикул</th>
                  <th class="p-4 font-bold text-slate-400 uppercase tracking-wider">Категория</th>
                  <th class="p-4 font-bold text-slate-400 uppercase tracking-wider text-right">Цена</th>
                  <th class="p-4 font-bold text-slate-400 uppercase tracking-wider text-center">Остаток</th>
                  <th class="p-4 font-bold text-slate-400 uppercase tracking-wider text-right w-24">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="product in paginatedProducts"
                  :key="product.id"
                  class="hover:bg-blue-50/30 transition-colors group"
                >
                  <td class="p-4">
                    <img 
                      :src="product.image || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'" 
                      :alt="product.name" 
                      class="w-10 h-10 rounded-xl object-cover border border-slate-100"
                      @error="(e: any) => e.target.src = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'" 
                    />
                  </td>
                  <td class="p-4">
                    <div class="font-extrabold text-slate-900 text-sm truncate max-w-sm">{{ product.name }}</div>
                    <div class="text-[11px] text-slate-400 font-mono mt-0.5">Арт: {{ product.code || product.sku || `SKU-${product.id}` }}</div>
                  </td>
                  <td class="p-4 font-medium text-slate-600">
                    <span class="inline-flex px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px]">
                      {{ getCategoryName(product.category) }}
                    </span>
                  </td>
                  <td class="p-4 font-black text-blue-600 text-right whitespace-nowrap text-sm">
                    {{ formatPrice(product.price) }} ₸
                  </td>
                  <td class="p-4 text-center font-bold text-slate-700">
                    {{ product.stock || 50 }} шт.
                  </td>
                  <td class="p-4 text-right space-x-1">
                    <button @click="openEditModal(product)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">
                      ✏️
                    </button>
                    <button @click="confirmDelete(product)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Card List -->
        <div class="block md:hidden space-y-3">
          <div
            v-for="product in paginatedProducts"
            :key="product.id"
            class="bg-white p-4 rounded-2xl border border-slate-100 space-y-3"
          >
            <div class="flex items-center gap-3">
              <img :src="product.image || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'" class="w-14 h-14 rounded-xl object-cover shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="font-bold text-slate-900 text-sm truncate">{{ product.name }}</div>
                <div class="text-xs text-blue-600 font-black mt-0.5">{{ formatPrice(product.price) }} ₸</div>
              </div>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-50">
              <span class="text-xs font-bold bg-slate-100 px-2 py-1 rounded-md">{{ getCategoryName(product.category) }}</span>
              <div class="flex items-center gap-1">
                <button @click="openEditModal(product)" class="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold">✏️ Изменить</button>
                <button @click="confirmDelete(product)" class="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            ← Назад
          </button>
          <span class="text-xs font-bold text-slate-600">{{ currentPage }} / {{ totalPages }}</span>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            Вперед →
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <UModal v-model="isModalOpen" :ui="{ width: 'w-full sm:max-w-lg' }">
      <div class="bg-white rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="text-base font-black text-slate-900">
          {{ isEditing ? '✏️ Редактирование товара' : '+ Добавление нового товара' }}
        </h3>

        <form @submit.prevent="saveProduct" class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Название товара *</label>
            <input v-model="form.name" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Цена (₸) *</label>
              <input v-model.number="form.price" type="number" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600" required />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Категория *</label>
              <select v-model="form.category" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" required>
                <option v-for="c in categories" :key="c.id" :value="c.id">
                  {{ c.icon || '🦷' }} {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Артикул</label>
              <input v-model="form.code" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Остаток</label>
              <input v-model.number="form.stock" type="number" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Картинка (URL)</label>
            <input v-model="form.image" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]" />
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Описание</label>
            <textarea v-model="form.description" rows="3" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
          </div>

          <div class="pt-3 flex justify-end gap-2">
            <button type="button" @click="isModalOpen = false" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">
              Отмена
            </button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md cursor-pointer">
              {{ isEditing ? 'Сохранить изменения' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: ['admin-auth'] })

const toast = useToast()

const products = ref<any[]>([])
const categories = ref<any[]>([])
const isLoading = ref(true)

const searchQuery = ref('')
const selectedCategory = ref<number | null>(null)
const currentPage = ref(1)
const itemsPerPage = 20

const isModalOpen = ref(false)
const isEditing = ref(false)
const form = ref<any>({
  id: null,
  name: '',
  price: 0,
  category: 1,
  code: '',
  stock: 50,
  image: '',
  description: ''
})

async function fetchData() {
  isLoading.value = true
  try {
    const [pRes, cRes] = await Promise.all([
      $fetch<{ results: any[] }>('/api/catalog/products'),
      $fetch<{ results: any[] }>('/api/catalog/categories')
    ])
    products.value = pRes?.results || []
    categories.value = cRes?.results || []
  } catch (err) {
    console.error('Error fetching admin products:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const filteredProducts = computed(() => {
  let result = products.value

  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.code?.toLowerCase().includes(q)
    )
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage) || 1)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

function getCategoryName(catId: number): string {
  const cat = categories.value.find(c => c.id === catId)
  return cat ? `${cat.icon || '🦷'} ${cat.name}` : 'Общее'
}

function openAddModal() {
  isEditing.value = false
  form.value = {
    id: null,
    name: '',
    price: 15000,
    category: categories.value[0]?.id || 1,
    code: `SKU-${Date.now().toString().slice(-4)}`,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
    description: ''
  }
  isModalOpen.value = true
}

function openEditModal(prod: any) {
  isEditing.value = true
  form.value = {
    id: prod.id,
    name: prod.name,
    price: prod.price,
    category: prod.category,
    code: prod.code || prod.sku || '',
    stock: prod.stock || 50,
    image: prod.image || '',
    description: prod.description || ''
  }
  isModalOpen.value = true
}

async function saveProduct() {
  try {
    if (isEditing.value && form.value.id) {
      await $fetch(`/api/catalog/products/${form.value.id}`, {
        method: 'PUT',
        body: form.value
      })
      toast.add({ title: 'Товар обновлен', color: 'green' })
    } else {
      await $fetch('/api/catalog/products', {
        method: 'POST',
        body: form.value
      })
      toast.add({ title: 'Товар создан', color: 'green' })
    }
    isModalOpen.value = false
    await fetchData()
  } catch (err: any) {
    alert(err.message || 'Ошибка сохранения')
  }
}

async function confirmDelete(prod: any) {
  if (!confirm(`Удалить товар «${prod.name}»?`)) return
  try {
    await $fetch(`/api/catalog/products/${prod.id}`, { method: 'DELETE' })
    toast.add({ title: 'Товар удален', color: 'gray' })
    await fetchData()
  } catch (err: any) {
    alert(err.message || 'Ошибка удаления')
  }
}

function formatPrice(val: number | string | undefined): string {
  if (!val) return '0'
  const num = typeof val === 'string' ? parseFloat(val) : val
  return isNaN(num) ? '0' : num.toLocaleString('ru-RU')
}
</script>
