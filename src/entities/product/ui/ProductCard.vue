<template>
  <tr
    class="group transition-colors border-b border-slate-200 last:border-0 cursor-pointer"
    :class="[
      isFocused ? 'bg-blue-100/80 ring-2 ring-inset ring-blue-500 shadow-md z-10 relative' : 'hover:bg-blue-50/60'
    ]"
    :id="`product-row-${product.id}`"
    @click="emit('open-details', product)"
  >
    <!-- 1. Название товара -->
    <td class="p-2 align-middle text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
      <div class="line-clamp-2" :title="product.name">
        {{ product.name }}
      </div>
    </td>

    <!-- 2. Производитель -->
    <td class="p-2 align-middle text-[11px] text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]" :title="product.manufacturer || 'Не указан'">
      {{ product.manufacturer || 'Не указан' }}
    </td>

    <!-- 3. Артикул (Арт) -->
    <td class="p-2 align-middle text-[11px] text-slate-600 font-mono whitespace-nowrap">
      {{ product.sku || product.id }}
      <span v-if="product.unit" class="text-[9px] text-slate-400">({{ product.unit }})</span>
    </td>

    <!-- 4. Управление количеством (+ / -) -->
    <td class="p-2 align-middle whitespace-nowrap text-center" @click.stop>
      <div class="inline-flex items-center bg-white border border-slate-300 rounded overflow-hidden shadow-2xs">
        <button
          type="button"
          class="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          :disabled="quantity <= 0"
          :class="{ 'opacity-30 cursor-not-allowed': quantity <= 0 }"
          @click="quantity > 1 ? cart.applyQuantityDelta(product.id, -1) : cart.removeItem(product.id)"
        >
          -
        </button>
        <span class="w-8 text-center text-xs font-bold text-slate-900 border-x border-slate-200 bg-slate-50">{{ quantity }}</span>
        <button
          type="button"
          class="w-6 h-6 flex items-center justify-center font-bold text-blue-600 hover:bg-blue-50 transition-colors"
          @click="cart.addProduct(product)"
        >
          +
        </button>
      </div>
    </td>

    <!-- 5. Цена за единицу -->
    <td class="p-2 align-middle text-right whitespace-nowrap">
      <template v-if="product.price !== null">
        <span class="text-xs font-bold text-slate-800">{{ formatPrice(product.price) }}</span>
        <span class="text-[10px] text-slate-400 ml-0.5">{{ currencySymbol(product.currencyCode) }}</span>
      </template>
      <template v-else>
        <span class="text-[10px] text-orange-600 font-medium">По запросу</span>
      </template>
    </td>

    <!-- 6. Итоговая сумма -->
    <td class="p-2 align-middle text-right whitespace-nowrap font-bold transition-colors" :class="isFocused ? 'bg-blue-200/50' : 'bg-slate-50/30 group-hover:bg-blue-50/60'">
      <template v-if="product.price !== null">
        <span class="text-sm font-extrabold text-slate-900">{{ formatPrice(totalSum) }}</span>
        <span class="text-[10px] text-slate-500 ml-0.5">{{ currencySymbol(product.currencyCode) }}</span>
      </template>
      <template v-else>
        <span class="text-[10px] text-slate-400">—</span>
      </template>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { ProductViewModel } from '@fsd/entities/product/model/types'
import { currencySymbol } from '@fsd/shared/lib/currencySymbol'
import { useCartStore } from '~/stores/cart'
import { useFormattedPrice } from '~/composables/useFormattedPrice'

const props = defineProps<{
  product: ProductViewModel
  isFocused?: boolean
}>()

const emit = defineEmits<{
  (e: 'open-details', product: ProductViewModel): void
}>()

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
