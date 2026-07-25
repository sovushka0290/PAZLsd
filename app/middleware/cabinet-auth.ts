export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/login'))
  }

  // Prevent buyers from accessing supplier dashboard and vice versa
  if (to.path.includes('/supplier') && !authStore.isSupplier && !authStore.isAdmin) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/cabinet'))
  }

  if (to.path.includes('/cabinet') && authStore.isSupplier && !authStore.isAdmin) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/supplier'))
  }
})
