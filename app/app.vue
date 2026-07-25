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
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [{ rel: 'icon', href: '/favicon.ico' }]
}))
</script>

<style scoped lang="scss">
</style>
