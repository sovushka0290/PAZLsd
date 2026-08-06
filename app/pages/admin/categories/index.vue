<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8">
    <div class="mx-auto max-w-5xl space-y-6">
      
      <!-- Header Area -->
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Дерево категорий каталога
          </h1>
          <p class="text-sm text-slate-500 mt-1 font-medium">
            Управление иерархией разделов, подкатегорий и 140+ стоматологическими иконками
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
      <div class="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col gap-4 md:flex-row md:items-center">
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
      <div class="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
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
                <div v-else class="w-8"></div>
                
                <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
                  {{ cat.icon || '🦷' }}
                </div>

                <div class="flex flex-col">
                  <span class="font-extrabold text-slate-900 text-base">
                    {{ cat.name }}
                  </span>
                  <span v-if="cat.description" class="text-xs text-slate-500 line-clamp-1">
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
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-base shrink-0">
                    {{ sub.icon || '📦' }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-800 text-sm">
                      {{ sub.name }}
                    </span>
                    <span v-if="sub.description" class="text-xs text-slate-500 line-clamp-1">
                      {{ sub.description }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <UBadge color="gray" variant="soft" class="font-bold rounded-lg px-2 text-xs">
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

    <!-- Create/Edit Modal with 140+ Icon Picker -->
    <UModal v-model="isModalOpen" :ui="{ width: 'w-full sm:max-w-xl' }">
      <div class="p-6 bg-white rounded-3xl space-y-5 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-black text-slate-900">
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

        <form @submit.prevent="saveCategory" class="space-y-4 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Название категории <span class="text-red-500">*</span></label>
            <input 
              v-model="form.name" 
              placeholder="Например: Композиты и Пломбирование" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              required
            />
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Родительская категория (если подкатегория)</label>
            <select v-model="form.parentId" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
              <option :value="null">-- Корневая категория (верхний уровень) --</option>
              <option v-for="c in rootCategories" :key="c.id" :value="c.id">
                {{ c.icon || '🦷' }} {{ c.name }}
              </option>
            </select>
          </div>

          <!-- Icon Picker Section -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="font-bold text-slate-700">Иконка категории:</label>
              <span class="text-2xl p-1 bg-blue-50 rounded-lg border border-blue-200">{{ form.icon }}</span>
            </div>

            <div class="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2.5">
              <!-- Group Tabs -->
              <div class="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                <button
                  v-for="(grp, gIdx) in iconGroups"
                  :key="gIdx"
                  type="button"
                  @click="activeIconGroupIdx = gIdx"
                  :class="[
                    'px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer',
                    activeIconGroupIdx === gIdx ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  ]"
                >
                  {{ grp.name }}
                </button>
              </div>

              <!-- Icons Grid -->
              <div class="grid grid-cols-8 gap-2 p-2 bg-white rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                <button
                  v-for="(ic, idx) in iconGroups[activeIconGroupIdx]?.icons || []"
                  :key="idx"
                  type="button"
                  @click="form.icon = ic"
                  :class="[
                    'w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer',
                    form.icon === ic ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : 'hover:bg-slate-100'
                  ]"
                >
                  {{ ic }}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Описание (необязательно)</label>
            <textarea 
              v-model="form.description" 
              rows="2"
              placeholder="Краткое описание категории"
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-3">
            <button 
              type="button"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer" 
              @click="isModalOpen = false"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
              :disabled="!form.name"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <div class="p-6 bg-white rounded-3xl space-y-4 text-center">
        <div class="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-red-600" />
        </div>
        
        <div>
          <h3 class="text-base font-extrabold text-slate-900 mb-1">Удалить категорию?</h3>
          <p class="text-xs text-slate-500 font-medium">
            Вы уверены, что хотите удалить «{{ categoryToDelete?.name }}»?
          </p>
        </div>

        <div class="flex gap-3 pt-2">
          <button 
            type="button"
            class="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer" 
            @click="isDeleteModalOpen = false"
          >
            Отмена
          </button>
          <button 
            type="button"
            class="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
            @click="executeDelete"
          >
            Удалить
          </button>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CATEGORY_ICON_GROUPS } from '~/utils/categoryIcons'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const toast = useToast()

interface Category {
  id: number
  name: string
  parentId: number | null
  icon?: string
  description?: string
  productCount?: number
  children?: Category[]
}

const categories = ref<Category[]>([])
const searchQuery = ref('')
const expanded = ref<Record<number, boolean>>({})

const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isEditing = ref(false)
const categoryToDelete = ref<Category | null>(null)

const form = ref({
  id: null as number | null,
  name: '',
  parentId: null as number | null,
  icon: '🦷',
  description: ''
})

const iconGroups = CATEGORY_ICON_GROUPS
const activeIconGroupIdx = ref(0)

async function fetchCategories() {
  try {
    const res = await $fetch<{ results: any[] }>('/api/catalog/categories')
    if (res && Array.isArray(res.results)) {
      categories.value = res.results.map(c => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId || null,
        icon: c.icon || '🦷',
        description: c.description || '',
        productCount: c.productCount || 0
      }))
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

onMounted(() => {
  fetchCategories()
})

const rootCategories = computed(() => {
  return categories.value.filter(c => !c.parentId)
})

const filteredCategoriesTree = computed(() => {
  let list = categories.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q))
  }

  // Build tree
  const rootMap = new Map<number, Category>()
  const roots: Category[] = []

  list.forEach(c => {
    if (!c.parentId) {
      const copy = { ...c, children: [] }
      rootMap.set(c.id, copy)
      roots.push(copy)
    }
  })

  list.forEach(c => {
    if (c.parentId && rootMap.has(c.parentId)) {
      rootMap.get(c.parentId)!.children!.push({ ...c })
    } else if (c.parentId && !rootMap.has(c.parentId)) {
      roots.push({ ...c, children: [] })
    }
  })

  return roots
})

function toggleExpand(id: number) {
  expanded.value[id] = !expanded.value[id]
}

function openModal(cat: Category | null) {
  if (cat) {
    isEditing.value = true
    form.value = {
      id: cat.id,
      name: cat.name,
      parentId: cat.parentId,
      icon: cat.icon || '🦷',
      description: cat.description || ''
    }
  } else {
    isEditing.value = false
    form.value = {
      id: null,
      name: '',
      parentId: null,
      icon: '🦷',
      description: ''
    }
  }
  isModalOpen.value = true
}

async function saveCategory() {
  try {
    if (isEditing.value && form.value.id) {
      await $fetch(`/api/catalog/categories/${form.value.id}`, {
        method: 'PUT',
        body: form.value
      })
      toast.add({ title: 'Категория обновлена', color: 'green' })
    } else {
      await $fetch('/api/catalog/categories', {
        method: 'POST',
        body: form.value
      })
      toast.add({ title: 'Категория создана', color: 'green' })
    }
    isModalOpen.value = false
    await fetchCategories()
  } catch (err: any) {
    alert(err.message || 'Ошибка сохранения')
  }
}

function confirmDelete(cat: Category) {
  categoryToDelete.value = cat
  isDeleteModalOpen.value = true
}

async function executeDelete() {
  if (!categoryToDelete.value) return
  try {
    await $fetch(`/api/catalog/categories/${categoryToDelete.value.id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Категория удалена', color: 'gray' })
    isDeleteModalOpen.value = false
    categoryToDelete.value = null
    await fetchCategories()
  } catch (err: any) {
    alert(err.message || 'Ошибка удаления')
  }
}
</script>
