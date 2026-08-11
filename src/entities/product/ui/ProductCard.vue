<template>
  <div
    class="product-row group relative flex flex-col md:grid md:grid-cols-[3fr_1.5fr_1.5fr_120px_1fr_1fr] gap-2 md:gap-4 items-center p-3 md:p-4 hover:bg-blue-50/50 transition-colors cursor-pointer"
    @click="emit('open-details', product)"
  >
    <!-- 1. Название товара -->
    <div class="w-full min-w-0">
      <h3 class="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight" :title="product.name">
        {{ product.name }}
      </h3>
    </div>

    <!-- 2. Производитель -->
    <div class="w-full md:w-auto text-xs text-slate-600 truncate" :title="product.manufacturer || 'Не указан'">
      <span class="md:hidden font-semibold text-slate-400 mr-1">Производ:</span>
      <span class="md:bg-blue-50/80 md:px-1.5 md:py-0.5 md:rounded md:font-semibold md:text-blue-700">{{ product.manufacturer || 'Не указан' }}</span>
    </div>

    <!-- 3. Артикул (Арт) -->
    <div class="w-full md:w-auto text-xs text-slate-600 truncate">
      <span class="md:hidden font-semibold text-slate-400 mr-1">Арт:</span>
      <span class="font-semibold text-slate-700">{{ product.sku || product.id }}</span>
      <span v-if="product.unit" class="text-[10px] text-slate-400 ml-1">({{ product.unit }})</span>
    </div>

    <!-- 4. Управление количеством (+ / -) -->
    <div class="w-full md:w-auto flex items-center md:justify-center mt-2 md:mt-0" @click.stop>
      <div class="flex items-center gap-1 bg-slate-100/80 rounded-lg p-0.5 border border-slate-200/60">
        <button
          type="button"
          class="h-7 w-7 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all text-sm border border-slate-200/50 shadow-2xs cursor-pointer"
          :disabled="quantity <= 0"
          :class="{ 'opacity-40 cursor-not-allowed': quantity <= 0 }"
          @click="quantity > 1 ? cart.applyQuantityDelta(product.id, -1) : cart.removeItem(product.id)"
        >
          -
        </button>
        <span class="w-8 text-center text-sm font-extrabold text-slate-900">{{ quantity }}</span>
        <button
          type="button"
          class="h-7 w-7 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center transition-all text-sm shadow-2xs cursor-pointer"
          @click="cart.addProduct(product)"
        >
          +
        </button>
      </div>
    </div>

    <!-- 5. Цена за единицу -->
    <div class="w-full md:w-auto flex justify-between md:block text-right mt-2 md:mt-0 pt-2 border-t border-dashed border-slate-100 md:pt-0 md:border-none">
      <span class="md:hidden text-xs font-semibold uppercase tracking-wider text-slate-400">Цена:</span>
      <span class="text-sm font-bold text-slate-700">
        <template v-if="product.price !== null">
          {{ formatPrice(product.price) }} <span class="text-[10px] text-slate-400">{{ currencySymbol(product.currencyCode) }}</span>
        </template>
        <template v-else>
          <span class="text-[10px] text-orange-600">По запросу</span>
        </template>
      </span>
    </div>

    <!-- 6. Итоговая сумма -->
    <div class="w-full md:w-auto flex justify-between md:block text-right">
      <span class="md:hidden text-xs font-bold uppercase tracking-wider text-blue-600">Сумма:</span>
      <span class="text-sm font-extrabold text-slate-900">
        <template v-if="product.price !== null">
          {{ formatPrice(totalSum) }} <span class="text-xs font-semibold text-slate-500">{{ currencySymbol(product.currencyCode) }}</span>
        </template>
        <template v-else>
          <span class="text-xs text-orange-600">—</span>
        </template>
      </span>
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

const cartItem = computed(() => cart.items.find(i => i.id === props.product.id))
const quantity = computed(() => cartItem.value?.quantity ?? 0)

const totalSum = computed(() => {
  if (props.product.price === null) return 0
  const qty = quantity.value > 0 ? quantity.value : 1
  return props.product.price * qty
})
</script>

<style scoped lang="scss">
.product-row {
  min-height: auto;
}
</style>
