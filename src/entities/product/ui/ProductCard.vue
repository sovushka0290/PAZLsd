<template>
  <div
    class="product-card group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-white border border-slate-200/90 rounded-xl p-3 cursor-pointer"
    @click="emit('open-details', product)"
  >
    <!-- 1. Название товара -->
    <h3
      class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-1.5 min-h-[2.25rem]"
      :title="product.name"
    >
      {{ product.name }}
    </h3>

    <!-- 2. Производитель -->
    <div class="flex items-center gap-1 mb-1 text-[11px]">
      <span class="text-slate-400 shrink-0">Производ:</span>
      <span class="font-bold text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded text-[10px] truncate" :title="product.manufacturer || 'Не указан'">
        {{ product.manufacturer || 'Не указан' }}
      </span>
    </div>

    <!-- 3. Артикул (Арт) -->
    <div class="flex items-center gap-1 mb-2.5 text-[11px] text-slate-500">
      <span class="text-slate-400 shrink-0">Арт:</span>
      <span class="font-semibold text-slate-700 truncate">{{ product.sku || product.id }}</span>
      <span v-if="product.unit" class="ml-auto text-[10px] text-slate-400">({{ product.unit }})</span>
    </div>

    <!-- Divider -->
    <div class="border-t border-slate-100 pt-2 mt-auto flex flex-col gap-2">
      <!-- 4. Управление количеством (+ / -) -->
      <div class="flex items-center justify-between gap-1" @click.stop>
        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Кол-во:</span>
        <div class="flex items-center gap-1 bg-slate-100/80 rounded-lg p-0.5 border border-slate-200/60">
          <button
            type="button"
            class="h-6 w-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all text-xs border border-slate-200/50 shadow-2xs cursor-pointer"
            :disabled="quantity <= 0"
            :class="{ 'opacity-40 cursor-not-allowed': quantity <= 0 }"
            @click="quantity > 1 ? cart.applyQuantityDelta(product.id, -1) : cart.removeItem(product.id)"
          >
            -
          </button>
          <span class="w-6 text-center text-xs font-extrabold text-slate-900">{{ quantity }}</span>
          <button
            type="button"
            class="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center transition-all text-xs shadow-2xs cursor-pointer"
            @click="cart.addProduct(product)"
          >
            +
          </button>
        </div>
      </div>

      <!-- 5. Цена за единицу & 6. Итоговая сумма -->
      <div class="flex items-end justify-between gap-1 pt-1 border-t border-dashed border-slate-100">
        <div class="flex flex-col">
          <span class="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Цена</span>
          <span class="text-xs font-bold text-slate-700">
            <template v-if="product.price !== null">
              {{ formatPrice(product.price) }} <span class="text-[10px] text-slate-400">{{ currencySymbol(product.currencyCode) }}</span>
            </template>
            <template v-else>
              <span class="text-[10px] text-orange-600">По запросу</span>
            </template>
          </span>
        </div>

        <div class="flex flex-col items-end text-right">
          <span class="text-[9px] uppercase tracking-wider font-bold text-blue-600">Сумма</span>
          <span class="text-sm font-extrabold text-slate-900 leading-tight">
            <template v-if="product.price !== null">
              {{ formatPrice(totalSum) }} <span class="text-xs font-semibold text-slate-500">{{ currencySymbol(product.currencyCode) }}</span>
            </template>
            <template v-else>
              <span class="text-xs text-orange-600">—</span>
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductViewModel } from '@fsd/entities/product/model/types'
import { currencySymbol } from '@fsd/shared/lib/currencySymbol'
import { useCartStore } from '~/stores/cart'
import { useFormattedPrice } from '~/composables/useFormattedPrice'

const props = defineProps<{
  product: ProductViewModel
}>()

const emit = defineEmits<{
  (e: 'open-details', product: ProductViewModel): void
}>()

const { t } = useI18n()
const cart = useCartStore()
const formatPrice = useFormattedPrice()

const categoryLabel = computed(() => props.product.categoryName)
const cartItem = computed(() => cart.items.find(i => i.id === props.product.id))
const quantity = computed(() => cartItem.value?.quantity ?? 0)

const totalSum = computed(() => {
  if (props.product.price === null) return 0
  const qty = quantity.value > 0 ? quantity.value : 1
  return props.product.price * qty
})
</script>

<style scoped lang="scss">
.product-card {
  min-height: auto;
}
</style>
