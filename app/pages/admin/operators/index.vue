<template>
  <div>
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Управление операторами</h1>
        <p class="text-slate-500 mt-1">Добавление и удаление аккаунтов операторов</p>
      </div>
      <UButton
        @click="isAddModalOpen = true"
        color="primary"
        icon="i-lucide-user-plus"
        class="rounded-xl shadow-md"
      >
        Добавить оператора
      </UButton>
    </div>

    <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100', body: { padding: 'p-0' } }">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-6 py-4 font-medium">Имя пользователя / Логин</th>
              <th class="px-6 py-4 font-medium">Имя сотрудника</th>
              <th class="px-6 py-4 font-medium">Статус</th>
              <th class="px-6 py-4 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="operator in operators" :key="operator.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <UAvatar :alt="operator.firstName" size="sm" class="bg-blue-100 text-blue-600" />
                  <div class="font-medium text-slate-900">{{ operator.username }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600">
                {{ operator.firstName }} {{ operator.lastName }}
              </td>
              <td class="px-6 py-4">
                <UBadge color="green" variant="subtle" size="sm" class="rounded-lg">Активен</UBadge>
              </td>
              <td class="px-6 py-4 text-right">
                <UButton
                  color="red"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-trash-2"
                  class="rounded-lg"
                  title="Удалить"
                  @click="deleteOperator(operator.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Add Operator Modal -->
    <UModal v-model="isAddModalOpen" :ui="{ rounded: 'rounded-2xl' }">
      <UCard :ui="{ rounded: 'rounded-2xl', ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">Новый оператор</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isAddModalOpen = false" />
          </div>
        </template>
        
        <form @submit.prevent="addOperator" class="space-y-4">
          <UFormGroup label="Логин (Username)" required>
            <UInput v-model="form.username" placeholder="operator_ivan" icon="i-lucide-user" />
          </UFormGroup>
          <UFormGroup label="Пароль" required>
            <UInput v-model="form.password" type="password" placeholder="••••••••" icon="i-lucide-lock" />
          </UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Имя">
              <UInput v-model="form.firstName" placeholder="Иван" />
            </UFormGroup>
            <UFormGroup label="Фамилия">
              <UInput v-model="form.lastName" placeholder="Иванов" />
            </UFormGroup>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <UButton color="gray" variant="ghost" @click="isAddModalOpen = false">Отмена</UButton>
            <UButton type="submit" color="primary" class="rounded-lg shadow-sm">Создать</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useSeoMeta({
  title: 'Операторы | PAZL Admin'
})

const authStore = useAuthStore()

const isAddModalOpen = ref(false)

const form = reactive({
  username: '',
  password: '',
  firstName: '',
  lastName: ''
})

// Mock operators data
const operators = ref([
  { id: 1, username: 'operator', firstName: 'Тестовый', lastName: 'Оператор' },
  { id: 2, username: 'operator_anna', firstName: 'Анна', lastName: 'Смирнова' }
])

function addOperator() {
  if (!form.username || !form.password) return
  
  operators.value.push({
    id: Date.now(),
    username: form.username,
    firstName: form.firstName,
    lastName: form.lastName
  })
  
  isAddModalOpen.value = false
  form.username = ''
  form.password = ''
  form.firstName = ''
  form.lastName = ''
}

function deleteOperator(id: number) {
  operators.value = operators.value.filter(o => o.id !== id)
}
</script>
