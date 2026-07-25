<template>
  <div>
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Управление товарами</h1>
        <p class="text-slate-500 mt-1">Каталог товаров и их модификации</p>
      </div>
      <UButton
        :to="localePath('/admin/products/new')"
        color="primary"
        icon="i-lucide-plus"
        class="rounded-xl shadow-md"
      >
        Добавить товар
      </UButton>
    </div>

    <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100', body: { padding: 'p-0' } }">
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Поиск по названию или ID..."
          class="w-full sm:max-w-md"
          :ui="{ rounded: 'rounded-xl' }"
        />
        <USelect
          v-model="categoryFilter"
          :options="categoryOptions"
          class="w-full sm:w-64"
          :ui="{ rounded: 'rounded-xl' }"
        />
      </div>

      <div v-if="pending" class="p-12 text-center text-slate-500">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
        <p>Загрузка товаров...</p>
      </div>
      
      <div v-else-if="filteredProducts.length > 0">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-6 py-4 font-medium">Товар</th>
                <th class="px-6 py-4 font-medium">Категория</th>
                <th class="px-6 py-4 font-medium text-right">Цена</th>
                <th class="px-6 py-4 font-medium text-right">Статус</th>
                <th class="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="product in paginatedProducts" :key="product.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="product.images?.[0] || 'https://via.placeholder.com/40'" 
                      class="w-10 h-10 rounded-lg object-cover border border-slate-200"
                    />
                    <div class="max-w-[200px] truncate font-medium text-slate-900" :title="product.name">
                      {{ product.name }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-slate-500">
                  {{ product.categories?.[0] || 'Без категории' }}
                </td>
                <td class="px-6 py-4 text-right font-medium text-slate-900">
                  <template v-if="product.modifications?.length > 0 && product.modifications[0].price !== null && product.modifications[0].price !== undefined">
                    {{ product.modifications[0].price }} ₸
                  </template>
                  <template v-else-if="product.price !== null && product.price !== undefined">
                    {{ product.price }} ₸
                  </template>
                  <template v-else>
                    По запросу
                  </template>
                </td>
                <td class="px-6 py-4 text-right">
                  <UBadge color="green" variant="subtle" size="sm" class="rounded-lg">Активен</UBadge>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <UButton
                      :to="localePath(`/admin/products/${product.id}`)"
                      color="primary"
                      variant="soft"
                      size="sm"
                      icon="i-lucide-pencil"
                      class="rounded-lg"
                      title="Редактировать"
                    />
                    <UButton
                      v-if="authStore.isAdmin"
                      color="red"
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-trash-2"
                      class="rounded-lg"
                      title="Удалить"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <p class="text-sm text-slate-500">Показано {{ page * limit - limit + 1 }} - {{ Math.min(page * limit, filteredProducts.length) }} из {{ filteredProducts.length }}</p>
          <UPagination
            v-model="page"
            :page-count="limit"
            :total="filteredProducts.length"
            :ui="{ rounded: 'rounded-lg' }"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-12 text-center text-slate-500">
        <UIcon name="i-lucide-package-x" class="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p class="font-medium text-slate-900 text-lg">Товары не найдены</p>
        <p class="text-sm mt-1">По вашему запросу ничего не найдено.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const authStore = useAuthStore()
const localePath = useLocalePath()

const searchQuery = ref('')
const categoryFilter = ref('all')
const page = ref(1)
const limit = 20

const categoryOptions = [
  { label: 'Все категории', value: 'all' },
  { label: 'Стоматология', value: 'Стоматология' },
  { label: 'Расходные материалы', value: 'Расходные материалы' }
]

// Fetch products directly from json file for now
const { data: rawProducts, pending } = await useFetch('/api/products-mock')

const filteredProducts = computed(() => {
  if (!rawProducts.value) return []
  
  return rawProducts.value.filter((p: any) => {
    // Search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!p.name.toLowerCase().includes(q)) return false
    }
    
    // Category filter
    if (categoryFilter.value !== 'all') {
      if (!p.categories || !p.categories.includes(categoryFilter.value)) return false
    }
    
    return true
  })
})

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * limit
  return filteredProducts.value.slice(start, start + limit)
})

// Reset page when filters change
watch([searchQuery, categoryFilter], () => {
  page.value = 1
})

useSeoMeta({
  title: 'Товары | PAZL Admin'
})
</script>
