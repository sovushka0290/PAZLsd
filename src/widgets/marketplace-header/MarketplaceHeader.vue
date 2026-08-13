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

        <div class="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center">
          <IconLogoMark />
        </div>
        <div class="hidden md:block ml-1">
          <h1 class="text-2xl font-black leading-tight text-slate-900 tracking-tight">
            {{ t('brand.name') }}
          </h1>
        </div>

        <!-- Left Drawer Catalog Button -->
        <button
          type="button"
          @click="emit('toggle-catalog')"
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

    <!-- Left Category Drawer (USlideover) REMOVED - Using Embedded Drawer in Index -->
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const emit = defineEmits<{
  (e: 'toggle-catalog'): void
}>()

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
