<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      content: 'sm:max-w-4xl w-full p-0 overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl'
    }"
  >
    <template #content>
      <div v-if="product" class="flex flex-col max-h-[90vh] bg-white rounded-3xl overflow-hidden relative">
        <!-- Top Modal Navigation Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-hidden">
            <span class="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 font-extrabold uppercase tracking-wider shrink-0">
              {{ product.brand || 'Стоматология' }}
            </span>
            <span class="text-slate-300">•</span>
            <span class="truncate text-slate-600 font-medium">
              {{ product.categoryName }}
            </span>
          </div>

          <button
            type="button"
            class="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all shrink-0 font-bold text-sm"
            @click="isOpen = false"
          >
            ✕
          </button>
        </div>

        <!-- Scrollable Modal Body -->
        <div class="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <!-- Left Column: Image & Stock Badge (5 cols) -->
            <div class="md:col-span-5 flex flex-col gap-4">
              <div class="relative bg-slate-50 rounded-2xl aspect-square overflow-hidden flex items-center justify-center p-6 border border-slate-200/70 shadow-xs group">
                <div v-if="product.stickers && product.stickers.length" class="absolute left-3 top-3 z-10 flex flex-wrap gap-1">
                  <span
                    v-for="sticker in product.stickers"
                    :key="sticker"
                    :class="[
                      'px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md text-white shadow-xs',
                      sticker === 'Хит' ? 'bg-orange-500' : 
                      sticker === 'Новинка' ? 'bg-emerald-500' : 
                      'bg-blue-600'
                    ]"
                  >
                    {{ sticker }}
                  </span>
                </div>
                <img
                  :src="product.image || '/images/nophoto.png'"
                  :alt="product.name"
                  class="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-500"
                  loading="lazy"
                >
              </div>

              <!-- Stock status -->
              <div class="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3">
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <div>
                  <p class="text-xs font-bold text-emerald-800">В наличии на складе</p>
                  <p class="text-[11px] text-emerald-600 font-medium">Готов к экспресс-отгрузке за 24 часа</p>
                </div>
              </div>
            </div>

            <!-- Right Column: Details & Specs (7 cols) -->
            <div class="md:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <!-- Title -->
                <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug mb-4">
                  {{ product.name }}
                </h2>

                <!-- Variants / Options -->
                <div class="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                    Модификация / Размер:
                  </span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="(variant, idx) in productVariants"
                      :key="idx"
                      type="button"
                      @click="selectedVariant = variant"
                      :class="[
                        'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer',
                        selectedVariant === variant
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      ]"
                    >
                      {{ variant }}
                    </button>
                  </div>
                </div>

                <!-- Tabs: Description & Specs -->
                <div>
                  <div class="flex border-b border-slate-200 gap-6 mb-3">
                    <button
                      type="button"
                      @click="activeTab = 'desc'"
                      :class="[
                        'pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px cursor-pointer',
                        activeTab === 'desc'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-400 hover:text-slate-700'
                      ]"
                    >
                      Описание товара
                    </button>
                    <button
                      type="button"
                      @click="activeTab = 'specs'"
                      :class="[
                        'pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px cursor-pointer',
                        activeTab === 'specs'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-400 hover:text-slate-700'
                      ]"
                    >
                      Характеристики
                    </button>
                  </div>

                  <!-- Tab Content: Description -->
                  <div v-if="activeTab === 'desc'" class="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2 max-h-40 overflow-y-auto pr-2">
                    <p v-for="(paragraph, i) in formattedDescription" :key="i">
                      {{ paragraph }}
                    </p>
                  </div>

                  <!-- Tab Content: Specs -->
                  <div v-else class="text-xs space-y-2 text-slate-600 max-h-40 overflow-y-auto pr-2">
                    <div class="flex justify-between py-1.5 border-b border-slate-100">
                      <span class="text-slate-400">Производитель:</span>
                      <span class="font-bold text-slate-800">{{ product.brand || 'Стоматология / Импорт' }}</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-slate-100">
                      <span class="text-slate-400">Назначение:</span>
                      <span class="font-bold text-slate-800">Стоматологические клиники</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-slate-100">
                      <span class="text-slate-400">Стандарт качества:</span>
                      <span class="font-bold text-slate-800">ISO / CE Сертифицировано</span>
                    </div>
                    <div class="flex justify-between py-1.5">
                      <span class="text-slate-400">Страна поставки:</span>
                      <span class="font-bold text-slate-800">Казахстан / Официальный импорт</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Bottom Price & Cart Action Panel -->
        <div class="p-4 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Оптовая цена клиники</span>
            <div class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              <template v-if="product.price !== null">
                {{ formatPrice(product.price) }} <span class="text-sm font-semibold text-slate-400">{{ currencySymbol(product.currencyCode) }}</span>
              </template>
              <template v-else>
                <span class="text-sm text-orange-400">{{ t('price.onRequest') }}</span>
              </template>
            </div>
          </div>

          <!-- Cart Controls -->
          <div>
            <div v-if="quantity > 0" class="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
              <button
                v-if="quantity > 1"
                type="button"
                class="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-white flex items-center justify-center transition-all text-base cursor-pointer"
                @click="cart.applyQuantityDelta(product.id, -1)"
              >
                -
              </button>
              <button
                v-else
                type="button"
                class="w-9 h-9 rounded-lg bg-red-900/40 hover:bg-red-900/60 font-bold text-red-400 flex items-center justify-center transition-all cursor-pointer"
                @click="cart.removeItem(product.id)"
              >
                <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
              </button>
              <span class="w-8 text-center font-bold text-base">{{ quantity }}</span>
              <button
                type="button"
                class="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-white flex items-center justify-center transition-all text-base cursor-pointer"
                @click="cart.applyQuantityDelta(product.id, 1)"
              >
                +
              </button>
            </div>
            <button
              v-else
              type="button"
              class="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center gap-2.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              @click="cart.addProduct(product)"
            >
              <UIcon name="i-lucide-shopping-cart" class="w-4 h-4" />
              <span>Добавить в корзину</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ProductViewModel } from '@fsd/entities/product/model/types'
import { currencySymbol } from '@fsd/shared/lib/currencySymbol'
import { useCartStore } from '~/stores/cart'
import { useFormattedPrice } from '~/composables/useFormattedPrice'

const props = defineProps<{
  modelValue: boolean
  product: ProductViewModel | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const { t } = useI18n()
const cart = useCartStore()
const formatPrice = useFormattedPrice()

const activeTab = ref<'desc' | 'specs'>('desc')

const productVariants = computed(() => [
  'Стандартный',
  'Упаковка (10 шт)',
  'Набор (Набор 6 шт)',
  'Размер #25 / 25мм'
])
const selectedVariant = ref('Стандартный')

const formattedDescription = computed(() => {
  if (!props.product?.description) {
    return ['Детальное описание данного товара пока отсутствует, но мы постоянно обновляем данные.']
  }
  return props.product.description.split('\n').filter(Boolean)
})

const cartItem = computed(() => {
  if (!props.product) return undefined
  return cart.items.find(i => i.id === props.product!.id)
})
const quantity = computed(() => cartItem.value?.quantity ?? 0)
</script>
