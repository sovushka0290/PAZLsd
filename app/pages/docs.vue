<template>
  <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      
      <!-- Header -->
      <div class="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
        
        <NuxtLink :to="localePath('/')" class="inline-flex items-center text-slate-300 hover:text-white transition-colors text-sm font-semibold mb-6">
          ← Вернуться в магазин
        </NuxtLink>
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">Техническая документация PAZL</h1>
        <p class="text-slate-400 text-lg">Архитектура, API, Роли, Маршруты и Сервисы</p>
      </div>

      <!-- Content -->
      <div class="p-8 sm:p-12 space-y-12">
        
        <!-- Section 1 -->
        <section>
          <div class="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
            <span class="text-3xl">🏗️</span>
            <h2 class="text-2xl font-bold text-slate-900">1. Архитектура проекта</h2>
          </div>
          <div class="prose prose-slate max-w-none text-slate-600 space-y-4">
            <p>
              Платформа <strong>PAZL</strong> состоит из двух основных частей:
            </p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Frontend (pazl-web):</strong> Написан на Vue 3 + Nuxt 3 с использованием Composition API и TypeScript. В режиме демонстрации на Vercel работает как SPA (ssr: false).</li>
              <li><strong>Backend (pazl / Agora):</strong> Написан на Python / Django REST Framework. Отвечает за хранение реальных данных, интеграцию со складами 1С и управление бизнесом.</li>
              <li><strong>Mock Server (Serverless Nitro):</strong> Специально для демо-режима на Vercel включена настройка <code>apiSnapshot</code>, которая поднимает легковесный API-сервер прямо внутри Nuxt, отдающий статические JSON-заглушки (scraped_products.json) вместо реальной базы.</li>
            </ul>
          </div>
        </section>

        <!-- Section 2 -->
        <section>
          <div class="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
            <span class="text-3xl">👥</span>
            <h2 class="text-2xl font-bold text-slate-900">2. Роли и уровни доступа</h2>
          </div>
          <div class="grid sm:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 class="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
                <span>🛒</span> Покупатель (Клиника)
              </h3>
              <p class="text-sm text-blue-800">
                Может просматривать общий каталог, добавлять товары в корзину, оформлять заказы.
                В личном кабинете видит историю своих покупок, долги и накладные.
              </p>
            </div>
            
            <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h3 class="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-2">
                <span>🏭</span> Поставщик
              </h3>
              <p class="text-sm text-indigo-800">
                Может загружать свои товары (прайс-листы), управлять остатками на складах.
                В кабинете видит только <strong>входящие заказы</strong> от клиник на свои товары и может менять их статус на "Отгружено".
              </p>
            </div>

            <div class="bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <h3 class="text-lg font-bold text-amber-900 flex items-center gap-2 mb-2">
                <span>🎧</span> Оператор (Менеджер)
              </h3>
              <p class="text-sm text-amber-800">
                Обрабатывает новые заказы, проверяет оплату, консультирует клиентов.
                Видит все заказы в системе, но не имеет доступа к настройкам системы.
              </p>
            </div>

            <div class="bg-rose-50 p-6 rounded-2xl border border-rose-100">
              <h3 class="text-lg font-bold text-rose-900 flex items-center gap-2 mb-2">
                <span>👑</span> Администратор
              </h3>
              <p class="text-sm text-rose-800">
                Полный контроль. Управляет пользователями, модерацией новых поставщиков, 
                интеграциями, наценками платформы и финансовыми отчетами.
              </p>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section>
          <div class="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
            <span class="text-3xl">🛣️</span>
            <h2 class="text-2xl font-bold text-slate-900">3. Структура Роутера (Nuxt Pages)</h2>
          </div>
          <div class="overflow-hidden rounded-xl border border-slate-200">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-slate-700">
                <tr>
                  <th class="px-6 py-4 font-bold">Маршрут (URL)</th>
                  <th class="px-6 py-4 font-bold">Описание</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr>
                  <td class="px-6 py-4 font-mono text-blue-600 bg-white">/</td>
                  <td class="px-6 py-4 bg-white text-slate-600">Главная страница, категории товаров, слайдеры.</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 font-mono text-blue-600 bg-slate-50/50">/catalog</td>
                  <td class="px-6 py-4 bg-slate-50/50 text-slate-600">Общий каталог товаров с фильтрами, пагинацией.</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 font-mono text-blue-600 bg-white">/login & /admin/login</td>
                  <td class="px-6 py-4 bg-white text-slate-600">Авторизация для клиентов/поставщиков и для админов/операторов.</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 font-mono text-blue-600 bg-slate-50/50">/cabinet/...</td>
                  <td class="px-6 py-4 bg-slate-50/50 text-slate-600">Личный кабинет Покупателя (Заказы, Настройки, Долги). Защищен middleware.</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 font-mono text-blue-600 bg-white">/supplier/...</td>
                  <td class="px-6 py-4 bg-white text-slate-600">Кабинет Поставщика. Управление товарами и входящими заказами.</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 font-mono text-blue-600 bg-slate-50/50">/operator/...</td>
                  <td class="px-6 py-4 bg-slate-50/50 text-slate-600">Панель оператора (CRM). Просмотр всех заказов платформы.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Section 4 -->
        <section>
          <div class="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
            <span class="text-3xl">🔌</span>
            <h2 class="text-2xl font-bold text-slate-900">4. API и Composables (Сервисы)</h2>
          </div>
          <div class="space-y-6">
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 class="text-lg font-bold text-slate-900 mb-2">Хранилище Состояний (Pinia Stores)</h3>
              <p class="text-sm text-slate-600 mb-4">
                Используется <code>Pinia</code> для управления глобальным состоянием:
                <br><code>useAuthStore</code> — хранение JWT токенов, роли пользователя, логика логина/выхода.
                <br><code>useCartStore</code> — хранение корзины покупок (синхронизируется с localStorage).
              </p>
            </div>

            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 class="text-lg font-bold text-slate-900 mb-2">Composables для работы с API</h3>
              <p class="text-sm text-slate-600 mb-3">
                Все запросы инкапсулированы в модульные composable функции. Они подставляют Bearer токены и обрабатывают ошибки.
              </p>
              <ul class="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li><code>useCabinetApi()</code> — Запросы для покупателя (fetchMyOrders, fetchMyContractor).</li>
                <li><code>useSupplierApi()</code> — Запросы для поставщика (fetchSupplierOrders, fetchSupplierProducts).</li>
                <li><code>useOperatorApi()</code> — Запросы для оператора (fetchAllOrders, updateOrderStatus).</li>
              </ul>
            </div>
            
            <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
              <h3 class="text-lg font-bold text-emerald-900 mb-2">Специально для Демо (Vercel)</h3>
              <p class="text-sm text-emerald-800">
                Так как Vercel функции работают без сохранения состояния (Stateless), мы реализовали 
                умный перехват созданных заказов. При оформлении заказа в <code>/checkout</code>, заказ сохраняется в 
                <code>localStorage</code> браузера. При переходе в панели Поставщика или Покупателя, 
                моковые запросы API объединяются с данными из localStorage, создавая иллюзию работы 
                реальной базы данных между вкладками браузера.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: 'Техническая документация | PAZL',
})
</script>
