<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">Панель управления</h1>
      <p class="text-slate-500 mt-1">Сводка и статистика магазина</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100' }">
        <div class="flex items-center">
          <div class="p-3 bg-blue-50 rounded-xl mr-4">
            <UIcon name="i-lucide-package" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Всего товаров</p>
            <p class="text-2xl font-bold text-slate-900">109</p>
          </div>
        </div>
      </UCard>
      
      <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100' }">
        <div class="flex items-center">
          <div class="p-3 bg-green-50 rounded-xl mr-4">
            <UIcon name="i-lucide-folder-tree" class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Категорий</p>
            <p class="text-2xl font-bold text-slate-900">12</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100' }">
        <div class="flex items-center">
          <div class="p-3 bg-orange-50 rounded-xl mr-4">
            <UIcon name="i-lucide-shopping-bag" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Заказов (за месяц)</p>
            <p class="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100' }">
        <div class="flex items-center">
          <div class="p-3 bg-purple-50 rounded-xl mr-4">
            <UIcon name="i-lucide-users" class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Операторов</p>
            <p class="text-2xl font-bold text-slate-900">2</p>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Orders -->
      <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-slate-900">Последние заказы</h2>
          <UButton :to="localePath('/admin/orders')" variant="ghost" color="primary" class="text-sm">
            Все заказы
          </UButton>
        </div>
        <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100', body: { padding: 'p-0' } }">
          <div class="p-12 text-center flex flex-col items-center justify-center text-slate-500">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <UIcon name="i-lucide-inbox" class="w-8 h-8 text-slate-400" />
            </div>
            <p class="font-medium text-slate-900">Заказов пока нет</p>
            <p class="text-sm mt-1">Здесь будут отображаться новые заказы от клиентов.</p>
          </div>
        </UCard>
      </div>

      <!-- Quick Actions -->
      <div>
        <h2 class="text-lg font-bold text-slate-900 mb-4">Быстрые действия</h2>
        <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100' }">
          <div class="space-y-3">
            <UButton
              :to="localePath('/admin/products/new')"
              block
              color="primary"
              variant="soft"
              icon="i-lucide-plus"
              class="justify-start rounded-xl py-3"
            >
              Добавить товар
            </UButton>
            <UButton
              v-if="authStore.isAdmin"
              :to="localePath('/admin/suppliers')"
              block
              color="primary"
              variant="solid"
              icon="i-lucide-file-text"
              class="justify-start rounded-xl py-3"
            >
              Заявки поставщиков (Модерация)
            </UButton>
            <UButton
              v-if="authStore.isAdmin"
              :to="localePath('/admin/categories')"
              block
              color="neutral"
              variant="soft"
              icon="i-lucide-folder-plus"
              class="justify-start rounded-xl py-3"
            >
              Создать категорию
            </UButton>
            <UButton
              :to="localePath('/admin/products')"
              block
              color="neutral"
              variant="ghost"
              icon="i-lucide-search"
              class="justify-start rounded-xl py-3 bg-slate-50"
            >
              Найти товар
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
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

useSeoMeta({
  title: 'Дашборд | PAZL Admin'
})
</script>
