<template>
  <div class="min-h-screen">
    <MarketplaceHeader v-model="searchQuery" />
    <MarketplaceCatalog :search-query="searchQuery" />
    <MarketplaceFooter />
    <FloatingCart />
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('')
const { t } = useI18n()

useSeoMeta({
  title: () => t('meta.homeTitle'),
  ogTitle: () => t('meta.homeTitle')
})
</script>

<style scoped lang="scss">
</style>
