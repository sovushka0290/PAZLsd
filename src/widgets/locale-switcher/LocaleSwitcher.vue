<template>
  <div class="locale-switcher flex items-center gap-1">
    <span class="sr-only">{{ t('language.label') }}</span>
    <UButton
      v-for="option in localeButtons"
      :key="option.code"
      :to="(switchLocalePath as any)(option.code)"
      size="xs"
      :variant="option.code === locale ? 'solid' : 'ghost'"
      color="neutral"
      class="min-w-0 px-2 font-medium uppercase"
    >
      {{ option.shortLabel }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const localeButtons = computed(() => [
  { code: 'kk' as const, shortLabel: 'KK' },
  { code: 'ru' as const, shortLabel: 'RU' },
  { code: 'en' as const, shortLabel: 'EN' }
])
</script>

<style scoped lang="scss">
.locale-switcher {
  flex-shrink: 0;
}
</style>
