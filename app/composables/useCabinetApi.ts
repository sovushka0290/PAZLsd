/**
 * API composable for the Buyer cabinet.
 * Provides typed fetch helpers for orders, contractor profile,
 * company data, and debts — all scoped to the logged-in user.
 */

export interface BuyerOrder {
  id: number
  number: string
  created_at: string
  updated_at: string
  status: string
  status_display: string
  total: number | string
  items_count: number
  supplier_name?: string
  items?: BuyerOrderItem[]
}

export interface BuyerOrderItem {
  id: number
  product_name: string
  sku?: string
  quantity: number
  price: number | string
  total: number | string
  image?: string
}

export interface ContractorInfo {
  id: number
  name: string
  bin_iin?: string
  address?: string
  is_verified: boolean
  is_retail: boolean
  loyalty_amount?: number | string
  company?: {
    id: number
    name: string
    bin_or_iin: string
    legal_address: string
    actual_address?: string
    bank_name?: string
    bank_account?: string
    bik?: string
  }
}

export interface ContractorProfile {
  id: number
  contact_person?: string
  phone?: string
  email?: string
  address?: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export function useCabinetApi() {
  const config = useRuntimeConfig()
  const versionPath = `/api/${config.public.apiVersion}`
  const baseURL = import.meta.env.SSR
    ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}${versionPath}`
    : versionPath

  function headers(): Record<string, string> {
    const h: Record<string, string> = { Accept: 'application/json' }
    const authCookie = useCookie('pazl_token')
    if (authCookie.value) {
      h.Authorization = `Bearer ${authCookie.value}`
    }
    return h
  }

  // ── Orders ──────────────────────────────────────────────

  async function fetchMyOrders(params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
  }): Promise<Paginated<BuyerOrder>> {
    try {
      return await $fetch<Paginated<BuyerOrder>>('orders/', {
        baseURL,
        headers: headers(),
        query: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.search ? { search: params.search } : {})
        },
        retry: 1
      })
    } catch (e) {
      console.warn('[useCabinetApi] fetchMyOrders error', e)
      return { count: 0, next: null, previous: null, results: [] }
    }
  }

  async function fetchOrderById(id: number | string): Promise<BuyerOrder | null> {
    try {
      return await $fetch<BuyerOrder>(`orders/${id}/`, {
        baseURL,
        headers: headers(),
        retry: 1
      })
    } catch (e) {
      console.warn('[useCabinetApi] fetchOrderById error', e)
      return null
    }
  }

  // ── Contractor (Company) ────────────────────────────────

  async function fetchMyContractor(): Promise<ContractorInfo | null> {
    try {
      return await $fetch<ContractorInfo>('my_contractor/me/', {
        baseURL,
        headers: headers(),
        retry: 1
      })
    } catch (e) {
      console.warn('[useCabinetApi] fetchMyContractor error', e)
      return null
    }
  }

  async function fetchContractorProfile(): Promise<ContractorProfile | null> {
    try {
      return await $fetch<ContractorProfile>('contractor_profile/me/', {
        baseURL,
        headers: headers(),
        retry: 1
      })
    } catch (e) {
      console.warn('[useCabinetApi] fetchContractorProfile error', e)
      return null
    }
  }

  async function updateContractorProfile(data: Partial<ContractorProfile>): Promise<ContractorProfile | null> {
    try {
      return await $fetch<ContractorProfile>('contractor_profile/me/', {
        baseURL,
        headers: headers(),
        method: 'PATCH',
        body: data,
        retry: 0
      })
    } catch (e) {
      console.warn('[useCabinetApi] updateContractorProfile error', e)
      return null
    }
  }

  // ── Dashboard stats ─────────────────────────────────────

  async function fetchDashboardStats(): Promise<{
    active_orders: number
    completed_orders: number
    total_spent: number | string
  }> {
    // Try to get stats from a dedicated endpoint, fallback to
    // deriving from orders list if endpoint doesn't exist
    try {
      const [activeRes, completedRes] = await Promise.all([
        $fetch<Paginated<BuyerOrder>>('orders/', {
          baseURL,
          headers: headers(),
          query: { page_size: 1, status: 'active' },
          retry: 1
        }).catch(() => ({ count: 0, results: [] })),
        $fetch<Paginated<BuyerOrder>>('orders/', {
          baseURL,
          headers: headers(),
          query: { page_size: 1, status: 'completed' },
          retry: 1
        }).catch(() => ({ count: 0, results: [] }))
      ])
      return {
        active_orders: (activeRes as Paginated<BuyerOrder>).count,
        completed_orders: (completedRes as Paginated<BuyerOrder>).count,
        total_spent: 0
      }
    } catch {
      return { active_orders: 0, completed_orders: 0, total_spent: 0 }
    }
  }

  return {
    fetchMyOrders,
    fetchOrderById,
    fetchMyContractor,
    fetchContractorProfile,
    updateContractorProfile,
    fetchDashboardStats
  }
}
