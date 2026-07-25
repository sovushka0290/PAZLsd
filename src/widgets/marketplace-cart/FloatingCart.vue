<template>
  <div
    v-if="isVisible"
    class="fixed bottom-6 left-4 right-4 z-40 lg:hidden transform transition-all duration-300 animate-slide-up max-w-[calc(100vw-2rem)] mx-auto"
  >
    <div
      class="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-white rounded-[2rem] p-4 shadow-[0_8px_30px_rgba(37,99,235,0.4)] dark:shadow-neutral-900/40 cursor-pointer transform transition-all hover:scale-[1.02]"
      @click="openCart"
    >
      <div class="flex items-center gap-3">
        <div class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <UIcon name="i-lucide-shopping-cart" class="h-5 w-5 text-white" />
          <span class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
            {{ cart.totalItemCount }}
          </span>
        </div>
        <div>
          <p class="text-xs text-blue-100 font-medium">
            {{ t('cart.title', { count: cart.totalItemCount }) }}
          </p>
          <p class="text-base font-bold">
            {{ formatPrice(cart.totalPrice) }} {{ currencySymbol(cart.dominantCurrencyCode) }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1 font-semibold text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors">
        <span>{{ t('cart.open', 'Перейти') }}</span>
        <span>→</span>
      </div>
    </div>

    <!-- Slideover for Cart Details -->
    <USlideover
      v-model:open="open"
      :ui="{ width: 'w-full max-w-md' }"
    >
      <template #title>
        <span class="inline-flex items-center gap-2">
          <UIcon name="i-lucide-shopping-cart" />
          {{ t('cart.title', { count: cart.totalItemCount }) }}
        </span>
      </template>

      <template #body>
        <div class="mt-2 space-y-4">
          <template v-if="cart.items.length === 0">
            <div class="py-12 text-center text-gray-500 dark:text-neutral-400">
              <UIcon name="i-lucide-shopping-cart" class="mx-auto mb-4 !h-16 !w-16 opacity-30" />
              <p>{{ t('cart.empty') }}</p>
            </div>
          </template>

          <template v-else>
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="flex gap-4 border-b border-gray-200 pb-4 dark:border-neutral-800"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="h-20 w-20 rounded object-cover"
                width="80"
                height="80"
                loading="lazy"
              >
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h4 class="text-sm font-medium line-clamp-2">
                      {{ item.name }}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-neutral-400">
                      {{ item.categoryName }}
                    </p>
                  </div>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    class="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                    :aria-label="t('cart.remove')"
                    @click="cart.removeItem(item.id)"
                  >
                    <UIcon name="i-lucide-trash" class="h-4 w-4" />
                  </UButton>
                </div>
                <div class="mt-2 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UButton
                      icon="i-lucide-minus"
                      variant="outline"
                      color="neutral"
                      size="sm"
                      square
                      class="h-7 w-7 shrink-0 justify-center !gap-0 !p-0 text-gray-600 dark:text-neutral-400"
                      :ui="{ leadingIcon: 'size-3 shrink-0' }"
                      :disabled="item.quantity <= 1"
                      :aria-label="t('cart.decrease')"
                      @click="cart.applyQuantityDelta(item.id, -1)"
                    />
                    <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                    <UButton
                      icon="i-lucide-plus"
                      variant="outline"
                      color="neutral"
                      size="sm"
                      square
                      class="h-7 w-7 shrink-0 justify-center !gap-0 !p-0 text-gray-600 dark:text-neutral-400"
                      :ui="{ leadingIcon: 'size-3 shrink-0' }"
                      :aria-label="t('cart.increase')"
                      @click="cart.applyQuantityDelta(item.id, 1)"
                    />
                  </div>
                  <span class="font-semibold text-blue-900 dark:text-blue-100">
                    <template v-if="item.price !== null">
                      {{ formatPrice(item.price * item.quantity) }} {{ currencySymbol(item.currencyCode) }}
                    </template>
                    <template v-else>
                      {{ t('price.onRequest') }}
                    </template>
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-2 pt-4">
              <div class="flex items-center justify-between py-2">
                <span class="text-lg font-semibold">{{ t('cart.total') }}</span>
                <span class="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {{ formatPrice(cart.totalPrice) }} {{ currencySymbol(cart.dominantCurrencyCode) }}
                </span>
              </div>
              <NuxtLink
                :to="localePath('/checkout')"
                class="w-full py-4 text-lg font-extrabold bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all cursor-pointer text-center no-underline"
                @click="open = false"
              >
                {{ t('cart.checkout') }}
              </NuxtLink>
            </div>
          </template>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { currencySymbol } from '@fsd/shared/lib/currencySymbol'
import { useCartStore } from '~/stores/cart'
import { useFormattedPrice } from '~/composables/useFormattedPrice'

const open = ref(false)
const { t } = useI18n()
const cart = useCartStore()
const formatPrice = useFormattedPrice()
const localePath = useLocalePath()
const route = useRoute()

const isVisible = computed(() => {
  return cart.totalItemCount > 0 && !route.path.includes('/checkout')
})

function openCart() {
  open.value = true
}
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.25s ease-out forwards;
}
</style>
