<template>
  <section class="marketplace-catalog w-full bg-slate-50/70 min-h-screen">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <!-- Mobile Categories Button & Drawer Trigger -->
      <div class="lg:hidden mb-4 flex items-center justify-between gap-4 rounded-xl bg-white p-3 border border-slate-200 shadow-2xs">
        <div class="min-w-0">
          <p class="text-[11px] text-slate-500">
            Категория:
          </p>
          <p class="text-xs font-bold truncate text-slate-900">
            {{ selectedCategoryName }}
          </p>
        </div>
        <UButton
          color="primary"
          variant="outline"
          size="xs"
          @click="isMobileDrawerOpen = true"
        >
          Категории ☰
        </UButton>
      </div>

      <!-- Horizontal Quick Category Pills Bar -->
      <div class="mb-6 overflow-x-auto pb-2 scrollbar-none w-full max-w-full">
        <div class="flex items-center gap-2 min-w-max">
          <button
            v-for="pill in categoryPills"
            :key="pill.slug"
            @click="selectCategory(pill.slug)"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border"
            :class="selectedCategory === pill.slug
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            "
          >
            <span>{{ pill.name }}</span>
          </button>
        </div>
        
        <!-- Subcategory Pills Row -->
        <div v-if="subcategories.length > 0" class="flex items-center gap-1.5 min-w-max mt-2.5">
          <button
            @click="selectSubcategory(null)"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border"
            :class="selectedSubcategory === null
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            "
          >
            <span>Все подкатегории</span>
          </button>
          <button
            v-for="sub in subcategories"
            :key="sub.name"
            @click="selectSubcategory(sub.name)"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border"
            :class="selectedSubcategory === sub.name
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            "
          >
            <span>{{ sub.name }}</span>
            <span v-if="sub.product_count" class="opacity-70 text-[10px] ml-1">({{ sub.product_count }})</span>
          </button>
        </div>
      </div>

      <!-- Products Section -->
      <div class="w-full">
        <!-- Search and Info Header -->
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl shadow-2xs border border-slate-200/80">
          <p class="text-xs font-semibold text-slate-600">
            Найдено товаров:
            <span class="font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full ml-1 text-sm">{{ displayCount }}</span>
          </p>
          <p
            v-if="loadState === 'error'"
            class="text-xs text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full"
          >
            {{ t('catalog.loadError') }}
          </p>
        </div>

        <!-- Product Grid -->
        <div
          v-if="loadState === 'loading'"
          class="py-16 text-center text-gray-500"
        >
          <div class="flex flex-col items-center gap-3">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span class="text-sm font-medium">{{ t('catalog.loading') }}</span>
          </div>
        </div>

        <div
          v-else-if="filteredProducts.length === 0 && (loadState as string) !== 'loading'"
          class="py-16 text-center rounded-xl border border-dashed border-slate-200 bg-white"
        >
          <p class="text-sm font-medium text-slate-500">
            {{ t('catalog.noProducts') }}
          </p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @open-details="openProductDetails"
          />
        </div>

        <!-- Load More Button -->
        <div
          v-if="selectedCategory !== 'all' && nextPageUrl"
          class="mt-8 flex justify-center"
        >
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            :loading="loadMoreState === 'loading'"
            @click="loadMore"
          >
            {{ t('catalog.loadMore') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Mobile Slideover for Category Tree -->
    <USlideover
      v-model:open="isMobileDrawerOpen"
      side="left"
      :ui="{ content: 'w-full sm:max-w-xs' }"
    >
      <template #title>
        <span class="font-bold text-slate-900">
          {{ t('catalog.categoriesTitle') }}
        </span>
      </template>

      <template #body>
        <div class="space-y-1 pr-1 py-2 overflow-y-auto max-h-[80vh]">
          <div
            v-for="pill in categoryPills"
            :key="pill.slug"
            class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            :class="selectedCategory === pill.slug ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'"
            @click="selectCategory(pill.slug); isMobileDrawerOpen = false"
          >
            <UIcon :name="pill.icon || 'i-lucide-folder'" class="w-4 h-4" />
            <span>{{ pill.name }}</span>
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

const categoryPills = computed(() => {
  const rootCats = allCategories.value.filter(c => c.parent === null)
  const pills = rootCats.map(c => ({ slug: c.slug, name: c.name, icon: 'i-lucide-folder' }))
  return [{ slug: 'all', name: 'Все товары', icon: 'i-lucide-layout-grid' }, ...pills]
})

const isProductModalOpen = ref(false)
const selectedProductForModal = ref<ProductViewModel | null>(null)

const catalogReady = ref(false)
const loadState = ref<'idle' | 'loading' | 'error'>('idle')
const loadMoreState = ref<'idle' | 'loading'>('idle')

const selectedCategory = ref<'all' | string>((route.query.category as string) || 'all')
const selectedSubcategory = ref<string | null>((route.query.subcategory as string) || null)

watch(
  () => route.query.category,
  (cat) => {
    selectedCategory.value = (cat as string) || 'all'
  }
)

watch(
  () => route.query.subcategory,
  (sub) => {
    selectedSubcategory.value = (sub as string) || null
  }
)

const subcategories = computed(() => {
  if (selectedCategory.value === 'all') return []
  const cat = allCategories.value.find(c => c.slug === selectedCategory.value)
  return cat?.subcategories || []
})

function selectSubcategory(name: string | null) {
  selectedSubcategory.value = name
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
watch(
  () => props.searchQuery,
  (q) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      searchDebounced.value = q
    }, 320)
  }
)

const selectedCategoryName = computed(() => {
  if (selectedCategory.value === 'all') {
    return t('catalog.allCategories')
  }
  const cat = allCategories.value.find(c => c.slug === selectedCategory.value)
  return cat ? cat.name : selectedCategory.value
})

const displayCount = computed(() => {
  return filteredProducts.value.length
})

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
    list = list.filter(
      p =>
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
  const res = await api.fetchProductsDetailed({
    page: 1,
    pageSize,
    search: searchDebounced.value
  })
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
  const mapped = res.results
    .map(p =>
      apiProductToViewModel(
        p,
        selectedCategory.value,
        cat?.name ?? selectedCategory.value
      )
    )
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
    if (selectedCategory.value === 'all') {
      await loadMergedFromRoots()
    } else {
      await loadSingleCategoryPage(true)
    }
    loadState.value = 'idle'
  } catch (err) {
    console.error('[MarketplaceCatalog] Failed to load products:', err)
    loadState.value = 'error'
    products.value = []
    totalCount.value = 0
    nextPageUrl.value = null
  }
}

async function loadMore() {
  if (!nextPageUrl.value) {
    return
  }
  loadMoreState.value = 'loading'
  page.value += 1
  try {
    if (selectedCategory.value === 'all') {
      const res = await api.fetchProductsDetailed({
        page: page.value,
        pageSize,
        search: searchDebounced.value
      })
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

function selectCategory(slug: string) {
  selectedCategory.value = slug
  selectedSubcategory.value = null
  isMobileDrawerOpen.value = false
}

watch(searchDebounced, () => {
  page.value = 1
})

watch(selectedCategory, () => {
  page.value = 1
})

watch([selectedCategory, searchDebounced], () => {
  if (!catalogReady.value) {
    return
  }
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
</script>

<style scoped lang="scss">
.marketplace-catalog {
  width: 100%;
}
</style>
