<template>
  <div class="min-h-screen bg-slate-50/70 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center shadow-xl border border-slate-200/80">
      <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-emerald-100 text-emerald-600 mb-6 shadow-sm">
        <UIcon name="i-lucide-check-circle-2" class="h-12 w-12 text-emerald-600" />
      </div>
      
      <span class="inline-block px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-full uppercase tracking-wider mb-3">
        Заказ принят #{{ Math.floor(1000 + Math.random() * 9000) }}
      </span>

      <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
        Заказ успешно создан!
      </h2>
      
      <p class="text-sm text-slate-600 mb-8 leading-relaxed">
        Данные вашего заказа мгновенно переданы в панель операторам. Наш дежурный оператор свяжется с вами в течение 5 минут по указанным контактам.
      </p>

      <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 text-left space-y-2">
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <UIcon name="i-lucide-phone-call" class="w-4 h-4 text-blue-600" />
          <span>Горячая линия: 8 (707) 712-01-90</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <UIcon name="i-lucide-clock" class="w-4 h-4 text-blue-600" />
          <span>Обработка заказов с 09:00 до 19:00</span>
        </div>
      </div>

      <NuxtLink
        :to="localePath('/')"
        class="block w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all text-center"
      >
        Вернуться в каталог товаров
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

useSeoMeta({
  title: 'Заказ успешно оформлен',
})
</script>
