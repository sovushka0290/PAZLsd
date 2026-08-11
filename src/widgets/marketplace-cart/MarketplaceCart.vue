<template>
  <div class="marketplace-cart">
    <UButton
      variant="soft"
      color="primary"
      class="relative h-10 w-10 flex items-center justify-center rounded-full !p-0 shadow-sm transition-transform hover:scale-105"
      :aria-label="t('cart.open')"
      @click="cart.isFloatingCartOpen = !cart.isFloatingCartOpen"
    >
      <UIcon name="i-lucide-shopping-cart" class="h-5 w-5" />
      <span
        v-if="cart.totalItemCount > 0"
        class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-neutral-900"
      >
        {{ cart.totalItemCount }}
      </span>
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const { t } = useI18n()
const cart = useCartStore()
</script>

<style scoped lang="scss">
.marketplace-cart {
  display: inline-flex;
}
</style>
