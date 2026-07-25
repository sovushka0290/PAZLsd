<template>
  <footer class="marketplace-footer mt-16 border-t border-slate-200 bg-white text-slate-600">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <h4 class="mb-4 font-bold text-slate-900">
            {{ t('footer.aboutTitle') }}
          </h4>
          <p class="text-sm leading-relaxed text-slate-500">
            {{ t('footer.aboutText') }}
          </p>
        </div>
        <div>
          <h4 class="mb-4 font-bold text-slate-900">
            {{ t('footer.contactsTitle') }}
          </h4>
          <div class="space-y-2 text-sm text-slate-500">
            <p>{{ t('footer.phoneLabel') }} {{ t('header.phone') }}</p>
            <p>{{ t('footer.emailLabel') }} {{ t('header.email') }}</p>
            <p>{{ t('footer.hours') }}</p>
          </div>
        </div>
        <div>
          <h4 class="mb-4 font-bold text-slate-900">
            {{ t('footer.infoTitle') }}
          </h4>
          <div class="space-y-2 text-sm text-slate-500">
            <p>{{ t('footer.aboutCompany') }}</p>
            <p>{{ t('footer.delivery') }}</p>
            <p>{{ t('footer.warranty') }}</p>
          </div>
        </div>
      </div>
      <div class="mt-8 border-t border-slate-100 pt-8 text-center text-sm flex justify-center items-center gap-2 text-slate-400">
        <p>{{ t('footer.copyright', { year: currentYear }) }}</p>
        <NuxtLink :to="localePath('/admin/login')" class="opacity-0 hover:opacity-10 cursor-pointer text-[10px] text-slate-400">oper</NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const currentYear = new Date().getFullYear()
</script>

<style scoped lang="scss">
.marketplace-footer {
  width: 100%;
}
</style>
