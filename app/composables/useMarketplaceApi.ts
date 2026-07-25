import type { ApiCategory, ApiProductDetailed, Paginated, ApiCompactCategoryResponse } from '@fsd/shared/api/types'

// Fallback products have been removed as per the plan

export function useMarketplaceApi() {
  const config = useRuntimeConfig()
  const { locale } = useI18n()

  const versionPath = `/api/${config.public.apiVersion}`
  const baseURL = versionPath
  // Token is now dynamically fetched via useCookie in headers()

  function headers(): Record<string, string> {
    const h: Record<string, string> = {
      Accept: 'application/json'
    }
    const lang = locale.value === 'kk' ? 'kk' : locale.value === 'en' ? 'en' : 'ru'
    h['Accept-Language'] = `${lang}, ru;q=0.9, en;q=0.8`
    const authCookie = useCookie('pazl_token')
    if (authCookie.value) {
      h.Authorization = `Bearer ${authCookie.value}`
    }
    return h
  }

  async function fetchRootCategories(): Promise<ApiCategory[]> {
    try {
      const res = await $fetch<Paginated<ApiCategory>>('categories/root/', {
        baseURL,
        headers: headers(),
        retry: 1
      })
      return (res.results ?? []).filter(c => !c.hidden)
    } catch (e) {
      console.warn('API error fetching root categories', e)
      return []
    }
  }

  async function fetchCompactCategories(): Promise<ApiCompactCategoryResponse> {
    try {
      return await $fetch<ApiCompactCategoryResponse>('categories/compact/', {
        baseURL,
        headers: headers(),
        retry: 1
      })
    } catch (e) {
      return { fields: [], result: [] }
    }
  }

  async function fetchAllCategories(): Promise<ApiCategory[]> {
    try {
      const list: ApiCategory[] = []
      let page = 1
      let hasMore = true
      while (hasMore) {
        const query = page > 1 ? { page } : {}
        const res = await $fetch<Paginated<ApiCategory>>('categories/', {
          baseURL,
          headers: headers(),
          query,
          retry: 1
        })
        list.push(...(res.results ?? []))
        page++
        hasMore = !!res.next
      }
      return list.filter(c => !c.hidden)
    } catch (e) {
      console.warn('API error fetching all categories', e)
      return []
    }
  }

  async function fetchCategoryProductsDetailed(params: {
    categoryKey: string
    page: number
    pageSize: number
    search: string
  }): Promise<Paginated<ApiProductDetailed>> {
    const search = params.search.trim()
    try {
      return await $fetch<Paginated<ApiProductDetailed>>(
        `categories/${encodeURIComponent(params.categoryKey)}/products_detailed/`,
        {
          baseURL,
          headers: headers(),
          query: {
            page: params.page,
            page_size: params.pageSize,
            ...(search ? { search } : {})
          },
          retry: 1
        }
      )
    } catch (e) {
      console.warn('API error fetching category products', e)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  async function fetchProductsDetailed(params: {
    page: number
    pageSize: number
    search: string
  }): Promise<Paginated<ApiProductDetailed>> {
    const search = params.search.trim()
    try {
      return await $fetch<Paginated<ApiProductDetailed>>(
        `products_detailed/`,
        {
          baseURL,
          headers: headers(),
          query: {
            page: params.page,
            page_size: params.pageSize,
            ...(search ? { search } : {})
          },
          retry: 1
        }
      )
    } catch (e) {
      console.warn('API error fetching products', e)
      return { count: 0, next: null, previous: null, results: [] }
    }
  }

  return {
    fetchRootCategories,
    fetchCompactCategories,
    fetchAllCategories,
    fetchCategoryProductsDetailed,
    fetchProductsDetailed
  }
}
