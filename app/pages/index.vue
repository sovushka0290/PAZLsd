<template>
  <div 
    class="min-h-screen bg-slate-50 relative transition-all duration-300"
    :class="cart.isFloatingCartOpen ? 'lg:pr-[380px]' : ''"
  >
    
    <!-- Main Content -->
    <div class="w-full flex flex-col min-w-0" id="main-scroll-container">
      <MarketplaceHeader v-model="searchQuery" @toggle-catalog="toggleCatalog" />
      <MarketplaceHero v-model="searchQuery" />
      <MarketplaceCatalog ref="catalogRef" :search-query="searchQuery" />
      <MarketplaceFooter />
      
      <!-- Top Floating Search -->
      <div
        class="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[80] transition-all duration-500 ease-out flex"
        :class="y > 300 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-95 pointer-events-none'"
      >
        <div 
          class="flex items-center gap-3 bg-white/70 backdrop-blur-2xl px-4 py-2.5 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/60 w-[280px] sm:w-[400px] transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500"
        >
          <UIcon name="i-lucide-search" class="w-5 h-5 text-slate-400 shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск товаров..."
            class="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:ring-0 outline-none"
          />
        </div>
      </div>

      <!-- FLOATING BUBBLES BAR (Categories, Cart) -->
      <div
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-out flex"
        :class="y > 400 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'"
      >
        <div class="flex items-center gap-2 sm:gap-4 bg-white/40 backdrop-blur-3xl px-4 py-3 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/60">
          
          <!-- Category Bubble -->
          <button 
            class="flex flex-col items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors w-16 cursor-pointer" 
            @click="toggleCatalog"
          >
            <div class="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
              <UIcon name="i-lucide-layout-grid" class="w-5 h-5 text-blue-600" />
            </div>
            <span class="text-[10px] font-extrabold uppercase tracking-wide">Каталог</span>
          </button>
          
          <!-- Divider -->
          <div class="w-px h-8 bg-slate-200"></div>

          <!-- Cart Bubble -->
          <button 
            class="flex flex-col items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors w-16 relative cursor-pointer" 
            @click="openCart"
          >
            <div class="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm hover:bg-white hover:border-slate-200 transition-all">
              <UIcon name="i-lucide-shopping-cart" class="w-5 h-5" />
              <!-- Notification Badge -->
              <span 
                v-if="cart.itemsCount > 0"
                class="absolute top-0 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white"
              >
                {{ cart.itemsCount }}
              </span>
            </div>
            <span class="text-[10px] font-extrabold uppercase tracking-wide">Корзина</span>
          </button>

        </div>
      </div>
      
      <!-- Mobile Backdrop for Cart -->
      <div 
        v-if="cart.isFloatingCartOpen" 
        class="fixed inset-0 bg-slate-900/50 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
        @click="cart.isFloatingCartOpen = false"
      ></div>
    </div>

    <!-- Right Sidebar (Embedded Cart) -->
    <div 
      class="fixed top-0 right-0 h-screen transition-transform duration-300 ease-in-out border-l border-slate-200 bg-white shadow-2xl z-[80]"
      :class="cart.isFloatingCartOpen ? 'translate-x-0 w-[320px] lg:w-[380px]' : 'translate-x-full w-[320px] lg:w-[380px]'"
    >
      <div class="w-full h-full flex flex-col bg-slate-50/50">
        <!-- Cart Header -->
        <div class="p-3 lg:p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-xs z-10">
          <span class="font-extrabold text-slate-900 flex items-center gap-2 text-sm lg:text-base">
            <UIcon name="i-lucide-shopping-cart" class="text-blue-600 w-4 h-4 lg:w-5 lg:h-5" />
            Корзина ({{ cart.totalItemCount }})
          </span>
          <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="cart.isFloatingCartOpen = false" />
        </div>

        <!-- Cart Body -->
        <div class="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2.5">
          <template v-if="cart.items.length === 0">
            <div class="flex flex-col items-center justify-center space-y-3 py-10 text-center text-slate-400">
              <div class="rounded-full bg-slate-100 p-4">
                <UIcon name="i-lucide-shopping-cart" class="h-10 w-10 opacity-40" />
              </div>
              <p class="text-sm font-semibold text-slate-600">Корзина пуста</p>
              <p class="text-xs">Добавьте товары из каталога</p>
            </div>
          </template>

          <template v-else>
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <span v-if="item.manufacturer" class="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-blue-600 truncate">
                    {{ item.manufacturer }}
                  </span>
                  <h4 class="text-xs font-bold text-slate-900 leading-snug line-clamp-2" :title="item.name">
                    {{ item.name }}
                  </h4>
                  <p class="mt-0.5 truncate text-[10px] text-slate-500 font-medium" :title="item.categoryName">
                    {{ item.categoryName }}
                  </p>
                </div>
                <button
                  class="shrink-0 text-slate-300 hover:text-red-500 transition-colors p-1"
                  title="Удалить"
                  @click="cart.removeItem(item.id)"
                >
                  <UIcon name="i-lucide-trash" class="h-3.5 w-3.5" />
                </button>
              </div>

              <div class="mt-1 flex items-center justify-between">
                <!-- Quantity Control -->
                <div class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0 shadow-sm">
                  <button
                    class="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center bg-white text-slate-700 shadow-sm hover:text-blue-600 hover:border-blue-200 border border-transparent rounded transition-all disabled:opacity-50"
                    :disabled="item.quantity <= 1"
                    @click="cart.applyQuantityDelta(item.id, -1)"
                  >
                    <UIcon name="i-lucide-minus" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <span class="w-6 sm:w-8 text-center text-xs sm:text-sm font-extrabold text-slate-800">{{ item.quantity }}</span>
                  <button
                    class="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center bg-white text-slate-700 shadow-sm hover:text-blue-600 hover:border-blue-200 border border-transparent rounded transition-all"
                    @click="cart.applyQuantityDelta(item.id, 1)"
                  >
                    <UIcon name="i-lucide-plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <!-- Price -->
                <span class="text-xs font-extrabold text-slate-900">
                  <template v-if="item.price !== null">
                    {{ formatPrice(item.price * item.quantity) }} <span class="text-[10px] font-semibold text-slate-500">{{ currencySymbol(item.currencyCode) }}</span>
                  </template>
                  <template v-else>
                    <span class="text-orange-600 text-[10px]">По запросу</span>
                  </template>
                </span>
              </div>
            </div>
          </template>
        </div>

        <!-- Cart Footer -->
        <div v-if="cart.items.length > 0" class="p-3 lg:p-4 border-t border-slate-200 bg-white shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
          <div class="mb-3 space-y-1">
            <div class="flex items-center justify-between pt-1">
              <span class="text-sm font-bold text-slate-900">Итого</span>
              <span class="text-lg font-black text-blue-600">
                {{ formatPrice(cart.totalPrice) }} <span class="text-xs font-bold">{{ currencySymbol(cart.dominantCurrencyCode) }}</span>
              </span>
            </div>
          </div>
          <NuxtLink
            :to="localePath('/checkout')"
            class="h-10 w-full text-sm font-extrabold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl flex items-center justify-center shadow-md transition-all cursor-pointer text-center no-underline"
            @click="cart.isFloatingCartOpen = false"
          >
            Оформить заказ
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { useCartStore } from '~/stores/cart'
import { currencySymbol } from '@fsd/shared/lib/currencySymbol'
import { useFormattedPrice } from '~/composables/useFormattedPrice'

const searchQuery = ref('')
const { t } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()
const formatPrice = useFormattedPrice()

// Scroll tracking for the window
const { y } = useWindowScroll()

const catalogRef = ref<any>(null)

function toggleCatalog() {
  if (catalogRef.value) {
    catalogRef.value.toggleSidebar()
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  setTimeout(() => {
    const input = document.querySelector('header input[type="text"]') as HTMLInputElement
    if (input) input.focus()
  }, 500)
}

function openCart() {
  cart.isFloatingCartOpen = !cart.isFloatingCartOpen
}

useSeoMeta({
  title: () => t('meta.homeTitle'),
  ogTitle: () => t('meta.homeTitle')
})
</script>

<style scoped lang="scss">
</style>

