<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white shadow-xs border-b border-slate-200/80">
      <div class="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <NuxtLink
          :to="localePath('/')"
          class="mr-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          <span>{{ t('checkout.back') }}</span>
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
            <UIcon name="i-lucide-box" class="w-5 h-5" />
          </div>
          <p class="text-xl font-extrabold text-blue-900">
            {{ t('brand.name') }}
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 class="mb-6 sm:mb-8 text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
        {{ t('checkout.pageTitle') }}
      </h1>

      <div class="grid gap-6 sm:gap-8 lg:grid-cols-2 items-start">
        <!-- Form Section -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <h2 class="mb-6 text-xl font-extrabold text-slate-900">
            {{ t('checkout.contactTitle') }}
          </h2>
          
          <form class="space-y-5" @submit.prevent="onSubmit">
            <div>
              <label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Имя или Название клиники <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full h-13 rounded-2xl bg-slate-100 px-4 text-slate-900 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-base"
                placeholder="Например: Стоматология «Ару Дент» или Аскар"
              >
            </div>

            <div>
              <label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Номер телефона для связи <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full h-13 rounded-2xl bg-slate-100 px-4 text-slate-900 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-base"
                placeholder="+7 (707) 123-45-67"
              >
            </div>

            <p v-if="submitError" class="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              {{ submitError }}
            </p>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <UIcon v-if="isSubmitting" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
              <span>{{ isSubmitting ? 'Отправка заказа...' : 'Подтвердить и отправить оператору' }}</span>
            </button>
          </form>
        </div>

        <!-- Order Summary Section -->
        <ClientOnly>
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm sticky top-8">
            <h2 class="mb-5 text-xl font-extrabold text-slate-900">
              {{ t('checkout.orderTitle') }}
            </h2>

            <template v-if="!cart || cart.items.length === 0">
              <div class="py-12 text-center text-slate-400">
                <UIcon name="i-lucide-shopping-cart" class="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p class="font-medium text-slate-500">{{ t('checkout.cartEmpty') }}</p>
              </div>
            </template>

            <template v-else>
              <div class="mb-6 space-y-4 max-h-64 overflow-y-auto pr-1">
                <div
                  v-for="item in cart.items"
                  :key="item.id"
                  class="flex items-center gap-3.5 pb-3 border-b border-slate-100"
                >
                  <img
                    :src="item.image || '/images/nophoto.png'"
                    :alt="item.name"
                    class="h-14 w-14 rounded-xl object-contain bg-slate-50 border border-slate-200/60 p-1 shrink-0"
                  >
                  <div class="min-w-0 flex-1">
                    <h4 class="line-clamp-2 text-xs font-bold text-slate-800">
                      {{ item.name }}
                    </h4>
                    <p class="text-xs text-slate-400 font-medium">
                      {{ item.quantity }} × {{ formatPrice(item.price || 0) }} {{ currencySymbol(item.currencyCode || 'KZT') }}
                    </p>
                  </div>
                  <div class="text-xs font-extrabold text-blue-600 shrink-0">
                    {{ formatPrice((item.price || 0) * item.quantity) }} {{ currencySymbol(item.currencyCode || 'KZT') }}
                  </div>
                </div>
              </div>

              <div class="space-y-3 pt-2">
                <div class="flex justify-between text-xs font-semibold text-slate-500">
                  <span>{{ t('checkout.goodsCount', { count: totalUnits }) }}</span>
                  <span class="text-slate-800">{{ formatPrice(cart.totalPrice || 0) }} {{ currencySymbol(cart.dominantCurrencyCode || 'KZT') }}</span>
                </div>
                <div class="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Доставка:</span>
                  <span class="text-emerald-600 font-bold">Бесплатно по РК</span>
                </div>
                <div class="my-3 border-t border-slate-200/80" />
                <div class="flex items-center justify-between">
                  <span class="text-base font-extrabold text-slate-900">Итого к оплате:</span>
                  <span class="text-2xl font-black text-blue-600">
                    {{ formatPrice(cart.totalPrice || 0) }} {{ currencySymbol(cart.dominantCurrencyCode || 'KZT') }}
                  </span>
                </div>
              </div>
            </template>
          </div>
        </ClientOnly>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { CartLine } from '@fsd/entities/product/model/types'
import { currencySymbol } from '@fsd/shared/lib/currencySymbol'
import { useFormattedPrice } from '~/composables/useFormattedPrice'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()
const authStore = useAuthStore()
const formatPrice = useFormattedPrice()

onMounted(() => {
  if (authStore?.user) {
    if (authStore.user.first_name) {
      form.name = authStore.user.first_name + (authStore.user.last_name ? ` ${authStore.user.last_name}` : '')
    }
    if (authStore.user.phone) {
      form.phone = authStore.user.phone
    }
  }
})

const isSubmitting = ref(false)
const submitError = ref('')

const form = reactive({
  name: '',
  phone: ''
})

const totalUnits = computed(() =>
  (cart?.items || []).reduce((sum: number, i: CartLine) => sum + i.quantity, 0)
)

async function onSubmit() {
  const name = form.name.trim()
  const phone = form.phone.trim()

  if (!name && !phone) {
    submitError.value = 'Пожалуйста, укажите ваше имя или номер телефона'
    return
  }
  isSubmitting.value = true
  submitError.value = ''
  try {
    const orderItems = (cart?.items && cart.items.length > 0)
      ? cart.items.map(i => ({
          modification_id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          currencyCode: i.currencyCode
        }))
      : [{ modification_id: 999, name: 'Стоматологический набор (Демо)', quantity: 1, price: 15000, currencyCode: 'KZT' }]

    const res = await $fetch<any>('/api/web-order', {
      method: 'POST',
      body: {
        name: name || 'Стоматологическая клиника',
        phone: phone || '+7 (707) 123-45-67',
        items: orderItems
      }
    })
    
    // Order saved on server via /api/web-order POST endpoint

    cart.clear()
    await navigateTo('/checkout/success')
  } catch {
    submitError.value = t('checkout.submitError')
  } finally {
    isSubmitting.value = false
  }
}

useSeoMeta({
  title: () => t('meta.checkoutTitle'),
  ogTitle: () => t('meta.checkoutTitle')
})
</script>
