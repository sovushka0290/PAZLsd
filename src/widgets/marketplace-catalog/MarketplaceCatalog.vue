<template>
  <section class="marketplace-catalog w-full bg-slate-50 min-h-screen relative flex">
    
    <!-- Embedded Left Sidebar (Desktop/Tablet) -->
    <div 
      class="hidden lg:flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 bg-white"
      :class="isCatalogSidebarOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'"
    >
       <div class="p-4 w-[320px] h-[calc(100vh-80px)] sticky top-[80px] overflow-y-auto">
         <div class="font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            Каталог
            <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="isCatalogSidebarOpen = false" />
         </div>

         <!-- Level 1: Root Categories -->
         <div v-if="!selectedCategoryForSidebar" class="space-y-1">
           <!-- "All products" -->
           <div
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            :class="selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'"
            @click="selectCategory('all')"
           >
            <UIcon name="i-lucide-layout-grid" class="w-5 h-5" />
            <span>Все товары</span>
           </div>
           
           <div
            v-for="cat in rootCategories"
            :key="cat.slug"
            class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-slate-700 hover:bg-slate-100"
            @click="openCategoryInSidebar(cat)"
           >
            <div class="flex items-center gap-3">
              <UIcon :name="cat.icon || 'i-lucide-folder'" class="w-5 h-5 text-blue-600/70" />
              <span>{{ cat.name }}</span>
            </div>
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-slate-400" v-if="cat.subcategories?.length" />
           </div>
         </div>
         
         <!-- Level 2: Subcategories View -->
         <div v-else class="space-y-1">
            <button @click="selectedCategoryForSidebar = null" class="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 mb-3 px-2 transition-colors">
              <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
              Назад
            </button>
            <div class="px-3 pb-2 text-sm font-extrabold text-slate-900 leading-tight">
               {{ selectedCategoryForSidebar.name }}
            </div>

            <!-- "All in this category" -->
            <div
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
              :class="selectedCategory === selectedCategoryForSidebar.slug && !selectedSubcategory ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-700 font-semibold hover:bg-slate-100'"
              @click="selectCategory(selectedCategoryForSidebar.slug)"
            >
              Все товары этой категории
            </div>
            
            <div
              v-for="sub in selectedCategoryForSidebar.subcategories"
              :key="sub.name"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
              :class="selectedSubcategory === sub.name ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
              @click="selectSubcategoryWithCategory(selectedCategoryForSidebar.slug, sub.name)"
            >
              <div class="w-1.5 h-1.5 rounded-full" :class="selectedSubcategory === sub.name ? 'bg-white' : 'bg-slate-300'"></div>
              <span>{{ sub.name }}</span>
              <span v-if="sub.product_count" class="opacity-70 text-[10px] ml-auto">({{ sub.product_count }})</span>
            </div>
         </div>
       </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="flex-1 transition-all duration-300 w-full min-w-0" :class="isCatalogSidebarOpen ? 'lg:pl-6' : 'lg:px-8 mx-auto max-w-7xl'">
      <div class="px-4 py-6 sm:px-6 w-full">
        <!-- Mobile Categories Button -->
        <div class="lg:hidden mb-4 flex items-center justify-between gap-4 rounded-xl bg-white p-3 border border-slate-200 shadow-2xs">
          <div class="min-w-0">
            <p class="text-[11px] text-slate-500">Категория:</p>
            <p class="text-xs font-bold truncate text-slate-900">{{ selectedCategoryName }}</p>
          </div>
          <UButton color="primary" variant="outline" size="xs" @click="isMobileDrawerOpen = true">
            Категории ☰
          </UButton>
        </div>

        <!-- Products Section -->
        <div class="w-full">
          <!-- Search and Info Header -->
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl shadow-2xs border border-slate-200/80">
            <p class="text-xs font-semibold text-slate-600">
              Найдено товаров:
              <span class="font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full ml-1 text-sm">{{ displayCount }}</span>
            </p>
            <p v-if="loadState === 'error'" class="text-xs text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
              {{ t('catalog.loadError') }}
            </p>
          </div>

          <!-- Loader -->
          <div v-if="loadState === 'loading'" class="py-16 text-center text-gray-500">
            <div class="flex flex-col items-center gap-3">
              <div class="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span class="text-sm font-medium">{{ t('catalog.loading') }}</span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredProducts.length === 0 && (loadState as string) !== 'loading'" class="py-16 text-center rounded-xl border border-dashed border-slate-200 bg-white">
            <p class="text-sm font-medium text-slate-500">{{ t('catalog.noProducts') }}</p>
          </div>

          <!-- Table View -->
          <div v-else class="w-full overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead class="bg-slate-100 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th class="p-2 w-[40%]">Название</th>
                  <th class="p-2 w-[15%]">Производитель</th>
                  <th class="p-2 w-[15%]">Артикул</th>
                  <th class="p-2 w-[10%] text-center">Кол-во</th>
                  <th class="p-2 w-[10%] text-right">Цена</th>
                  <th class="p-2 w-[10%] text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                <ProductCard
                  v-for="product in filteredProducts"
                  :key="product.id"
                  :product="product"
                  @open-details="openProductDetails"
                />
              </tbody>
            </table>
          </div>

          <!-- Load More Button -->
          <div v-if="selectedCategory !== 'all' && nextPageUrl" class="mt-8 flex justify-center">
            <UButton color="neutral" variant="outline" size="sm" :loading="loadMoreState === 'loading'" @click="loadMore">
              {{ t('catalog.loadMore') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Slideover for Category Tree -->
    <USlideover v-model:open="isMobileDrawerOpen" side="left" :ui="{ content: 'w-full sm:max-w-xs' }">
      <template #title>
        <span class="font-bold text-slate-900">{{ t('catalog.categoriesTitle') }}</span>
      </template>
      <template #body>
        <div class="space-y-1 pr-1 py-2 overflow-y-auto max-h-[80vh]">
          <!-- Similar to desktop logic, but simplified for mobile overlay -->
          <div v-if="!selectedCategoryForSidebar" class="space-y-1">
             <div
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              :class="selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'"
              @click="selectCategory('all')"
             >
              <UIcon name="i-lucide-layout-grid" class="w-4 h-4" />
              <span>Все товары</span>
             </div>
             <div
              v-for="cat in rootCategories"
              :key="cat.slug"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-slate-700 hover:bg-slate-100"
              @click="openCategoryInSidebar(cat)"
             >
              <div class="flex items-center gap-3">
                <UIcon :name="cat.icon || 'i-lucide-folder'" class="w-4 h-4" />
                <span>{{ cat.name }}</span>
              </div>
              <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-slate-400" v-if="cat.subcategories?.length" />
             </div>
          </div>
          <div v-else class="space-y-1">
            <button @click="selectedCategoryForSidebar = null" class="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-blue-600 mb-2 px-2">
              <UIcon name="i-lucide-arrow-left" class="w-3 h-3" /> Назад
            </button>
            <div class="px-3 pb-2 text-xs font-extrabold text-slate-900">{{ selectedCategoryForSidebar.name }}</div>
            <div
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              :class="selectedCategory === selectedCategoryForSidebar.slug && !selectedSubcategory ? 'bg-blue-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'"
              @click="selectCategory(selectedCategoryForSidebar.slug)"
            >
              Все товары
            </div>
            <div
              v-for="sub in selectedCategoryForSidebar.subcategories"
              :key="sub.name"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              :class="selectedSubcategory === sub.name ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'"
              @click="selectSubcategoryWithCategory(selectedCategoryForSidebar.slug, sub.name)"
            >
              <span>{{ sub.name }}</span>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Product Details Modal -->
    <ProductDetailsModal
      v-model="isProductModalOpen"
      :product="selectedProductForModal"
    />
  </section>
</template>

<script setup lang="ts">
import type { ApiCategory } from '@fsd/shared/api/types'
import type { ProductViewModel } from '@fsd/entities/product/model/types'
import { apiProductToViewModel } from '@fsd/shared/lib/mapApiProduct'
import { buildCategoryTree, type CategoryTreeNode } from '@fsd/shared/lib/buildCategoryTree'

const props = defineProps<{
  searchQuery: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const api = useMarketplaceApi()

const allCategories = ref<ApiCategory[]>([])
const categoryTree = ref<CategoryTreeNode[]>([])
const isMobileDrawerOpen = ref(false)

// Controls the embedded side-by-side catalog drawer (Desktop)
const isCatalogSidebarOpen = ref(true)

// Used for level 1 / level 2 drilling in the sidebar
const selectedCategoryForSidebar = ref<ApiCategory & { icon?: string } | null>(null)

const rootCategories = computed(() => {
  return allCategories.value
    .filter(c => c.parent === null)
    .map(c => ({ ...c, icon: 'i-lucide-folder' }))
})

const isProductModalOpen = ref(false)
const selectedProductForModal = ref<ProductViewModel | null>(null)

const catalogReady = ref(false)
const loadState = ref<'idle' | 'loading' | 'error'>('idle')
const loadMoreState = ref<'idle' | 'loading'>('idle')

const selectedCategory = ref<'all' | string>((route.query.category as string) || 'all')
const selectedSubcategory = ref<string | null>((route.query.subcategory as string) || null)

watch(() => route.query.category, (cat) => {
  selectedCategory.value = (cat as string) || 'all'
})
watch(() => route.query.subcategory, (sub) => {
  selectedSubcategory.value = (sub as string) || null
})

function openCategoryInSidebar(cat: ApiCategory & { icon?: string }) {
  if (cat.subcategories && cat.subcategories.length > 0) {
    selectedCategoryForSidebar.value = cat
  } else {
    selectCategory(cat.slug)
  }
}

function selectCategory(slug: string) {
  selectedCategory.value = slug
  selectedSubcategory.value = null
  isMobileDrawerOpen.value = false
  // if mobile, we close drawer. If desktop, keep sidebar open
}

function selectSubcategoryWithCategory(categorySlug: string, subcategoryName: string) {
  selectedCategory.value = categorySlug
  selectedSubcategory.value = subcategoryName
  isMobileDrawerOpen.value = false
}

const searchDebounced = ref(props.searchQuery)
const products = ref<ProductViewModel[]>([])
const page = ref(1)
const pageSize = 50
const totalCount = ref(0)
const nextPageUrl = ref<string | null>(null)

function openProductDetails(product: ProductViewModel) {
  selectedProductForModal.value = product
  isProductModalOpen.value = true
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(() => props.searchQuery, (q) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchDebounced.value = q
  }, 320)
})

const selectedCategoryName = computed(() => {
  if (selectedCategory.value === 'all') return t('catalog.allCategories')
  const cat = allCategories.value.find(c => c.slug === selectedCategory.value)
  return cat ? cat.name : selectedCategory.value
})

const displayCount = computed(() => filteredProducts.value.length)

function dedupeById(list: ProductViewModel[]): ProductViewModel[] {
  const seen = new Set<number>()
  const out: ProductViewModel[] = []
  for (const p of list) {
    if (!seen.has(p.id)) {
      seen.add(p.id)
      out.push(p)
    }
  }
  return out
}

const filteredProducts = computed(() => {
  const q = searchDebounced.value.trim().toLowerCase()
  let list = products.value
  if (q) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(q)
      || p.description.toLowerCase().includes(q)
      || (p.sku && p.sku.toLowerCase().includes(q))
      || (p.manufacturer && p.manufacturer.toLowerCase().includes(q))
    )
  }
  if (selectedSubcategory.value) {
    list = list.filter(p => p.subcategory === selectedSubcategory.value)
  }
  return list
})

async function loadCategories() {
  allCategories.value = await api.fetchAllCategories()
  categoryTree.value = buildCategoryTree(allCategories.value)
}

async function loadMergedFromRoots() {
  const res = await api.fetchProductsDetailed({ page: 1, pageSize, search: searchDebounced.value })
  const mapped = res.results.map(p => apiProductToViewModel(p, 'all', t('catalog.allCategories')))
  products.value = dedupeById(mapped)
  totalCount.value = res.count
  nextPageUrl.value = res.next
}

async function loadSingleCategoryPage(resetList: boolean) {
  const cat = allCategories.value.find(c => c.slug === selectedCategory.value)
  const res = await api.fetchCategoryProductsDetailed({
    categoryKey: selectedCategory.value,
    page: page.value,
    pageSize,
    search: searchDebounced.value
  })
  const mapped = res.results.map(p => apiProductToViewModel(p, selectedCategory.value, cat?.name ?? selectedCategory.value))
  if (resetList) {
    products.value = mapped
  } else {
    products.value = dedupeById([...products.value, ...mapped])
  }
  totalCount.value = res.count
  nextPageUrl.value = res.next
}

async function loadProducts() {
  loadState.value = 'loading'
  try {
    if (selectedCategory.value === 'all') await loadMergedFromRoots()
    else await loadSingleCategoryPage(true)
    loadState.value = 'idle'
  } catch (err) {
    loadState.value = 'error'
    products.value = []
    totalCount.value = 0
    nextPageUrl.value = null
  }
}

async function loadMore() {
  if (!nextPageUrl.value) return
  loadMoreState.value = 'loading'
  page.value += 1
  try {
    if (selectedCategory.value === 'all') {
      const res = await api.fetchProductsDetailed({ page: page.value, pageSize, search: searchDebounced.value })
      const mapped = res.results.map(p => apiProductToViewModel(p, 'all', t('catalog.allCategories')))
      products.value = dedupeById([...products.value, ...mapped])
      totalCount.value = res.count
      nextPageUrl.value = res.next
    } else {
      await loadSingleCategoryPage(false)
    }
  } catch {
    page.value -= 1
  } finally {
    loadMoreState.value = 'idle'
  }
}

watch(searchDebounced, () => { page.value = 1 })
watch(selectedCategory, () => { page.value = 1 })
watch([selectedCategory, searchDebounced], () => {
  if (!catalogReady.value) return
  void loadProducts()
})

onMounted(async () => {
  loadState.value = 'loading'
  try {
    await loadCategories().catch(e => console.warn('[MarketplaceCatalog] Categories load issue:', e))
    catalogReady.value = true
  } finally {
    await loadProducts()
  }
})

// EXPOSE toggle method for parent component (index.vue bubbles) to use
defineExpose({
  toggleSidebar: () => {
    isCatalogSidebarOpen.value = !isCatalogSidebarOpen.value
  },
  openMobileDrawer: () => {
    isMobileDrawerOpen.value = true
  }
})
</script>

<style scoped lang="scss">
</style>
