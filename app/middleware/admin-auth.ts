import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const localePath = useLocalePath()

  // Automatically reads from SSR headers or client cookies
  authStore.initFromCookie()

  // If not authenticated and trying to access /admin or /operator, redirect to login
  if (!authStore.isAuthenticated && (to.path.includes('/admin') || to.path.includes('/operator'))) {
    if (to.path !== '/admin/login') {
      return navigateTo(localePath('/admin/login'))
    }
  }

  // Protect admin-only routes from operators
  if (authStore.isOperator) {
    if (to.path.includes('/admin') && to.path !== '/admin/login') {
      return navigateTo(localePath('/operator'))
    }
  }

  // Optionally, if admin goes to operator dashboard, they can be allowed or redirected.
  // We'll allow admins to see everything.
})
