<template>
  <div>
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Категории</h1>
        <p class="text-slate-500 mt-1">Управление структурой каталога</p>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        class="rounded-xl shadow-md"
        @click="openCategoryModal()"
      >
        Создать категорию
      </UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-2">
        <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100', body: { padding: 'p-0' } }">
          <div class="divide-y divide-slate-100">
            <div v-for="category in categories" :key="category.id" class="p-4 hover:bg-slate-50 transition-colors group flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-folder" class="w-5 h-5 text-blue-500" />
                <span class="font-medium text-slate-900">{{ category.name }}</span>
                <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{{ category.count }} товаров</span>
              </div>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <UButton color="neutral" variant="ghost" icon="i-lucide-pencil" size="sm" @click="openCategoryModal(category)" />
                <UButton color="red" variant="ghost" icon="i-lucide-trash-2" size="sm" />
              </div>
            </div>
          </div>
        </UCard>
      </div>
      
      <div>
        <UCard :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100', body: { padding: 'p-6' }, background: 'bg-blue-50/50' }">
          <UIcon name="i-lucide-info" class="w-6 h-6 text-blue-600 mb-3" />
          <h3 class="font-bold text-slate-900 mb-2">Совет</h3>
          <p class="text-sm text-slate-600">
            Для корректного отображения каталога создавайте не более 2-3 уровней вложенности. 
            Категории без товаров автоматически скрываются на сайте для обычных пользователей.
          </p>
        </UCard>
      </div>
    </div>

    <!-- Edit Modal -->
    <UModal v-model="isModalOpen" :ui="{ rounded: 'rounded-2xl' }">
      <UCard :ui="{ rounded: 'rounded-2xl', ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">
              {{ editingCategory ? 'Редактирование категории' : 'Новая категория' }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isModalOpen = false" />
          </div>
        </template>

        <div class="space-y-4">
          <UFormField label="Название категории" required>
            <UInput v-model="form.name" placeholder="Например: Стоматология" :ui="{ rounded: 'rounded-xl' }" />
          </UFormField>
          
          <UFormField label="Родительская категория">
            <USelect v-model="form.parentId" :options="parentOptions" :ui="{ rounded: 'rounded-xl' }" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="neutral" variant="ghost" @click="isModalOpen = false">Отмена</UButton>
            <UButton color="primary" class="rounded-xl" @click="saveCategory" :loading="isSaving">Сохранить</UButton>
          </div>
        </template>
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

const isModalOpen = ref(false)
const editingCategory = ref<any>(null)
const isSaving = ref(false)
const toast = useToast()

const categories = ref([
  { id: 1, name: 'Стоматология', count: 120 },
  { id: 2, name: 'Расходные материалы', count: 45 },
  { id: 3, name: 'Оборудование', count: 12 },
  { id: 4, name: 'Ортодонтия', count: 34 }
])

const parentOptions = [
  { label: 'Корневая категория', value: null },
  ...categories.value.map(c => ({ label: c.name, value: c.id }))
]

const form = reactive({
  name: '',
  parentId: null as number | null
})

function openCategoryModal(category: any = null) {
  editingCategory.value = category
  if (category) {
    form.name = category.name
    form.parentId = null // Mock
  } else {
    form.name = ''
    form.parentId = null
  }
  isModalOpen.value = true
}

async function saveCategory() {
  if (!form.name) return
  
  isSaving.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (editingCategory.value) {
    editingCategory.value.name = form.name
  } else {
    categories.value.push({
      id: Date.now(),
      name: form.name,
      count: 0
    })
  }
  
  isSaving.value = false
  isModalOpen.value = false
  
  toast.add({
    title: 'Успешно',
    description: 'Категория сохранена',
    color: 'green'
  })
}

useSeoMeta({
  title: 'Категории | PAZL Admin'
})
</script>
