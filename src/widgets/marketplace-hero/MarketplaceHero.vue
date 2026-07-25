<template>
  <section class="marketplace-hero relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 py-16 lg:py-24 text-white">
    <!-- Background glow effects -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.3),transparent_50%)]"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.2),transparent_50%)]"></div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center relative z-10">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md mb-6 shadow-sm">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-xs font-extrabold uppercase tracking-widest text-blue-200">PAZL Marketplace</span>
        </div>

        <h1 class="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-md">
          PAZL — Маркетплейс Стоматологии
        </h1>
        <p class="mb-8 text-base text-blue-200 md:text-lg lg:text-xl font-medium max-w-2xl mx-auto">
          Единый умный поиск по 1 450+ медицинским товарам, инструментам и оборудованию с доставкой по всему Казахстану
        </p>
        
        <!-- Search Bar (Light theme) -->
        <div class="w-full relative group max-w-3xl mx-auto text-left z-20">
          <div class="absolute -inset-1 rounded-2xl bg-blue-100 opacity-50 blur transition duration-500"></div>
          <div class="relative flex items-center bg-white border border-gray-200 rounded-2xl p-2 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('hero.searchPlaceholder', 'Поиск по каталогу...')"
              class="w-full bg-transparent border-0 px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none"
              @focus="isFocused = true"
              @blur="handleBlur"
            />
            <button class="shrink-0 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors duration-200">
              Найти
            </button>
          </div>
          
          <!-- Autocomplete Dropdown -->
          <div
            v-if="isFocused && searchQuery.length >= 2"
            class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-96"
          >
            <div v-if="isLoading" class="p-4 text-center text-sm text-gray-500">
              Поиск...
            </div>
            <div v-else-if="suggestions.categories.length === 0 && suggestions.products.length === 0" class="p-4 text-center text-sm text-gray-500">
              Ничего не найдено
            </div>
            <ul v-else class="overflow-y-auto">
              <!-- Categories -->
              <li v-if="suggestions.categories.length > 0" class="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Категории
              </li>
              <li
                v-for="c in suggestions.categories"
                :key="'cat-'+c.id"
                @click="selectSuggestion(c.name)"
                class="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 transition-colors"
              >
                <div class="w-8 h-8 rounded bg-blue-100/50 text-blue-500 flex items-center justify-center shrink-0">
                  <UIcon name="i-lucide-folder" class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-800 truncate">{{ c.name }}</p>
                </div>
              </li>
              
              <!-- Products -->
              <li v-if="suggestions.products.length > 0" class="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Товары
              </li>
              <li
                v-for="p in suggestions.products"
                :key="'prod-'+p.id"
                @click="selectSuggestion(p.name)"
                class="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
              >
                <div class="w-8 h-8 rounded bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                  <UIcon name="i-lucide-search" class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-800 truncate">{{ p.name }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Quick Tags -->
        <div class="mt-8 flex flex-wrap justify-center gap-3 relative z-10">
          <span class="text-sm text-gray-500 mr-2 mt-2 hidden sm:block">Популярное:</span>
          <button v-for="tag in ['Оборудование', 'Инструменты', 'Материалы', 'Диагностика']" :key="tag" @click="searchQuery = tag" class="px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-sm text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer">
            {{ tag }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ApiProductDetailed } from '@fsd/shared/api/types'

const searchQuery = defineModel<string>({ default: '' })
const { t } = useI18n()

const isFocused = ref(false)
const isLoading = ref(false)
const suggestions = ref<{ categories: any[], products: any[] }>({ categories: [], products: [] })
let searchTimer: ReturnType<typeof setTimeout> | undefined


// Handle blur with delay so click on suggestion works
function handleBlur() {
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

function selectSuggestion(name: string) {
  searchQuery.value = name
  isFocused.value = false
}

watch(searchQuery, (q) => {
  clearTimeout(searchTimer)
  if (!q || q.length < 2) {
    suggestions.value = { categories: [], products: [] }
    return
  }
  
  isLoading.value = true
  searchTimer = setTimeout(async () => {
    try {
      const config = useRuntimeConfig()
      const versionPath = `/api/${config.public.apiVersion}`
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}${versionPath}`
        : versionPath
      
      const res = await $fetch<{ categories: any[], products: any[] }>('search_fast/', {
        baseURL,
        query: { query: q },
        retry: 0
      })
      suggestions.value = res || { categories: [], products: [] }
    } catch (e) {
      console.warn('Autocomplete fetch failed', e)
      suggestions.value = { categories: [], products: [] }
    } finally {
      isLoading.value = false
    }
  }, 300)
})
</script>

<style scoped>
</style>
