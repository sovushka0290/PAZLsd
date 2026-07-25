<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      <div class="h-16 flex items-center px-6 border-b border-slate-100">
        <NuxtLink :to="localePath('/')" class="text-xl font-bold text-slate-900 flex items-center gap-2 hover:text-blue-600 transition-colors">
          <div class="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span class="text-white font-bold text-sm">P</span>
          </div>
          PAZL
        </NuxtLink>
      </div>

      <div class="flex-1 overflow-y-auto py-4">
        <nav class="space-y-1 px-3">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="localePath(item.path)"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="[
              route.path === localePath(item.path)
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-100'
            ]"
          >
            <span class="mr-3 text-lg">{{ item.icon }}</span>
            {{ item.name }}
          </NuxtLink>
        </nav>
      </div>

      <div class="p-4 border-t border-slate-200">
        <button
          class="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          @click="logout"
        >
          <span class="mr-3 text-lg">🚪</span>
          {{ t('auth.logout') }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Mobile Header -->
      <header class="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <NuxtLink :to="localePath('/')" class="text-xl font-bold text-slate-900">PAZL</NuxtLink>
        <button class="text-slate-500" @click="mobileMenuOpen = !mobileMenuOpen">
          <span class="text-2xl">☰</span>
        </button>
      </header>

      <!-- Mobile Menu (overlay) -->
      <div v-if="mobileMenuOpen" class="md:hidden fixed inset-0 z-50 bg-white">
        <div class="h-16 border-b border-slate-200 flex items-center justify-between px-4">
          <span class="font-bold">Меню</span>
          <button class="text-2xl" @click="mobileMenuOpen = false">✕</button>
        </div>
        <nav class="p-4 space-y-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="localePath(item.path)"
            class="block py-3 border-b border-slate-100"
            @click="mobileMenuOpen = false"
          >
            {{ item.icon }} {{ item.name }}
          </NuxtLink>
          <button class="block w-full text-left py-3 text-red-600" @click="logout">
            🚪 {{ t('auth.logout') }}
          </button>
        </nav>
      </div>

      <div class="flex-1 overflow-auto p-4 md:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)

const navItems = computed(() => {
  if (authStore.isSupplier) {
    return [
      { name: 'Дашборд', path: '/supplier', icon: '📊' },
      { name: t('auth.orders'), path: '/supplier/orders', icon: '📦' },
      { name: 'Товары', path: '/supplier/products', icon: '🏷️' },
      { name: t('auth.profile'), path: '/supplier/profile', icon: '👤' }
    ]
  }

  return [
    { name: t('auth.cabinet'), path: '/cabinet', icon: '🏠' },
    { name: t('auth.orders'), path: '/cabinet/orders', icon: '🛍️' },
    { name: 'Компания', path: '/cabinet/company', icon: '🏢' },
    { name: t('auth.profile'), path: '/cabinet/profile', icon: '👤' }
  ]
})

function logout() {
  authStore.logout()
  router.push(localePath('/login'))
}
</script>
