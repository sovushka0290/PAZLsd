<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
    <div class="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
            📥
          </div>
          <div>
            <h2 class="text-xl font-black leading-tight">Импорт и модерация товаров</h2>
            <p class="text-xs text-blue-100 mt-0.5">Загрузите прайс-лист в Excel/CSV или заполните таблицу</p>
          </div>
        </div>

        <button
          type="button"
          @click="closeModal"
          class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer text-lg font-bold"
        >
          ✕
        </button>
      </div>

      <!-- Stepper / Tabs -->
      <div class="flex border-b border-slate-200 bg-slate-50 px-6 py-2 shrink-0 gap-2 overflow-x-auto">
        <button
          type="button"
          @click="currentStep = 1"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
            currentStep === 1 ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
          Загрузка и шаблон
        </button>

        <button
          type="button"
          @click="currentStep = 2"
          :disabled="parsedProducts.length === 0"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            parsedProducts.length === 0 ? 'opacity-50 cursor-not-allowed text-slate-400' : (currentStep === 2 ? 'bg-white text-blue-600 shadow-xs border border-slate-200 cursor-pointer' : 'text-slate-500 hover:text-slate-800 cursor-pointer')
          ]"
        >
          <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
          Предпросмотр карточек ({{ parsedProducts.length }})
        </button>
      </div>

      <!-- Body Content -->
      <div class="p-6 overflow-y-auto space-y-6 grow">
        
        <!-- STEP 1: UPLOAD & TEMPLATE & TABLE -->
        <div v-if="currentStep === 1" class="space-y-6">
          
          <!-- Notice: Required Columns -->
          <div class="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p class="text-xs font-black text-blue-900 uppercase tracking-wider mb-1">
                📌 Обязательные поля прайс-листа:
              </p>
              <div class="flex flex-wrap gap-2 text-xs font-semibold text-blue-800">
                <span class="bg-blue-100/80 px-2 py-0.5 rounded-md">✓ Название</span>
                <span class="bg-blue-100/80 px-2 py-0.5 rounded-md">✓ Цена (₸)</span>
                <span class="bg-blue-100/80 px-2 py-0.5 rounded-md">✓ Категория</span>
                <span class="bg-blue-100/80 px-2 py-0.5 rounded-md">✓ Описание</span>
                <span class="bg-blue-100/80 px-2 py-0.5 rounded-md">✓ Картинка / URL</span>
                <span class="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">Артикул / SKU</span>
              </div>
            </div>

            <button
              type="button"
              @click="downloadTemplate"
              class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>📥</span> Скачать образец Excel (.csv)
            </button>
          </div>

          <!-- Dropzone -->
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            :class="[
              'border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3',
              isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
            ]"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              class="hidden"
              @change="handleFileSelect"
            />
            <div class="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-3xl">
              📂
            </div>
            <div>
              <p class="text-base font-extrabold text-slate-800">
                Перетащите сюда Excel (.xlsx, .csv) файл или нажмите для выбора
              </p>
              <p class="text-xs text-slate-500 mt-1">
                Поддерживаются форматы: .xlsx, .xls, .csv, .json до 25 МБ
              </p>
            </div>
            <button
              type="button"
              class="px-5 py-2.5 bg-white border border-slate-300 hover:border-blue-400 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Выбрать файл на компьютере
            </button>
          </div>

          <!-- Quick Fill Demo Button -->
          <div class="flex items-center justify-between pt-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Или загрузите демонстрационную партию:</span>
            <button
              type="button"
              @click="loadDemoProducts"
              class="text-xs font-extrabold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              ⚡ Загрузить 5 готовых стоматологических товаров
            </button>
          </div>

          <!-- Interactive Table Editor -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-extrabold text-slate-800">
                ✍️ Ручное добавление и редактирование таблицы
              </h3>
              <button
                type="button"
                @click="addRow"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                + Добавить строку
              </button>
            </div>

            <div class="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th class="p-2.5 w-10 text-center">#</th>
                    <th class="p-2.5 min-w-[180px]">Название товара *</th>
                    <th class="p-2.5 min-w-[100px]">Цена (₸) *</th>
                    <th class="p-2.5 min-w-[130px]">Категория *</th>
                    <th class="p-2.5 min-w-[200px]">Описание *</th>
                    <th class="p-2.5 min-w-[160px]">Картинка / URL *</th>
                    <th class="p-2.5 min-w-[100px]">Артикул (SKU)</th>
                    <th class="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(p, idx) in parsedProducts" :key="idx" class="hover:bg-slate-50/80">
                    <td class="p-2 text-center text-slate-400 font-mono">{{ idx + 1 }}</td>
                    <td class="p-2">
                      <input v-model="p.name" type="text" placeholder="Название" class="w-full p-1.5 border border-slate-200 rounded-lg text-xs" />
                    </td>
                    <td class="p-2">
                      <input v-model.number="p.price" type="number" placeholder="0" class="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-bold text-blue-600" />
                    </td>
                    <td class="p-2">
                      <input v-model="p.category" type="text" placeholder="Категория" class="w-full p-1.5 border border-slate-200 rounded-lg text-xs" />
                    </td>
                    <td class="p-2">
                      <input v-model="p.description" type="text" placeholder="Описание" class="w-full p-1.5 border border-slate-200 rounded-lg text-xs" />
                    </td>
                    <td class="p-2">
                      <input v-model="p.image" type="text" placeholder="https://..." class="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-mono" />
                    </td>
                    <td class="p-2">
                      <input v-model="p.sku" type="text" placeholder="SKU" class="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-mono" />
                    </td>
                    <td class="p-2 text-center">
                      <button type="button" @click="removeRow(idx)" class="text-red-500 hover:text-red-700 font-bold text-base cursor-pointer">
                        ✕
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- STEP 2: PRODUCT CARDS PREVIEW -->
        <div v-else-if="currentStep === 2" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">
                Карточки товаров перед отправкой на модерацию
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Проверьте отображение фото, названий, цен и категорий. Нажмите на любую карточку для правки.
              </p>
            </div>
            <span class="text-xs font-extrabold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Позиций к отправке: {{ parsedProducts.length }}
            </span>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="(prod, idx) in parsedProducts"
              :key="idx"
              class="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 shadow-xs flex flex-col justify-between relative group transition-all"
            >
              <!-- Thumbnail -->
              <div class="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 relative border border-slate-100">
                <img
                  :src="prod.image || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'"
                  :alt="prod.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  @error="(e: any) => e.target.src = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'"
                />
                <span class="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {{ prod.category || 'Без категории' }}
                </span>
                <button
                  type="button"
                  @click="removeRow(idx)"
                  class="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <!-- Info -->
              <div class="space-y-1 grow">
                <div class="text-xs font-mono text-slate-400 font-bold">SKU: {{ prod.sku || `SKU-${idx + 1}` }}</div>
                <h4 class="text-sm font-black text-slate-900 line-clamp-2 leading-snug">{{ prod.name }}</h4>
                <p class="text-xs text-slate-500 line-clamp-2">{{ prod.description }}</p>
              </div>

              <!-- Price & Edit -->
              <div class="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Цена</span>
                  <span class="text-base font-black text-blue-600 leading-none">{{ formatPrice(prod.price) }} ₸</span>
                </div>

                <button
                  type="button"
                  @click="openCardEdit(idx)"
                  class="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  ✏️ Изменить
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <div>
          <button
            v-if="currentStep === 2"
            type="button"
            @click="currentStep = 1"
            class="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            ← Назад к таблице
          </button>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            Отмена
          </button>

          <button
            v-if="currentStep === 1"
            type="button"
            :disabled="parsedProducts.length === 0"
            @click="currentStep = 2"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            Проверить карточки ({{ parsedProducts.length }}) →
          </button>

          <button
            v-else-if="currentStep === 2"
            type="button"
            :disabled="isSubmitting || parsedProducts.length === 0"
            @click="submitForModeration"
            class="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-green-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <span v-if="isSubmitting">Отправка...</span>
            <span v-else>🚀 Отправить на рассмотрение модератору</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Edit Single Card Sub-Modal -->
    <div v-if="editingIndex !== null" class="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
        <h3 class="text-base font-black text-slate-900">Редактирование карточки товара</h3>
        
        <div class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Название товара</label>
            <input v-model="parsedProducts[editingIndex].name" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Цена (₸)</label>
              <input v-model.number="parsedProducts[editingIndex].price" type="number" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600" />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Категория</label>
              <input v-model="parsedProducts[editingIndex].category" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">URL изображения / Картинка</label>
            <input v-model="parsedProducts[editingIndex].image" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]" />
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Описание товара</label>
            <textarea v-model="parsedProducts[editingIndex].description" rows="3" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
          </div>
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <button
            type="button"
            @click="editingIndex = null"
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success', batch: any): void
}>()

const authStore = useAuthStore()
const currentStep = ref(1)
const isDragging = ref(false)
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const editingIndex = ref<number | null>(null)

interface UploadProduct {
  name: string
  price: number
  category: string
  description: string
  image: string
  sku?: string
}

const parsedProducts = ref<UploadProduct[]>([
  {
    name: 'Megafill Flow Megadenta Dentalprodukte (шприц 2г)',
    price: 4750,
    category: 'Терапия',
    description: 'Текучий светоотверждаемый реставрационный микрогибридный композит.',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80',
    sku: 'MEGA-FLOW-2G'
  },
  {
    name: 'TG6 машинные файлы для обработки каналов (6 шт)',
    price: 5625,
    category: 'Эндодонтия',
    description: 'Никель-титановые ротационные файлы с повышенной гибкостью и памятью формы.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80',
    sku: 'TG6-FILE-SET'
  }
])

function closeModal() {
  emit('close')
}

function triggerFileInput() {
  fileInput.value?.click()
}

function addRow() {
  parsedProducts.value.push({
    name: '',
    price: 0,
    category: 'Терапия',
    description: '',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
    sku: `SKU-${Date.now().toString().slice(-4)}`
  })
}

function removeRow(index: number) {
  parsedProducts.value.splice(index, 1)
}

function openCardEdit(index: number) {
  editingIndex.value = index
}

function formatPrice(val: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return isNaN(num) ? '0' : num.toLocaleString('ru-RU')
}

function loadDemoProducts() {
  parsedProducts.value = [
    {
      name: 'Фотополимерная лампа Woodpecker LED.F',
      price: 85000,
      category: 'Оборудование',
      description: 'Беспроводная светодиодная полимеризационная лампа высокой мощности со встроенным радиометром.',
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
      sku: 'WD-LED-F'
    },
    {
      name: 'Набор композитов Gradia Direct (6 шприцев)',
      price: 64500,
      category: 'Терапия',
      description: 'Светоотверждаемый реставрационный микрогибридный композит для всех классов полостей.',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80',
      sku: 'GC-GRADIA-6'
    },
    {
      name: 'Турбинный наконечник с подсветкой Pana-Max Plus',
      price: 49000,
      category: 'Инструменты',
      description: 'Ортопедический турбинный наконечник с четырехточечным спреем и керамическими подшипниками.',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80',
      sku: 'NSK-PANA-P'
    },
    {
      name: 'Автоклав стоматологический класс B (18L)',
      price: 650000,
      category: 'Стерилизация',
      description: 'Вакуумный автоклав с фракционированным предвакуумом и вакуумной сушкой.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
      sku: 'AUTO-18L-B'
    },
    {
      name: 'Альгинатная слепочная масса Hydrogum 5 (453г)',
      price: 6200,
      category: 'Расходные материалы',
      description: 'Высокоточный беспыльный альгинат с быстрой схватываемостью и стабильностью 5 дней.',
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
      sku: 'ZHM-HYDRO-5'
    }
  ]
  currentStep.value = 2
}

function downloadTemplate() {
  const header = 'Название;Цена;Категория;Описание;Картинка;Артикул\n'
  const sample1 = 'Тестовый композит А2;12500;Терапия;Качественный композит для реставраций;https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400;SKU-101\n'
  const sample2 = 'Эндодонтические иглы 30G;3200;Эндодонтия;Иглы с боковым срезом для промывания каналов;https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400;SKU-102\n'
  const blob = new Blob(['\uFEFF' + header + sample1 + sample2], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Шаблон_товаров_PAZL.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    parseUploadedFile(files[0])
  }
}

function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    parseUploadedFile(files[0])
  }
}

function parseUploadedFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    if (!text) return

    try {
      // If JSON
      if (file.name.endsWith('.json')) {
        const json = JSON.parse(text)
        if (Array.isArray(json)) {
          parsedProducts.value = json.map(j => ({
            name: j.name || j.title || 'Товар',
            price: Number(j.price) || 0,
            category: j.category || 'Общее',
            description: j.description || '',
            image: j.image || j.photo || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
            sku: j.sku || j.code || ''
          }))
          currentStep.value = 2
          return
        }
      }

      // If CSV / Delimited text
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0)
      if (lines.length > 1) {
        const delimiter = lines[0].includes(';') ? ';' : ','
        const rows: UploadProduct[] = []

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''))
          if (cols.length >= 2 && cols[0]) {
            rows.push({
              name: cols[0],
              price: Number(cols[1].replace(/[^0-9.]/g, '')) || 0,
              category: cols[2] || 'Терапия',
              description: cols[3] || '',
              image: cols[4] || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
              sku: cols[5] || `SKU-${i}`
            })
          }
        }

        if (rows.length > 0) {
          parsedProducts.value = rows
          currentStep.value = 2
        }
      }
    } catch (err) {
      console.error('File parsing error:', err)
      alert('Ошибка при чтении файла. Убедитесь в корректности формата CSV/JSON.')
    }
  }
  reader.readAsText(file)
}

async function submitForModeration() {
  if (parsedProducts.value.length === 0) return

  isSubmitting.value = true

  try {
    const res = await $fetch<{ success: boolean; message: string; batch: any }>('/api/supplier/upload-products', {
      method: 'POST',
      body: {
        supplierId: authStore.user?.id || 'SUPP-DEMO',
        supplierName: authStore.user?.company_name || authStore.user?.first_name || 'ТОО «Альянс-Дент»',
        supplierPhone: authStore.user?.phone || '+7 (705) 111-22-33',
        products: parsedProducts.value
      }
    })

    if (res.success) {
      emit('success', res.batch)
      closeModal()
    }
  } catch (err: any) {
    alert(err.message || 'Ошибка отправки на модерацию')
  } finally {
    isSubmitting.value = false
  }
}
</script>
