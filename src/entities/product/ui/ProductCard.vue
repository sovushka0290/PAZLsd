<template>
  <div
    class="product-card group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl bg-white border border-slate-200/80 rounded-2xl p-4 cursor-pointer"
    @click="emit('open-details', product)"
  >
    <!-- Badges overlay -->
    <div v-if="product.stickers && product.stickers.length" class="absolute left-3 top-3 z-10 flex flex-wrap gap-1">
      <span
        v-for="sticker in product.stickers"
        :key="sticker"
        :class="[
          'px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md shadow-xs',
          sticker === 'Хит' ? 'bg-orange-500 text-white' : 
          sticker === 'Новинка' ? 'bg-emerald-500 text-white' : 
          'bg-blue-600 text-white'
        ]"
      >
        {{ sticker }}
      </span>
    </div>

    <!-- Image -->
    <div class="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center p-3 mb-3">
      <img
        :src="imgSrc"
        :alt="product.name"
        class="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="onImgError"
      >
    </div>

    <!-- Category / Brand Tag -->
    <div class="flex items-center justify-between gap-1 mb-1.5 text-xs text-slate-400">
      <span class="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider" :title="product.brand || 'Стоматология'">
        {{ product.brand || 'Стоматология' }}
      </span>
      <span class="truncate text-[11px] text-slate-400" :title="categoryLabel">{{ categoryLabel }}</span>
    </div>

    <!-- Title -->
    <h3 class="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3" :title="product.name">
      {{ product.name }}
    </h3>

    <!-- Price and Add to Cart Section -->
    <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
      <div class="flex flex-col">
        <span class="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Цена</span>
        <span class="text-base font-extrabold text-slate-900 leading-none">
          <template v-if="product.price !== null">
            {{ formatPrice(product.price) }} <span class="text-xs font-semibold text-slate-400">{{ currencySymbol(product.currencyCode) }}</span>
          </template>
          <template v-else>
            <span class="text-xs text-orange-600">{{ t('price.onRequest') }}</span>
          </template>
        </span>
      </div>

      <!-- Quick Add to Cart Controls -->
      <div class="shrink-0" @click.stop>
        <div
          v-if="quantity > 0"
          class="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-xs"
        >
          <button
            v-if="quantity > 1"
            type="button"
            class="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-white hover:shadow-xs transition-all"
            @click="cart.applyQuantityDelta(product.id, -1)"
          >
            -
          </button>
          <button
            v-else
            type="button"
            class="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-red-500 hover:bg-red-50 transition-all"
            @click="cart.removeItem(product.id)"
          >
            <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
          </button>
          <span class="w-5 text-center text-xs font-bold text-slate-900">{{ quantity }}</span>
          <button
            type="button"
            class="h-7 w-7 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-white hover:shadow-xs transition-all"
            @click="cart.applyQuantityDelta(product.id, 1)"
          >
            +
          </button>
        </div>

        <button
          v-else
          type="button"
          class="h-9 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
          @click="cart.addProduct(product)"
        >
          <UIcon name="i-lucide-shopping-cart" class="w-3.5 h-3.5" />
          <span>В корзину</span>
        </button>
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

const imgSrc = ref(props.product.image || '/images/nophoto.png')
watch(() => props.product.image, (newVal) => {
  imgSrc.value = newVal || '/images/nophoto.png'
})

function onImgError() {
  imgSrc.value = '/images/nophoto.png'
}
</script>

<style scoped lang="scss">
.product-card {
  :deep([data-slot='root']) {
    overflow: visible; /* Allow hover effects to break out if needed, though we use relative overflow-hidden */
  }
}
</style>
