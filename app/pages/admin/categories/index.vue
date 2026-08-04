<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8">
    <div class="mx-auto max-w-5xl space-y-6">
      
      <!-- Header Area -->
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Категории
          </h1>
          <p class="text-sm text-slate-500 mt-1 font-medium">
            Управление категориями и подкатегориями каталога
          </p>
        </div>
        
        <UButton
          icon="i-lucide-plus"
          size="lg"
          color="blue"
          class="font-bold w-full md:w-auto justify-center rounded-xl"
          @click="openModal(null)"
        >
          Создать категорию
        </UButton>
      </div>

      <!-- Controls Area (Search) -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 md:flex-row md:items-center">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Поиск категорий..."
          class="w-full md:max-w-md"
          size="lg"
          :ui="{ wrapper: 'relative', base: 'rounded-xl' }"
        />
      </div>

      <!-- Categories Tree -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div v-if="filteredCategoriesTree.length === 0" class="p-8 text-center text-slate-500 font-medium">
          Категории не найдены
        </div>
        
        <div v-else class="divide-y divide-slate-100 flex flex-col">
          <div 
            v-for="cat in filteredCategoriesTree" 
            :key="cat.id" 
            class="flex flex-col"
          >
            <!-- Parent Category Row -->
            <div class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-3">
                <UButton
                  v-if="cat.children && cat.children.length > 0"
                  color="gray"
                  variant="ghost"
                  :icon="expanded[cat.id] ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                  @click="toggleExpand(cat.id)"
                  class="rounded-lg"
                />
                <div v-else class="w-8"></div> <!-- Spacer for alignment -->
                
                <div class="flex flex-col">
                  <span class="font-extrabold text-slate-900 text-lg">
                    {{ cat.name }}
                  </span>
                  <span v-if="cat.description" class="text-sm text-slate-500 line-clamp-1">
                    {{ cat.description }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <UBadge color="gray" variant="soft" class="font-bold rounded-lg px-2">
                  {{ cat.productCount || 0 }} шт.
                </UBadge>
                <div class="flex items-center gap-1">
                  <UButton
                    icon="i-lucide-pencil"
                    color="gray"
                    variant="ghost"
                    @click="openModal(cat)"
                    class="rounded-lg"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="red"
                    variant="ghost"
                    @click="confirmDelete(cat)"
                    class="rounded-lg"
                  />
                </div>
              </div>
            </div>

            <!-- Children / Subcategories -->
            <div 
              v-if="expanded[cat.id] && cat.children && cat.children.length > 0" 
              class="flex flex-col bg-slate-50 border-t border-slate-100"
            >
              <div 
                v-for="sub in cat.children" 
                :key="sub.id" 
                class="flex items-center justify-between py-3 pr-4 pl-14 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-b-0"
              >
                <div class="flex flex-col">
                  <span class="font-bold text-slate-800">
                    {{ sub.name }}
                  </span>
                  <span v-if="sub.description" class="text-xs text-slate-500 line-clamp-1">
                    {{ sub.description }}
                  </span>
                </div>

                <div class="flex items-center gap-3">
                  <UBadge color="gray" variant="soft" class="font-bold rounded-lg px-2">
                    {{ sub.productCount || 0 }} шт.
                  </UBadge>
                  <div class="flex items-center gap-1">
                    <UButton
                      icon="i-lucide-pencil"
                      color="gray"
                      variant="ghost"
                      size="sm"
                      @click="openModal(sub)"
                      class="rounded-lg"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      color="red"
                      variant="ghost"
                      size="sm"
                      @click="confirmDelete(sub)"
                      class="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model="isModalOpen">
      <div class="p-6 bg-white rounded-2xl space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-slate-900">
            {{ isEditing ? 'Редактировать категорию' : 'Создать категорию' }}
          </h2>
          <UButton
            icon="i-lucide-x"
            color="gray"
            variant="ghost"
            class="rounded-lg"
            @click="isModalOpen = false"
          />
        </div>

        <form @submit.prevent="saveCategory" class="space-y-4">
          <UFormGroup label="Название" required>
            <UInput 
              v-model="form.name" 
              placeholder="Введите название" 
              size="lg"
              class="font-medium"
              :ui="{ base: 'rounded-xl' }"
            />
          </UFormGroup>

          <UFormGroup label="Родительская категория">
            <USelectMenu
              v-model="form.parentId"
              :options="parentOptions"
              value-attribute="value"
              option-attribute="label"
              placeholder="Корневая категория"
              size="lg"
              :ui="{ base: 'rounded-xl' }"
            />
          </UFormGroup>

          <UFormGroup label="Описание">
            <UTextarea 
              v-model="form.description" 
              placeholder="Краткое описание категории"
              :rows="3"
              size="lg"
              :ui="{ base: 'rounded-xl' }"
            />
          </UFormGroup>

          <div class="flex gap-3 pt-2">
            <UButton 
              color="gray" 
              variant="soft" 
              class="flex-1 justify-center rounded-xl font-bold" 
              size="lg"
              @click="isModalOpen = false"
            >
              Отмена
            </UButton>
            <UButton 
              type="submit" 
              color="blue" 
              class="flex-1 justify-center rounded-xl font-bold"
              size="lg"
              :disabled="!form.name"
            >
              Сохранить
            </UButton>
          </div>
        </form>
      </div>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <div class="p-6 bg-white rounded-2xl space-y-6 text-center">
        <div class="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-red-600" />
        </div>
        
        <div>
          <h3 class="text-lg font-extrabold text-slate-900 mb-2">Удалить категорию?</h3>
          <p class="text-sm text-slate-500 font-medium">
            Вы уверены, что хотите удалить «{{ categoryToDelete?.name }}»? 
            <span v-if="hasChildren(categoryToDelete?.id)">Вместе с ней будут удалены все подкатегории.</span>
            Это действие нельзя отменить.
          </p>
        </div>

        <div class="flex gap-3">
          <UButton 
            color="gray" 
            variant="soft" 
            class="flex-1 justify-center rounded-xl font-bold" 
            size="lg"
            @click="isDeleteModalOpen = false"
          >
            Отмена
          </UButton>
          <UButton 
            color="red" 
            class="flex-1 justify-center rounded-xl font-bold"
            size="lg"
            @click="executeDelete"
          >
            Удалить
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const toast = useToast()

interface Category {
  id: number
  name: string
  parentId: number | null
  description?: string
  productCount?: number
}

// Flat structure in state
const categories = ref<Category[]>([])

// Search and expanded state
const searchQuery = ref('')
const expanded = ref<Record<number, boolean>>({})

// Modals state
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isEditing = ref(false)
const categoryToDelete = ref<Category | null>(null)

// Form state
const form = ref({
  id: null as number | null,
  name: '',
  parentId: null as number | null,
  description: ''
})

const STORAGE_KEY = 'pazl_admin_categories'

const defaultData: Category[] = [
  { id: 1, name: 'Расходные материалы', parentId: null, description: 'Все расходники для стоматологии', productCount: 42 },
  { id: 11, name: 'Композиты', parentId: 1, productCount: 15 },
  { id: 12, name: 'Боры и фрезы', parentId: 1, productCount: 8 },
  { id: 13, name: 'Эндодонтия (файлы, штифты)', parentId: 1, productCount: 5 },
  { id: 14, name: 'Адгезивные системы', parentId: 1, productCount: 3 },
  { id: 15, name: 'Оттискные материалы', parentId: 1, productCount: 6 },
  { id: 16, name: 'Цементы стоматологические', parentId: 1, productCount: 5 },
  { id: 2, name: 'Оборудование', parentId: null, productCount: 20 },
  { id: 21, name: 'Стоматологические установки', parentId: 2, productCount: 4 },
  { id: 22, name: 'Рентген-аппараты', parentId: 2, productCount: 2 },
  { id: 23, name: 'Автоклавы и стерилизация', parentId: 2, productCount: 5 },
  { id: 24, name: 'Лампы полимеризационные', parentId: 2, productCount: 6 },
  { id: 25, name: 'Скайлеры ультразвуковые', parentId: 2, productCount: 3 },
  { id: 3, name: 'Инструменты', parentId: null, productCount: 35 },
  { id: 31, name: 'Ручные инструменты', parentId: 3, productCount: 15 },
  { id: 32, name: 'Наконечники', parentId: 3, productCount: 10 },
  { id: 33, name: 'Хирургические инструменты', parentId: 3, productCount: 10 },
  { id: 4, name: 'Ортодонтия', parentId: null, productCount: 12 },
  { id: 41, name: 'Брекет-системы', parentId: 4, productCount: 8 },
  { id: 42, name: 'Ортодонтические дуги и лигатуры', parentId: 4, productCount: 4 },
  { id: 5, name: 'Гигиена и профилактика', parentId: null, productCount: 18 },
  { id: 51, name: 'Пасты профессиональные', parentId: 5, productCount: 10 },
  { id: 52, name: 'Фторирование', parentId: 5, productCount: 8 },
  { id: 6, name: 'Зуботехника', parentId: null, productCount: 25 },
  { id: 61, name: 'Керамика и циркон', parentId: 6, productCount: 15 },
  { id: 62, name: 'Гипсы и модели', parentId: 6, productCount: 10 }
]

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      categories.value = JSON.parse(saved)
    } catch (e) {
      categories.value = [...defaultData]
    }
  } else {
    categories.value = [...defaultData]
    saveToStorage()
  }
  
  // Expand all parent categories by default
  categories.value.filter(c => c.parentId === null).forEach(c => {
    expanded.value[c.id] = true
  })
})

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories.value))
}

const toggleExpand = (id: number) => {
  expanded.value[id] = !expanded.value[id]
}

// Tree structure building for UI
interface CategoryNode extends Category {
  children?: CategoryNode[]
}

const filteredCategoriesTree = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  
  // Create a deep copy of categories to build tree
  const items: CategoryNode[] = JSON.parse(JSON.stringify(categories.value))
  
  // If searching, we might want to flat list or keep tree if parent/child matches
  // A simple approach: filter items that match or have children that match
  let matches = items
  if (q) {
    matches = items.filter(c => {
      const matchSelf = c.name.toLowerCase().includes(q)
      const hasMatchingChild = items.some(child => child.parentId === c.id && child.name.toLowerCase().includes(q))
      const hasMatchingParent = items.some(parent => c.parentId === parent.id && parent.name.toLowerCase().includes(q))
      return matchSelf || hasMatchingChild || hasMatchingParent
    })
  }

  // Build tree
  const roots: CategoryNode[] = []
  const itemMap = new Map<number, CategoryNode>()
  
  matches.forEach(item => {
    item.children = []
    itemMap.set(item.id, item)
  })

  matches.forEach(item => {
    if (item.parentId === null) {
      roots.push(item)
    } else {
      const parent = itemMap.get(item.parentId)
      if (parent) {
        parent.children!.push(item)
      } else if (q) {
        // If searching and parent isn't in matches, just show as root for now
        roots.push(item)
      }
    }
  })

  return roots
})

// Options for parent category dropdown
const parentOptions = computed(() => {
  const options = [{ label: 'Корневая категория', value: null }]
  // Only allow setting top-level categories as parent (1 level deep) to keep UI simple
  // Exclude current category if editing
  const parents = categories.value.filter(c => c.parentId === null && c.id !== form.value.id)
  parents.forEach(p => {
    options.push({ label: p.name, value: p.id as any })
  })
  return options
})

const hasChildren = (id?: number | null) => {
  if (!id) return false
  return categories.value.some(c => c.parentId === id)
}

const openModal = (category: Category | null = null) => {
  if (category) {
    isEditing.value = true
    form.value = {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      description: category.description || ''
    }
  } else {
    isEditing.value = false
    form.value = {
      id: null,
      name: '',
      parentId: null,
      description: ''
    }
  }
  isModalOpen.value = true
}

const saveCategory = () => {
  if (isEditing.value && form.value.id) {
    const index = categories.value.findIndex(c => c.id === form.value.id)
    if (index !== -1) {
      categories.value[index] = {
        ...categories.value[index],
        name: form.value.name,
        parentId: form.value.parentId,
        description: form.value.description
      }
      toast.add({ title: 'Успех', description: 'Категория обновлена', color: 'green' })
    }
  } else {
    const newId = Math.max(...categories.value.map(c => c.id), 0) + 1
    const newCategory: Category = {
      id: newId,
      name: form.value.name,
      parentId: form.value.parentId,
      description: form.value.description,
      productCount: 0
    }
    categories.value.push(newCategory)
    // auto expand parent if exists
    if (newCategory.parentId) {
      expanded.value[newCategory.parentId] = true
    }
    toast.add({ title: 'Успех', description: 'Категория создана', color: 'green' })
  }
  
  saveToStorage()
  isModalOpen.value = false
}

const confirmDelete = (category: Category) => {
  categoryToDelete.value = category
  isDeleteModalOpen.value = true
}

const executeDelete = () => {
  if (!categoryToDelete.value) return
  
  const idToDelete = categoryToDelete.value.id
  // Remove the category itself
  categories.value = categories.value.filter(c => c.id !== idToDelete)
  // Remove all children
  categories.value = categories.value.filter(c => c.parentId !== idToDelete)
  
  saveToStorage()
  toast.add({ title: 'Удалено', description: 'Категория успешно удалена', color: 'red' })
  isDeleteModalOpen.value = false
  categoryToDelete.value = null
}
</script>
