<template>
  <header class="marketplace-header sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm transition-all w-full">
    <div class="absolute top-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500"></div>
    <div class="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4 w-full">
      <div class="flex items-center gap-2 sm:gap-3 shrink-0 relative">
        <!-- Secret Auth Dot for Staff (Admin / Operator) -->
        <button
          type="button"
          title="Служебная авторизация"
          class="w-2.5 h-2.5 rounded-full bg-slate-200 hover:bg-blue-600 transition-all duration-300 cursor-pointer -mr-1"
          @click="showStaffModal = true"
        />

        <div class="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20">
          <IconLogoMark />
        </div>
        <div class="hidden md:block">
          <h1 class="text-2xl font-extrabold leading-tight text-slate-900 tracking-tight">
            {{ t('brand.name') }}
          </h1>
        </div>

        <!-- Mega Menu Catalog Button -->
        <button
          type="button"
          @click="isMegaMenuOpen = !isMegaMenuOpen"
          class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <UIcon :name="isMegaMenuOpen ? 'i-lucide-x' : 'i-lucide-layout-grid'" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="hidden sm:inline">{{ t('catalog.categoriesTitle', 'Каталог') }}</span>
        </button>
      </div>

      <!-- Secret Staff Login Modal -->
      <div v-if="showStaffModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" @click.self="showStaffModal = false">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🔐</span> Служебный вход
            </h3>
            <button class="text-slate-400 hover:text-slate-600 text-xl" @click="showStaffModal = false">×</button>
          </div>
          <p class="text-xs text-slate-500 mb-4">Вход для Администраторов и Операторов системы</p>
          <form class="space-y-3" @submit.prevent="handleStaffLogin">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Логин</label>
              <input v-model="staffUsername" type="text" placeholder="admin / operator" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Пароль</label>
              <input v-model="staffPassword" type="password" placeholder="••••••••" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <p v-if="staffError" class="text-xs text-red-600">{{ staffError }}</p>
            <button type="submit" :disabled="isStaffLoggingIn" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all shadow-sm">
              {{ isStaffLoggingIn ? 'Вход...' : 'Войти в панель' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="flex-1 max-w-xl relative hidden md:block">
        <div class="relative flex items-center bg-slate-100/70 border border-slate-200/80 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 focus-within:bg-white transition-all">
          <UIcon name="i-lucide-search" class="w-5 h-5 text-gray-400 shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('hero.searchPlaceholder', 'Поиск по каталогу...')"
            class="w-full bg-transparent border-0 px-3 py-1 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
            @focus="isFocused = true"
            @blur="handleBlur"
          />
        </div>
        
        <!-- Autocomplete Dropdown -->
        <div
          v-if="isFocused && searchQuery.length >= 2"
          class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden z-[60] flex flex-col max-h-96"
        >
          <div v-if="isLoading" class="p-4 text-center text-sm text-gray-500">Поиск...</div>
          <div v-else-if="suggestions.categories.length === 0 && suggestions.products.length === 0" class="p-4 text-center text-sm text-gray-500">Ничего не найдено</div>
          <ul v-else class="overflow-y-auto">
            <li v-if="suggestions.categories.length > 0" class="px-4 py-2 bg-slate-50 dark:bg-neutral-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">Категории</li>
            <li
              v-for="c in suggestions.categories"
              :key="'cat-'+c.id"
              @mousedown="selectSuggestion(c.name)"
              class="px-4 py-2 hover:bg-blue-50 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-neutral-800 transition-colors"
            >
              <div class="w-7 h-7 rounded bg-blue-100/50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-folder" class="w-3.5 h-3.5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 dark:text-neutral-200 truncate">{{ c.name }}</p>
              </div>
            </li>
            
            <li v-if="suggestions.products.length > 0" class="px-4 py-2 bg-slate-50 dark:bg-neutral-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">Товары</li>
            <li
              v-for="p in suggestions.products"
              :key="'prod-'+p.id"
              @mousedown="selectSuggestion(p.name)"
              class="px-4 py-2 hover:bg-blue-50 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-neutral-800 last:border-0 transition-colors"
            >
              <div class="w-7 h-7 rounded bg-gray-100 dark:bg-neutral-800 text-gray-400 flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-search" class="w-3.5 h-3.5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 dark:text-neutral-200 truncate">{{ p.name }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Right Action Items -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <div class="hidden xl:flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-neutral-400">
          <a :href="`tel:${phoneHref}`" class="flex items-center gap-1.5 transition-all hover:text-blue-600">
            <IconPhone class="text-slate-400" />
            {{ t('header.phone') }}
          </a>
        </div>

        <div class="hidden sm:flex items-center gap-2">
          <FeedbackModal />
          <LocaleSwitcher />
        </div>
        
        <!-- Login / Cabinet Link -->
        <NuxtLink
          :to="localePath(authStore.isAuthenticated ? (authStore.isAdmin ? '/admin' : (authStore.isSupplier ? '/supplier/products' : '/cabinet')) : '/login')"
          class="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-auto sm:px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-medium transition-colors border border-slate-200/50 dark:border-neutral-700/50 shrink-0"
        >
          <UIcon name="i-lucide-user" class="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1.5" />
          <span class="hidden sm:block text-xs sm:text-sm">
            {{ authStore.isAuthenticated ? t('auth.cabinet') : t('auth.login') }}
          </span>
        </NuxtLink>

        <!-- Cart Button -->
        <MarketplaceCart class="shrink-0" />
      </div>
    </div>

    <!-- Mega Menu Backdrop & Dropdown Container -->
    <div
      v-if="isMegaMenuOpen"
      class="fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-xs z-40"
      @click="isMegaMenuOpen = false"
    />

    <div
      v-if="isMegaMenuOpen"
      class="absolute top-16 left-0 right-0 z-50 bg-white border-b border-slate-200/90 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UIcon name="i-lucide-layout-grid" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Каталог медицинских категорий</h3>
              <p class="text-xs text-slate-500">Быстрый переход к разделам стоматологического оборудования и материалов</p>
            </div>
          </div>
          <button
            class="text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            @click="isMegaMenuOpen = false"
          >
            Закрыть ✕
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="cat in megaMenuCategories"
            :key="cat.slug"
            class="group p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer"
            @click="navigateToCategory(cat.slug)"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <UIcon :name="cat.icon" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {{ cat.name }}
                </h4>
                <p class="text-xs text-slate-400 font-medium">{{ cat.count }} товаров</p>
              </div>
            </div>
            <ul class="space-y-1.5 pl-2 border-l-2 border-slate-100 group-hover:border-blue-300 transition-colors">
              <li
                v-for="sub in cat.subcategories"
                :key="sub"
                class="text-xs text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                • {{ sub }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const localePath = useLocalePath()
const authStore = useAuthStore()
const searchQuery = defineModel<string>({ default: '' })
const { t } = useI18n()

const phoneHref = '+77077120190'
const emailHref = 'info@pazl-ai.com'

const showStaffModal = ref(false)
const staffUsername = ref('')
const staffPassword = ref('')
const staffError = ref('')
const isStaffLoggingIn = ref(false)
const router = useRouter()

const isMegaMenuOpen = ref(false)

const megaMenuCategories = [
  {
    slug: 'terapiya',
    name: 'Терапия',
    count: 245,
    icon: 'i-lucide-stethoscope',
    subcategories: ['Пломбировочные материалы', 'Адгезивы и протравки', 'Слепочные массы', 'Полировочные системы']
  },
  {
    slug: 'endodontiya',
    name: 'Эндодонтия',
    count: 180,
    icon: 'i-lucide-activity',
    subcategories: ['Эндодонтические файлы', 'Силеры и гуттаперча', 'Апекслокаторы', 'Ирригационные растворы']
  },
  {
    slug: 'ortopediya',
    name: 'Ортопедия',
    count: 210,
    icon: 'i-lucide-smile',
    subcategories: ['Цементы для фиксации', 'Оттискные ложки', 'Временные коронки', 'Артикуляторы']
  },
  {
    slug: 'oborudovanie',
    name: 'Оборудование',
    count: 165,
    icon: 'i-lucide-zap',
    subcategories: ['Стоматологические установки', 'Реакторы и автоклавы', 'Скалеры и наконечники', 'Полимеризационные лампы']
  },
  {
    slug: 'khirurgiya',
    name: 'Хирургия и Имплантология',
    count: 195,
    icon: 'i-lucide-scissors',
    subcategories: ['Имплантационные системы', 'Костные материалы', 'Шовный материал', 'Хирургические инструменты']
  },
  {
    slug: 'rashodniki',
    name: 'Расходные материалы',
    count: 458,
    icon: 'i-lucide-package',
    subcategories: ['Маски и перчатки', 'Слюноотсосы и валики', 'Дезинфекция и стерилизация', 'Одноразовые лотки']
  }
]

function navigateToCategory(slug: string) {
  isMegaMenuOpen.value = false
  router.push(localePath(`/?category=${slug}`))
}

async function handleStaffLogin() {
  staffError.value = ''
  isStaffLoggingIn.value = true
  try {
    await authStore.login(staffUsername.value, staffPassword.value)
    showStaffModal.value = false
    if (authStore.isAdmin) {
      router.push(localePath('/admin'))
    } else if (authStore.isOperator) {
      router.push(localePath('/operator'))
    }
  } catch (err: any) {
    staffError.value = err.message || 'Ошибка входа'
  } finally {
    isStaffLoggingIn.value = false
  }
}

const isFocused = ref(false)
const isLoading = ref(false)
const suggestions = ref<{ categories: any[], products: any[] }>({ categories: [], products: [] })
let searchTimer: ReturnType<typeof setTimeout> | undefined

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
      
      const res = await $fetch<{ categories: any[], products: any[] }>('catalog/product-autocomplete/', {
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

<style scoped lang="scss">
.marketplace-header {
  width: 100%;
}
</style>
