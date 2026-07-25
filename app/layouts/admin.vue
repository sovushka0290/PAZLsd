<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden font-sans">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm z-20">
      <div class="h-16 flex items-center px-6 border-b border-slate-100">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 mr-3">
          <span class="text-white font-bold">P</span>
        </div>
        <span class="text-lg font-bold text-slate-900">PAZL Admin</span>
      </div>

      <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <UButton
          v-for="item in navItems"
          :key="item.path"
          :to="localePath(item.path)"
          variant="ghost"
          color="neutral"
          class="w-full justify-start rounded-xl px-3 py-2 text-sm font-medium transition-colors"
          :class="route.path === localePath(item.path) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <template #leading>
            <UIcon :name="item.icon" class="w-5 h-5 mr-1" :class="route.path === localePath(item.path) ? 'text-blue-600' : 'text-slate-400'" />
          </template>
          {{ item.name }}
        </UButton>
      </div>

      <div class="p-4 border-t border-slate-200">
        <div class="flex items-center mb-4 px-2">
          <UAvatar :alt="authStore.user?.first_name || 'U'" size="md" class="bg-blue-100 text-blue-600 mr-3" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">{{ authStore.user?.first_name || authStore.user?.username }}</p>
            <p class="text-xs text-slate-500 truncate">{{ authStore.isAdmin ? 'Администратор' : 'Оператор' }}</p>
          </div>
        </div>
        <UButton
          icon="i-lucide-log-out"
          variant="ghost"
          color="red"
          class="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl"
          @click="handleLogout"
        >
          Выйти
        </UButton>
      </div>
    </aside>

    <!-- Mobile Slideover -->
    <USlideover v-model="isMobileMenuOpen" side="left" class="w-64 z-50">
      <template #content>
        <div class="flex flex-col h-full bg-white">
          <div class="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div class="flex items-center">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 mr-3">
                <span class="text-white font-bold">P</span>
              </div>
              <span class="text-lg font-bold text-slate-900">PAZL</span>
            </div>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" @click="isMobileMenuOpen = false" />
          </div>

          <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <UButton
              v-for="item in navItems"
              :key="item.path"
              :to="localePath(item.path)"
              variant="ghost"
              color="neutral"
              class="w-full justify-start rounded-xl px-3 py-2 text-sm font-medium"
              :class="route.path === localePath(item.path) ? 'bg-blue-50 text-blue-700' : 'text-slate-600'"
              @click="isMobileMenuOpen = false"
            >
              <template #leading>
                <UIcon :name="item.icon" class="w-5 h-5 mr-1" />
              </template>
              {{ item.name }}
            </UButton>
          </div>

          <div class="p-4 border-t border-slate-200">
            <UButton
              icon="i-lucide-log-out"
              variant="ghost"
              color="red"
              class="w-full justify-start rounded-xl"
              @click="handleLogout"
            >
              Выйти
            </UButton>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top header -->
      <header class="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 shadow-sm z-10">
        <div class="flex items-center">
          <UButton
            icon="i-lucide-menu"
            variant="ghost"
            color="neutral"
            class="md:hidden mr-2"
            @click="isMobileMenuOpen = true"
          />
          <UBreadcrumb :items="breadcrumbItems" class="hidden sm:flex" />
        </div>
        <div class="flex items-center gap-4">
          <UButton icon="i-lucide-bell" variant="ghost" color="neutral" class="text-slate-500 rounded-full" />
          <UAvatar :alt="authStore.user?.first_name || 'U'" size="sm" class="bg-blue-100 text-blue-600 md:hidden" />
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const localePath = useLocalePath()

const isMobileMenuOpen = ref(false)

onMounted(() => {
  authStore.initFromCookie()
})

const allNavItems = [
  { name: 'Дашборд', path: '/admin', icon: 'i-lucide-layout-dashboard', roles: ['admin', 'operator'] },
  { name: 'Заказы', path: '/admin/orders', icon: 'i-lucide-shopping-bag', roles: ['admin', 'operator'] },
  { name: 'Товары', path: '/admin/products', icon: 'i-lucide-package', roles: ['admin', 'operator'] },
  { name: 'Категории', path: '/admin/categories', icon: 'i-lucide-folder-tree', roles: ['admin'] },
  { name: 'Операторы', path: '/admin/operators', icon: 'i-lucide-users', roles: ['admin'] }
]

const navItems = computed(() => {
  const role = authStore.user?.role || 'operator'
  return allNavItems.filter(item => item.roles.includes(role))
})

const breadcrumbItems = computed(() => {
  const items = [{ label: 'Панель управления', to: localePath('/admin') }]
  
  if (route.path.includes('/products')) {
    items.push({ label: 'Товары', to: localePath('/admin/products') })
    if (route.path.includes('/new')) items.push({ label: 'Добавление' })
    else if (route.params.id) items.push({ label: 'Редактирование' })
  } else if (route.path.includes('/orders')) {
    items.push({ label: 'Заказы', to: localePath('/admin/orders') })
  } else if (route.path.includes('/categories')) {
    items.push({ label: 'Категории', to: localePath('/admin/categories') })
  }
  
  return items
})

function handleLogout() {
  authStore.logout()
  window.location.href = localePath('/admin/login')
}
</script>
