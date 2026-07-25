<template>
  <section class="marketplace-catalog w-full bg-slate-50/70 min-h-screen">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Mobile Categories Button & Drawer Trigger -->
    <div class="lg:hidden mb-6 flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
      <div class="min-w-0">
        <p class="text-xs text-slate-500">
          {{ t('catalog.categoriesTitle') }}
        </p>
        <p class="text-sm font-semibold truncate text-slate-900">
          {{ selectedCategoryName }}
        </p>
      </div>
      <UButton
        color="primary"
        variant="outline"
        size="sm"
        @click="isMobileDrawerOpen = true"
      >
        {{ t('catalog.changeCategory', 'Выбрать') }}
      </UButton>
    </div>

    <!-- Horizontal Quick Category Pills Bar -->
    <div class="mb-8 overflow-x-auto pb-2 scrollbar-none w-full max-w-full">
      <div class="flex items-center gap-2 min-w-max">
        <button
          v-for="pill in categoryPills"
          :key="pill.slug"
          @click="selectCategory(pill.slug)"
          class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer shadow-xs border"
          :class="selectedCategory === pill.slug
            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
            : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
          "
        >
          <UIcon :name="pill.icon" class="w-4 h-4" />
          <span>{{ pill.name }}</span>
        </button>
      </div>
    </div>

    <!-- Products Section -->
    <div class="w-full">
        <!-- Search and Info Header -->
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p class="text-sm font-medium text-slate-600">
            {{ t('catalog.productsFoundBefore') }}
            <span class="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full ml-1 text-base">{{ displayCount }}</span>
          </p>
          <p
            v-if="loadState === 'error'"
            class="text-sm text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-full"
          >
            {{ t('catalog.loadError') }}
          </p>
        </div>

        <!-- Product Grid -->
        <div
          v-if="loadState === 'loading'"
          class="py-24 text-center text-gray-500"
        >
          <div class="flex flex-col items-center gap-3">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span>{{ t('catalog.loading') }}</span>
          </div>
        </div>

        <div
          v-else-if="products.length === 0 && loadState !== 'loading'"
          class="py-24 text-center rounded-xl border border-dashed border-gray-200 dark:border-neutral-800"
        >
          <p class="text-lg text-gray-500 dark:text-neutral-400">
            {{ t('catalog.noProducts') }}
          </p>
        </div>

        <div
          v-else
          class="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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
          class="mt-10 flex justify-center"
        >
          <UButton
            color="neutral"
            variant="outline"
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
        <span class="font-bold text-gray-900 dark:text-white">
          {{ t('catalog.categoriesTitle') }}
        </span>
      </template>

      <template #body>
        <div class="space-y-1.5 pr-1 py-2 overflow-y-auto max-h-[80vh]">
          <div
            v-for="pill in categoryPills"
            :key="pill.slug"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            :class="selectedCategory === pill.slug ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'"
            @click="selectCategory(pill.slug); isMobileDrawerOpen = false"
          >
            <UIcon :name="pill.icon" class="w-5 h-5" />
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
import { apiProductToViewModel, shouldShowInCatalog } from '@fsd/shared/lib/mapApiProduct'
import { buildCategoryTree, type CategoryTreeNode } from '@fsd/shared/lib/buildCategoryTree'

const props = defineProps<{
  searchQuery: string
}>()

const { t } = useI18n()
const api = useMarketplaceApi()

const allCategories = ref<ApiCategory[]>([])
const categoryTree = ref<CategoryTreeNode[]>([])
const expandedCategoryIds = ref<Set<number>>(new Set())
const isMobileDrawerOpen = ref(false)

const categoryPills = [
  { slug: 'all', name: 'Все товары', icon: 'i-lucide-grid' },
  { slug: 'terapiya', name: 'Терапия', icon: 'i-lucide-stethoscope' },
  { slug: 'endodontiya', name: 'Эндодонтия', icon: 'i-lucide-activity' },
  { slug: 'ortopediya', name: 'Ортопедия', icon: 'i-lucide-smile' },
  { slug: 'oborudovanie', name: 'Оборудование', icon: 'i-lucide-zap' },
  { slug: 'khirurgiya', name: 'Хирургия', icon: 'i-lucide-scissors' },
  { slug: 'rashodniki', name: 'Расходники', icon: 'i-lucide-package' }
]

const isProductModalOpen = ref(false)
const selectedProductForModal = ref<ProductViewModel | null>(null)

const catalogReady = ref(false)
const loadState = ref<'idle' | 'loading' | 'error'>('idle')
const loadMoreState = ref<'idle' | 'loading'>('idle')

const selectedCategory = ref<'all' | string>('all')
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
  return totalCount.value
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
    )
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
  isMobileDrawerOpen.value = false

  if (slug === 'all') return

  // Auto-expand parents
  const selectedNode = allCategories.value.find(c => c.slug === slug)
  if (selectedNode) {
    let pId = selectedNode.parent
    while (pId !== null) {
      expandedCategoryIds.value.add(pId)
      const pNode = allCategories.value.find(c => c.id === pId)
      pId = pNode ? pNode.parent : null
    }
  }
}

function toggleCategoryExpand(id: number) {
  const next = new Set(expandedCategoryIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedCategoryIds.value = next
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
