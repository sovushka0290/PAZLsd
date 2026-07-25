/**
 * API composable for the Supplier cabinet.
 * Provides typed fetch helpers for incoming orders, products,
 * supplier profile, warehouses, and dashboard KPIs.
 */

import type { Paginated } from './useCabinetApi'

export interface SupplierOrder {
  id: number
  number: string
  created_at: string
  updated_at: string
  status: string
  status_display: string
  total: number | string
  items_count: number
  buyer_name?: string
  buyer_phone?: string
  items?: SupplierOrderItem[]
}

export interface SupplierOrderItem {
  id: number
  product_name: string
  sku?: string
  quantity: number
  price: number | string
  total: number | string
}

export interface SupplierProduct {
  id: number
  name: string
  sku: string
  price: number | string
  stock: number
  is_active: boolean
  category_name?: string
  image?: string
  updated_at?: string
}

export interface SupplierProfileInfo {
  id: number
  name: string
  company_name?: string
  bin_iin?: string
  phone?: string
  email?: string
  address?: string
  status: string
  status_display?: string
  integration_type?: string
  trade_categories?: string[]
}

export interface Warehouse {
  id: number
  name: string
  address: string
  is_default: boolean
}



export function useSupplierApi() {
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

  async function fetchSupplierOrders(params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
  }): Promise<Paginated<SupplierOrder>> {
    try {
      return await $fetch<Paginated<SupplierOrder>>('orders/', {
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
      console.warn('[useSupplierApi] fetchSupplierOrders error', e)
      return { count: 0, next: null, previous: null, results: [] }
    }
  }

  async function fetchOrderById(id: number | string): Promise<SupplierOrder | null> {
    try {
      return await $fetch<SupplierOrder>(`orders/${id}/`, {
        baseURL,
        headers: headers(),
        retry: 1
      })
    } catch (e) {
      console.warn('[useSupplierApi] fetchOrderById error', e)
      return null
    }
  }

  async function updateOrderStatus(id: number | string, status: string): Promise<boolean> {
    try {
      await $fetch(`orders/${id}/`, {
        baseURL,
        headers: headers(),
        method: 'PATCH',
        body: { status },
        retry: 0
      })
      return true
    } catch (e) {
      console.warn('[useSupplierApi] updateOrderStatus error', e)
      return false
    }
  }

  // ── Products ────────────────────────────────────────────

  async function fetchSupplierProducts(params?: {
    page?: number
    page_size?: number
    search?: string
    is_active?: boolean
  }): Promise<Paginated<SupplierProduct>> {
    try {
      return await $fetch<Paginated<SupplierProduct>>('my_products/', {
        baseURL,
        headers: headers(),
        query: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.is_active !== undefined ? { is_active: params.is_active } : {})
        },
        retry: 1
      })
    } catch (e) {
      console.warn('[useSupplierApi] fetchSupplierProducts error', e)
      return { count: 0, next: null, previous: null, results: [] }
    }
  }

  // ── Profile ─────────────────────────────────────────────

  async function fetchSupplierProfile(): Promise<SupplierProfileInfo | null> {
    try {
      return await $fetch<SupplierProfileInfo>('account/supplier/me/', {
        baseURL,
        headers: headers(),
        retry: 1
      })
    } catch (e) {
      console.warn('[useSupplierApi] fetchSupplierProfile error', e)
      return null
    }
  }

  async function updateSupplierProfile(data: Partial<SupplierProfileInfo>): Promise<SupplierProfileInfo | null> {
    try {
      return await $fetch<SupplierProfileInfo>('account/supplier/me/', {
        baseURL,
        headers: headers(),
        method: 'PATCH',
        body: data,
        retry: 0
      })
    } catch (e) {
      console.warn('[useSupplierApi] updateSupplierProfile error', e)
      return null
    }
  }

  // ── Warehouses ──────────────────────────────────────────

  async function fetchWarehouses(): Promise<Warehouse[]> {
    try {
      const res = await $fetch<Paginated<Warehouse> | Warehouse[]>('supplier_warehouse/', {
        baseURL,
        headers: headers(),
        retry: 1
      })
      return Array.isArray(res) ? res : (res as Paginated<Warehouse>).results ?? []
    } catch (e) {
      console.warn('[useSupplierApi] fetchWarehouses error', e)
      return []
    }
  }

  // ── Dashboard KPIs ──────────────────────────────────────

  async function fetchDashboardKPIs(): Promise<{
    new_orders: number
    total_products: number
    total_sales: number | string
    rating: number
  }> {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        $fetch<Paginated<SupplierOrder>>('orders/', {
          baseURL,
          headers: headers(),
          query: { page_size: 1 },
          retry: 1
        }).catch(() => ({ count: 0, results: [] })),
        $fetch<Paginated<SupplierProduct>>('my_products/', {
          baseURL,
          headers: headers(),
          query: { page_size: 1 },
          retry: 1
        }).catch(() => ({ count: 0, results: [] }))
      ])
      return {
        new_orders: (ordersRes as Paginated<SupplierOrder>).count,
        total_products: (productsRes as Paginated<SupplierProduct>).count,
        total_sales: 0,
        rating: 5.0
      }
    } catch {
      return { new_orders: 0, total_products: 0, total_sales: 0, rating: 5.0 }
    }
  }

  return {
    fetchSupplierOrders,
    fetchOrderById,
    updateOrderStatus,
    fetchSupplierProducts,
    fetchSupplierProfile,
    updateSupplierProfile,
    fetchWarehouses,
    fetchDashboardKPIs
  }
}
