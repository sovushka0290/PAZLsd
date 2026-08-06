<template>
  <div class="pb-20">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton
          :to="localePath('/admin/products')"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          class="rounded-xl"
        />
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ isNew ? 'Новый товар' : 'Редактирование товара' }}</h1>
          <p class="text-slate-500 mt-1" v-if="!isNew">ID: {{ route.params.id }}</p>
        </div>
      </div>
      <div class="flex gap-3">
        <UButton
          v-if="!isNew && authStore.isAdmin"
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          class="rounded-xl shadow-sm font-medium"
        >
          Удалить
        </UButton>
        <UButton
          color="primary"
          icon="i-lucide-save"
          class="rounded-xl shadow-md font-medium"
          @click="saveProduct"
          :loading="isSaving"
        >
          Сохранить
        </UButton>
      </div>
    </div>

    <div v-if="pending && !isNew" class="p-12 text-center text-slate-500">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
      <p>Загрузка данных...</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Main Info -->
        <UCard :ui="({ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100' } as any)">
          <template #header>
            <h2 class="text-lg font-bold text-slate-900">Основная информация</h2>
          </template>
          
          <div class="space-y-5">
            <UFormField label="Название товара" name="name" required>
              <UInput
                v-model="form.name"
                placeholder="Введите название"
                size="lg"
                class="w-full"
                :ui="({ rounded: 'rounded-xl' } as any)"
              />
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <UFormField label="Категория" name="category">
                <USelect
                  v-model="form.category"
                  :options="['Стоматология', 'Расходные материалы', 'Оборудование', 'Инструменты']"
                  size="lg"
                  class="w-full"
                  :ui="({ rounded: 'rounded-xl' } as any)"
                />
              </UFormField>

              <UFormField label="Бренд" name="brand">
                <UInput
                  v-model="form.brand"
                  placeholder="Название бренда"
                  size="lg"
                  class="w-full"
                  :ui="({ rounded: 'rounded-xl' } as any)"
                />
              </UFormField>
            </div>

            <UFormField label="Описание" name="description">
              <UTextarea
                v-model="form.description"
                placeholder="Подробное описание товара"
                :rows="6"
                class="w-full"
                :ui="({ rounded: 'rounded-xl' } as any)"
              />
            </UFormField>
          </div>
        </UCard>

        <!-- Pricing & Modifications -->
        <UCard :ui="({ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100' } as any)">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-slate-900">Цена и модификации</h2>
              <UButton color="primary" variant="soft" size="sm" icon="i-lucide-plus" @click="addModification" class="rounded-lg">
                Добавить модификацию
              </UButton>
            </div>
          </template>
          
          <div v-if="form.modifications.length === 0" class="space-y-5">
            <UFormField label="Базовая цена (₸)" name="price">
              <UInput
                v-model.number="form.price"
                type="number"
                placeholder="0"
                size="lg"
                class="w-full md:w-1/2"
                :ui="({ rounded: 'rounded-xl' } as any)"
              />
            </UFormField>
          </div>

          <div v-else class="space-y-4">
            <div v-for="(mod, index) in form.modifications" :key="index" class="flex gap-4 items-start p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Название модификации" :name="`mod-name-${index}`">
                  <UInput v-model="mod.name" placeholder="Например: Цвет белый" :ui="({ rounded: 'rounded-lg' } as any)" />
                </UFormField>
                <UFormField label="Цена (₸)" :name="`mod-price-${index}`">
                  <UInput v-model.number="mod.price" type="number" placeholder="0" :ui="({ rounded: 'rounded-lg' } as any)" />
                </UFormField>
              </div>
              <UButton color="error" variant="ghost" icon="i-lucide-x" class="mt-7" @click="removeModification(index)" />
            </div>
          </div>
        </UCard>

        <!-- Images -->
        <UCard :ui="({ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100' } as any)">
          <template #header>
            <h2 class="text-lg font-bold text-slate-900">Фотографии</h2>
          </template>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            <div v-for="(img, idx) in form.images" :key="idx" class="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
              <img :src="img" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <UButton color="error" variant="soft" icon="i-lucide-trash-2" size="sm" class="rounded-full" @click="removeImage(idx)" />
              </div>
            </div>
            
            <div class="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-500">
              <UIcon name="i-lucide-image-plus" class="w-8 h-8 mb-2" />
              <span class="text-sm font-medium">Загрузить</span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Preview Column -->
      <div class="space-y-6">
        <UCard :ui="({ rounded: 'rounded-2xl', shadow: 'shadow-sm', border: 'border border-slate-100' } as any)">
          <template #header>
            <h2 class="text-lg font-bold text-slate-900">Предпросмотр</h2>
          </template>
          
          <div class="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
            <div class="aspect-square bg-slate-100 flex items-center justify-center">
              <img v-if="form.images.length > 0" :src="form.images[0]" class="w-full h-full object-cover" />
              <UIcon v-else name="i-lucide-image" class="w-12 h-12 text-slate-300" />
            </div>
            <div class="p-4 space-y-2">
              <div class="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {{ form.category || 'Без категории' }}
              </div>
              <div class="font-bold text-slate-900 line-clamp-2">
                {{ form.name || 'Название товара' }}
              </div>
              <div class="text-xs text-slate-500">
                {{ form.brand || 'Бренд не указан' }}
              </div>
              <div class="text-lg font-black text-slate-900 pt-2">
                {{ (form.price || 0).toLocaleString('ru-RU') }} ₸
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const authStore = useAuthStore()
const toast = useToast()

const isNew = route.params.id === 'new'
const isSaving = ref(false)
const pending = ref(!isNew)

interface Modification {
  name: string
  price: number | null
}

const form = reactive({
  name: '',
  category: 'Стоматология',
  brand: '',
  description: '',
  price: 0,
  modifications: [] as Modification[],
  images: [] as string[]
})

onMounted(async () => {
  if (!isNew) {
    // Simulate fetch existing product
    setTimeout(() => {
      form.name = 'Стоматологический наконечник ' + route.params.id
      form.category = 'Оборудование'
      form.brand = 'NSK'
      form.description = 'Высококачественный турбинный наконечник с подсветкой.'
      form.price = 85000
      form.images = [
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'
      ]
      pending.value = false
    }, 400)
  }
})

function addModification() {
  form.modifications.push({ name: '', price: null })
}

function removeModification(index: number) {
  form.modifications.splice(index, 1)
}

function removeImage(index: number) {
  form.images.splice(index, 1)
}

async function saveProduct() {
  if (!form.name) {
    toast.add({
      title: 'Ошибка',
      description: 'Введите название товара',
      color: 'error'
    })
    return
  }

  isSaving.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800))
  
  isSaving.value = false
  
  toast.add({
    title: 'Успешно',
    description: 'Данные товара сохранены',
    color: 'success'
  })
  
  if (isNew) {
    router.push(localePath('/admin/products'))
  }
}

useSeoMeta({
  title: isNew ? 'Новый товар | PAZL Admin' : 'Редактирование товара | PAZL Admin'
})
</script>
