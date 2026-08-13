<template>
  <UApp>
    <NuxtPage />
    <div class="fixed bottom-4 right-4 z-50 flex items-center gap-4">
      <UButton to="/feedback" color="gray" variant="ghost" size="sm" class="opacity-50 hover:opacity-100">
        Обратная связь
      </UButton>
      <UButton to="/admin/login" color="gray" variant="ghost" size="sm" class="opacity-50 hover:opacity-100">
        Админ
      </UButton>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const { locale } = useI18n()

useHead(() => ({
  htmlAttrs: {
    lang: locale.value
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#0066CC' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', href: '/favicon.ico' } // Fallback if you eventually add a .ico
  ]
}))
</script>

<style scoped lang="scss">
</style>
