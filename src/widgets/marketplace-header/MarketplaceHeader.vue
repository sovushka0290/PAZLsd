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

        <!-- Left Drawer Catalog Button -->
        <button
          type="button"
          @click="isCategoryDrawerOpen = true"
          class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <UIcon name="i-lucide-layout-grid" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{{ t('catalog.categoriesTitle', 'Каталог') }}</span>
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

    <!-- Left Category Drawer (USlideover side="left") -->
    <USlideover
      v-model:open="isCategoryDrawerOpen"
      side="left"
      :ui="{ content: 'w-full max-w-sm sm:max-w-md bg-white flex flex-col h-full' }"
    >
      <template #title>
        <div class="flex items-center justify-between w-full border-b border-slate-100 pb-3">
          <span class="inline-flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <UIcon name="i-lucide-layout-grid" class="w-5 h-5 text-blue-600" />
            Каталог категорий
          </span>
        </div>
      </template>

      <template #body>
        <div class="py-2 overflow-y-auto space-y-1 pr-1">
          <!-- All Categories Option -->
          <button
            type="button"
            class="w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-between cursor-pointer hover:bg-blue-50 text-slate-800"
            @click="selectCategory('')"
          >
            <span class="flex items-center gap-2">
              <span class="text-base">📦</span>
              <span>Все товары</span>
            </span>
            <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">7 150</span>
          </button>

          <!-- Dynamic Categories & Subcategories -->
          <div
            v-for="cat in categoriesList"
            :key="cat.slug"
            class="rounded-xl border border-slate-100 overflow-hidden bg-slate-50/50"
          >
            <div
              class="w-full text-left px-3 py-2.5 font-bold text-sm flex items-center justify-between cursor-pointer hover:bg-blue-50/80 transition-colors text-slate-900"
              @click="toggleCategoryExpand(cat.slug)"
            >
              <div class="flex items-center gap-2 min-w-0 pr-2" @click.stop="selectCategory(cat.slug)">
                <span class="text-base shrink-0">{{ cat.icon || '📁' }}</span>
                <span class="truncate hover:text-blue-600 transition-colors">{{ cat.name }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {{ cat.products_count || 0 }}
                </span>
                <UIcon
                  :name="expandedSlugs.has(cat.slug) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="w-4 h-4 text-slate-400"
                />
              </div>
            </div>

            <!-- Subcategories List -->
            <div v-if="expandedSlugs.has(cat.slug) && cat.subcategories && cat.subcategories.length" class="bg-white border-t border-slate-100 py-1 px-2 space-y-0.5">
              <button
                v-for="sub in cat.subcategories"
                :key="sub.id"
                type="button"
                class="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                @click="selectSubcategory(cat.slug, sub.name)"
              >
                <span class="truncate">• {{ sub.name }}</span>
                <span class="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{{ sub.product_count }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const localePath = useLocalePath()
const authStore = useAuthStore()
const { t } = useI18n()
const router = useRouter()
const api = useMarketplaceApi()

const phoneHref = '+77077120190'

const showStaffModal = ref(false)
const staffUsername = ref('')
const staffPassword = ref('')
const staffError = ref('')
const isStaffLoggingIn = ref(false)

const isCategoryDrawerOpen = ref(false)
const categoriesList = ref<any[]>([])
const expandedSlugs = ref<Set<string>>(new Set())

onMounted(async () => {
  try {
    const all = await api.fetchAllCategories()
    categoriesList.value = all
  } catch (err) {
    console.warn('[MarketplaceHeader] Failed to load categories:', err)
  }
})

function toggleCategoryExpand(slug: string) {
  const next = new Set(expandedSlugs.value)
  if (next.has(slug)) {
    next.delete(slug)
  } else {
    next.add(slug)
  }
  expandedSlugs.value = next
}

function selectCategory(slug: string) {
  isCategoryDrawerOpen.value = false
  if (slug) {
    router.push(localePath(`/?category=${slug}`))
  } else {
    router.push(localePath('/'))
  }
}

function selectSubcategory(catSlug: string, subName: string) {
  isCategoryDrawerOpen.value = false
  router.push(localePath(`/?category=${catSlug}&subcategory=${encodeURIComponent(subName)}`))
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
</script>

<style scoped lang="scss">
.marketplace-header {
  width: 100%;
}
</style>
