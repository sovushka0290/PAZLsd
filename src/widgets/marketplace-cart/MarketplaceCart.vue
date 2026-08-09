<template>
  <div class="marketplace-cart">
    <UButton
      variant="soft"
      color="primary"
      class="relative h-10 w-10 flex items-center justify-center rounded-full !p-0 shadow-sm transition-transform hover:scale-105"
      :aria-label="t('cart.open')"
      @click="open = true"
    >
      <UIcon name="i-lucide-shopping-cart" class="h-5 w-5" />
      <span
        v-if="cart.totalItemCount > 0"
        class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-neutral-900"
      >
        {{ cart.totalItemCount }}
      </span>
    </UButton>

    <USlideover
      v-model:open="open"
      side="right"
      :ui="{ content: 'w-full sm:max-w-md flex flex-col bg-gray-50 dark:bg-neutral-900', overlay: 'bg-black/40 backdrop-blur-sm' }"
    >
      <!-- Header -->
      <template #title>
        <span class="inline-flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <UIcon name="i-lucide-shopping-cart" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          {{ t('cart.title', { count: cart.totalItemCount }) }}
        </span>
      </template>

      <!-- Body: Scrollable items -->
      <template #body>
        <div class="px-4 py-4 sm:px-6">
          <template v-if="cart.items.length === 0">
            <div class="flex flex-col items-center justify-center space-y-4 py-12 text-center text-gray-400 dark:text-neutral-500">
              <div class="rounded-full bg-gray-100 p-6 dark:bg-neutral-800">
                <UIcon name="i-lucide-shopping-cart" class="h-16 w-16 opacity-50" />
              </div>
              <p class="text-lg font-medium text-gray-600 dark:text-neutral-300">{{ t('cart.empty') }}</p>
              <p class="text-sm">Перейдите в каталог, чтобы добавить товары</p>
              <UButton color="primary" variant="soft" class="mt-4 px-6" @click="open = false">
                Вернуться к покупкам
              </UButton>
            </div>
          </template>

          <template v-else>
            <div class="space-y-4">
              <div
                v-for="item in cart.items"
                :key="item.id"
                class="flex gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
              >


                <!-- Item Details -->
                <div class="flex flex-1 flex-col justify-between min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <span v-if="item.manufacturer" class="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {{ item.manufacturer }}
                      </span>
                      <h4 class="truncate text-sm font-semibold text-gray-900 dark:text-white" :title="item.name">
                        {{ item.name }}
                      </h4>
                      <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-neutral-400" :title="item.categoryName">
                        {{ item.categoryName }}
                      </p>
                    </div>
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      class="-mr-2 -mt-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      :aria-label="t('cart.remove')"
                      @click="cart.removeItem(item.id)"
                    >
                      <UIcon name="i-lucide-trash" class="h-4 w-4" />
                    </UButton>
                  </div>

                  <div class="mt-3 flex items-center justify-between">
                    <!-- Quantity Control -->
                    <div class="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-900">
                      <UButton
                        icon="i-lucide-minus"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        square
                        class="h-6 w-6 !p-0 text-gray-600 hover:bg-white dark:text-neutral-400 dark:hover:bg-neutral-800"
                        :disabled="item.quantity <= 1"
                        :aria-label="t('cart.decrease')"
                        @click="cart.applyQuantityDelta(item.id, -1)"
                      />
                      <span class="w-6 text-center text-xs font-semibold">{{ item.quantity }}</span>
                      <UButton
                        icon="i-lucide-plus"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        square
                        class="h-6 w-6 !p-0 text-gray-600 hover:bg-white dark:text-neutral-400 dark:hover:bg-neutral-800"
                        :aria-label="t('cart.increase')"
                        @click="cart.applyQuantityDelta(item.id, 1)"
                      />
                    </div>

                    <!-- Item Total Price -->
                    <span class="text-sm font-bold text-gray-900 dark:text-white">
                      <template v-if="item.price !== null">
                        {{ formatPrice(item.price * item.quantity) }} <span class="text-xs font-medium text-gray-500">{{ currencySymbol(item.currencyCode) }}</span>
                      </template>
                      <template v-else>
                        <span class="text-orange-600 dark:text-orange-400">{{ t('price.onRequest') }}</span>
                      </template>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- Footer: Summary & Checkout -->
      <template #footer>
        <div v-if="cart.items.length > 0" class="w-full border-t border-gray-200 bg-white px-4 py-4 sm:px-6 dark:border-neutral-800 dark:bg-neutral-950">
          <div class="mb-4 space-y-2">
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-neutral-400">
              <span>Товары ({{ cart.totalItemCount }})</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatPrice(cart.totalPrice) }} {{ currencySymbol(cart.dominantCurrencyCode) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-neutral-400">
              <span>Скидка</span>
              <span class="font-medium text-green-600">0 {{ currencySymbol(cart.dominantCurrencyCode) }}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-800">
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ t('cart.total') }}</span>
              <span class="text-2xl font-black text-blue-600 dark:text-blue-400">
                {{ formatPrice(cart.totalPrice) }} <span class="text-base font-semibold">{{ currencySymbol(cart.dominantCurrencyCode) }}</span>
              </span>
            </div>
          </div>
          <NuxtLink
            :to="localePath('/checkout')"
            class="h-14 w-full text-lg font-extrabold bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all cursor-pointer text-center no-underline"
            @click="open = false"
          >
            {{ t('cart.checkout') }}
          </NuxtLink>
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
</script>

<style scoped lang="scss">
.marketplace-cart {
  display: inline-flex;
}
</style>
