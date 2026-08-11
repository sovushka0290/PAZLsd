<template>
  <div class="flex min-h-screen bg-slate-50 relative pb-24">
    
    <!-- Sidebar Slot (Controlled by index.vue state, populated by Teleport from Catalog) -->
    <aside 
      class="hidden lg:block shrink-0 border-r border-slate-200 bg-white sticky top-0 h-screen z-[60] transition-all duration-300"
      :class="isDesktopSidebarOpen ? 'w-[320px]' : 'w-0 overflow-hidden border-none'"
    >
      <div id="desktop-sidebar-slot" class="w-[320px] h-full"></div>
    </aside>

    <!-- Main Content Flow -->
    <main class="flex-1 flex flex-col min-w-0">
      <MarketplaceHeader v-model="searchQuery" @toggle-catalog="toggleCatalog" />
      <MarketplaceHero v-model="searchQuery" />
      <MarketplaceCatalog ref="catalogRef" :search-query="searchQuery" />
      <MarketplaceFooter />
    </main>
    
    <!-- Floating Cart Slideover (Desktop/Mobile overlay) -->
    <FloatingCart />

    <!-- FLOATING BUBBLES BAR (Categories, Search, Cart) -->
    <!-- Appears when scrolling down past the hero/header -->
    <div
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-out flex"
      :class="y > 400 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'"
    >
      <div class="flex items-center gap-2 sm:gap-4 bg-white/40 backdrop-blur-3xl px-4 py-3 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/60">
        
        <!-- Category Bubble -->
        <button 
          class="flex flex-col items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors w-16" 
          @click="toggleCatalog"
        >
          <div class="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
            <UIcon name="i-lucide-layout-grid" class="w-5 h-5 text-blue-600" />
          </div>
          <span class="text-[10px] font-extrabold uppercase tracking-wide">Каталог</span>
        </button>
        
        <!-- Divider -->
        <div class="w-px h-8 bg-slate-200"></div>

        <!-- Search Bubble -->
        <button 
          class="flex flex-col items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors w-16" 
          @click="scrollToTop"
        >
          <div class="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm hover:bg-white hover:border-slate-200 transition-all">
            <UIcon name="i-lucide-search" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-extrabold uppercase tracking-wide">Поиск</span>
        </button>

        <!-- Divider -->
        <div class="w-px h-8 bg-slate-200"></div>

        <!-- Cart Bubble -->
        <button 
          class="flex flex-col items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors w-16 relative" 
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
  </div>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { useCartStore } from '~/stores/cart'

const searchQuery = ref('')
const { t } = useI18n()
const { y } = useWindowScroll()
const cart = useCartStore()

const catalogRef = ref<any>(null)
const isDesktopSidebarOpen = ref(true)

function toggleCatalog() {
  if (window.innerWidth >= 1024) {
    isDesktopSidebarOpen.value = !isDesktopSidebarOpen.value
    // Also tell catalog to sync its internal state if needed
    if (catalogRef.value) catalogRef.value.toggleSidebar(isDesktopSidebarOpen.value)
  } else {
    if (catalogRef.value) {
      catalogRef.value.toggleSidebar()
    }
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  // After scrolling up, maybe focus the search input in the header
  setTimeout(() => {
    const input = document.querySelector('header input[type="text"]') as HTMLInputElement
    if (input) input.focus()
  }, 500)
}

function openCart() {
  cart.isFloatingCartOpen = true
}

useSeoMeta({
  title: () => t('meta.homeTitle'),
  ogTitle: () => t('meta.homeTitle')
})
</script>

<style scoped lang="scss">
</style>
