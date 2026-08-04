import { defineStore } from 'pinia'

export interface AuthUser {
  id: number | string
  phone: string
  first_name: string
  last_name: string
  email: string
  role: 'buyer' | 'supplier' | 'admin' | 'operator'
  phone_confirmed: boolean
  company_name?: string
  company_bin?: string
  current_contractor_id?: number | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    refreshToken: null as string | null,
    user: null as AuthUser | null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isOperator: (state) => state.user?.role === 'operator',
    isBuyer: (state) => state.user?.role === 'buyer',
    isSupplier: (state) => state.user?.role === 'supplier'
  },
  actions: {
    async loginByPhone(phone: string, password: string) {
      const config = useRuntimeConfig()
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}`
        : ''

      const data = await $fetch<{ access: string; refresh: string; user: AuthUser }>(
        `${baseURL}/api/v2/auth/phone-login/`,
        {
          method: 'POST',
          body: { phone, password }
        }
      )

      this.token = data.access
      this.refreshToken = data.refresh
      this.user = data.user

      this._saveToCookies()
    },

    async register(phone: string, password: string, firstName: string) {
      const config = useRuntimeConfig()
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}`
        : ''

      const data = await $fetch<{ access: string; refresh: string; user: AuthUser }>(
        `${baseURL}/api/v2/auth/register/`,
        {
          method: 'POST',
          body: { phone, password, first_name: firstName }
        }
      )

      this.token = data.access
      this.refreshToken = data.refresh
      this.user = data.user

      this._saveToCookies()
    },

    async registerSupplier(phone: string, password: string, companyName: string, bin: string, documentFile?: string) {
      const config = useRuntimeConfig()
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}`
        : ''

      const data = await $fetch<{ access: string; refresh: string; user: AuthUser }>(
        `${baseURL}/api/v2/auth/register-supplier/`,
        {
          method: 'POST',
          body: { phone, password, company_name: companyName, bin, document_file: documentFile || 'Справка_госрегистрация.pdf' }
        }
      )

      this.token = data.access
      this.refreshToken = data.refresh
      this.user = data.user

      this._saveToCookies()
    },

    async fetchMe() {
      if (!this.token) return

      const config = useRuntimeConfig()
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}`
        : ''

      try {
        const data = await $fetch<{ user: AuthUser }>(
          `${baseURL}/api/v2/auth/me/`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
        this.user = data.user
        this._saveToCookies()
      } catch (err: any) {
        if (err?.status === 401 || err?.statusCode === 401) {
          await this.refreshAccessToken()
        }
      }
    },

    async updateProfile(fields: { first_name?: string; last_name?: string; email?: string }) {
      if (!this.token) return

      const config = useRuntimeConfig()
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}`
        : ''

      const data = await $fetch<{ user: AuthUser }>(
        `${baseURL}/api/v2/auth/me/`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${this.token}` },
          body: fields
        }
      )
      this.user = data.user
      this._saveToCookies()
    },

    async refreshAccessToken() {
      if (!this.refreshToken || (this as any)._isRefreshing) {
        this.logout()
        return
      }

      ;(this as any)._isRefreshing = true

      const config = useRuntimeConfig()
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}`
        : ''

      try {
        const data = await $fetch<{ access: string; refresh?: string }>(
          `${baseURL}/api/v2/auth/token/refresh/`,
          {
            method: 'POST',
            body: { refresh: this.refreshToken }
          }
        )
        this.token = data.access
        if (data.refresh) this.refreshToken = data.refresh
        this._saveToCookies()
      } catch {
        this.logout()
      } finally {
        ;(this as any)._isRefreshing = false
      }
    },

    async sendSmsCode(phone: string) {
      const config = useRuntimeConfig()
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}`
        : ''

      return await $fetch<{ detail: string; expires_in: number }>(
        `${baseURL}/api/v2/auth/send-sms-code/`,
        {
          method: 'POST',
          body: { phone }
        }
      )
    },

    async verifySmsCode(phone: string, code: string) {
      const config = useRuntimeConfig()
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}`
        : ''

      const data = await $fetch<{ detail: string; verified: boolean }>(
        `${baseURL}/api/v2/auth/verify-sms/`,
        {
          method: 'POST',
          body: { phone, code }
        }
      )

      if (data.verified && this.user) {
        this.user.phone_confirmed = true
        this._saveToCookies()
      }

      return data
    },

    // Legacy login for admin panel (kept for backward compat)
    async login(username: string, password: string) {
      if ((username === 'dentolog0290' && password === '81726354') || (username === 'admin' && password === '123')) {
        this.token = 'mock_admin_token'
        this.refreshToken = 'mock_admin_refresh'
        this.user = {
          id: 1,
          phone: '',
          first_name: 'Admin',
          last_name: '',
          email: '',
          role: 'admin',
          phone_confirmed: true
        }
      } else if (username === 'operator' || username.startsWith('oper')) {
        this.token = 'mock_operator_token'
        this.refreshToken = 'mock_operator_refresh'
        this.user = {
          id: 2,
          phone: '',
          first_name: 'Operator',
          last_name: '',
          email: '',
          role: 'operator',
          phone_confirmed: true
        }
      } else {
        throw new Error('Неверный логин или пароль')
      }
      this._saveToCookies()
    },

    async changePassword(currentPassword: string, newPassword: string) {
      if (!this.token) throw new Error('Not authenticated')

      const config = useRuntimeConfig()
      const baseURL = import.meta.env.SSR
        ? `${String(config.apiBackendUrl ?? 'http://backend:8000').replace(/\/$/, '')}`
        : ''

      await $fetch(
        `${baseURL}/api/v2/account/set_password/`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` },
          body: { current_password: currentPassword, new_password: newPassword }
        }
      )
    },

    logout() {
      this.token = null
      this.refreshToken = null
      this.user = null

      const tokenCookie = useCookie('pazl_token')
      const refreshCookie = useCookie('pazl_refresh')
      const userCookie = useCookie('pazl_user')

      tokenCookie.value = null
      refreshCookie.value = null
      userCookie.value = null
    },

    initFromCookie() {
      const tokenCookie = useCookie('pazl_token')
      const refreshCookie = useCookie('pazl_refresh')
      const userCookie = useCookie('pazl_user')

      if (tokenCookie.value && userCookie.value) {
        this.token = tokenCookie.value as string
        this.refreshToken = refreshCookie.value as string
        try {
          this.user = typeof userCookie.value === 'string' ? JSON.parse(userCookie.value) : userCookie.value
        } catch {
          this.user = null
          this.token = null
        }
      }
    },

    _saveToCookies() {
      const opts = { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' as const, path: '/' }
      const tokenCookie = useCookie('pazl_token', opts)
      const refreshCookie = useCookie('pazl_refresh', opts)
      const userCookie = useCookie('pazl_user', opts)

      tokenCookie.value = this.token
      refreshCookie.value = this.refreshToken
      userCookie.value = JSON.stringify(this.user)
    }
  }
})
