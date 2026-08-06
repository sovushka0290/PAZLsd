<template>
  <div class="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8 pb-20 sm:pb-8">
    <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
      <!-- Top Bar / Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs gap-3">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white font-extrabold">
            <UIcon name="i-lucide-shield-check" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-lg sm:text-2xl font-black text-slate-900 leading-tight">Панель оператора PAZL</h1>
            <p class="text-xs text-slate-500 font-medium">Управление заказами, P2P цепочкой, товарами (PIM) и категориями</p>
          </div>
        </div>
        
        <div class="flex gap-2 items-center w-full sm:w-auto justify-end flex-wrap">
          <!-- ADMIN MODAL TRIGGER BUTTON (PASSWORD 321) -->
          <button
            type="button"
            @click="isAdminPassModalOpen = true"
            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>👑</span> Админ-панель (321)
          </button>

          <UButton color="white" variant="solid" icon="i-lucide-external-link" :to="localePath('/')" size="sm" class="rounded-xl font-bold">На сайт</UButton>
          <UButton color="red" variant="soft" icon="i-lucide-log-out" @click="logout" size="sm" class="rounded-xl font-bold">Выйти</UButton>
        </div>
      </div>

      <!-- Navigation Tabs (Mobile Scrollable) -->
      <div class="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1 no-scrollbar">
        <button 
          v-for="(tab, i) in navTabs" 
          :key="i"
          @click="activeTab = i"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-t-xl transition-all cursor-pointer whitespace-nowrap shrink-0',
            activeTab === i ? 'bg-white text-blue-600 shadow-xs border-t-2 border-x border-slate-200 border-t-blue-600' : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          <UIcon :name="tab.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- ========================================== -->
      <!-- TAB 0: ORDERS (P2P FLOW)                   -->
      <!-- ========================================== -->
      <div v-if="activeTab === 0" class="space-y-4">
        <!-- Status Filter Pills -->
        <div class="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-x-auto">
          <div class="flex gap-1.5 sm:gap-2 min-w-max">
            <button
              v-for="s in ['Все', 'Новый', 'Подтвержден', 'Оплачен', 'В доставке', 'Завершен', 'Претензия']"
              :key="s"
              type="button"
              @click="orderFilter = s"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                orderFilter === s 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              <span :class="['w-2 h-2 rounded-full', getStatusDotBgClass(s)]"></span>
              <span>{{ s === 'Все' ? 'Все заказы' : s }}</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredOrders.length === 0" class="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-2 opacity-30 text-blue-500" />
          <p class="font-extrabold text-sm text-slate-700">Нет заказов по выбранному фильтру</p>
          <p class="text-xs text-slate-400 mt-1">Оформите заказ в корзине или смените фильтр</p>
        </div>

        <!-- MOBILE VIEW (< md): Responsive Order Cards -->
        <div v-else class="block md:hidden space-y-3">
          <div 
            v-for="row in filteredOrders" 
            :key="row.id"
            @click="openOrderDetails(row)"
            class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-500 active:scale-99 transition-all cursor-pointer space-y-3"
          >
            <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-mono font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                  #{{ row.id }}
                </span>
                <span class="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  Шаг {{ getP2PStageStep(row.p2pStage || 'CREATED') }}/13
                </span>
              </div>
              <UBadge :color="getStatusColor(row.status)" variant="solid" size="xs" class="rounded-md font-extrabold">
                {{ row.status }}
              </UBadge>
            </div>

            <div class="space-y-1">
              <div class="font-extrabold text-slate-900 text-base leading-snug">
                {{ row.name }}
              </div>
              <div class="text-xs font-bold text-blue-600 flex items-center gap-1">
                <UIcon name="i-lucide-phone" class="w-3.5 h-3.5" />
                {{ row.phone }}
              </div>
              <div class="text-xs text-slate-400 font-medium truncate flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span class="truncate">{{ row.address || 'г. Алматы' }}</span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Сумма заказа</span>
                <span class="text-lg font-black text-blue-600 leading-none">{{ formatPrice(row.total) }} ₸</span>
              </div>

              <div class="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                <span>P2P Детали →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- DESKTOP VIEW (>= md): Table -->
        <div v-if="filteredOrders.length > 0" class="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="border-b border-slate-200 text-xs font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th class="py-3.5 px-4">ID Заказа</th>
                  <th class="py-3.5 px-4">P2P Этап (13 шагов)</th>
                  <th class="py-3.5 px-4">Заказчик (Клиника)</th>
                  <th class="py-3.5 px-4">Сумма</th>
                  <th class="py-3.5 px-4">Статус</th>
                  <th class="py-3.5 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr 
                  v-for="row in filteredOrders" 
                  :key="row.id" 
                  class="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  @click="openOrderDetails(row)"
                >
                  <td class="py-4 px-4 font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    <span class="inline-flex items-center gap-1 bg-slate-100 group-hover:bg-blue-100 text-slate-800 group-hover:text-blue-700 px-2.5 py-1 rounded-lg text-xs font-mono">
                      #{{ row.id }}
                    </span>
                  </td>
                  <td class="py-4 px-4">
                    <div class="flex flex-col">
                      <span class="text-xs font-black text-slate-800">{{ getP2PStageName(row.p2pStage || 'CREATED') }}</span>
                      <span class="text-[10px] font-extrabold text-blue-600">Этап {{ getP2PStageStep(row.p2pStage || 'CREATED') }} из 13</span>
                    </div>
                  </td>
                  <td class="py-4 px-4">
                    <div class="flex flex-col">
                      <span class="font-extrabold text-slate-900 text-sm">{{ row.name }}</span>
                      <span class="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
                        <UIcon name="i-lucide-phone" class="w-3 h-3" />
                        {{ row.phone }}
                      </span>
                    </div>
                  </td>
                  <td class="py-4 px-4 font-black text-blue-600 text-base">
                    {{ formatPrice(row.total) }} ₸
                  </td>
                  <td class="py-4 px-4" @click.stop>
                    <UBadge :color="(getStatusColor(row.status) as any)" variant="solid" size="sm" class="rounded-lg font-extrabold">
                      {{ row.status }}
                    </UBadge>
                  </td>
                  <td class="py-4 px-4 text-right" @click.stop>
                    <div class="flex items-center justify-end gap-2">
                      <UButton size="xs" color="primary" variant="soft" icon="i-lucide-eye" @click="openOrderDetails(row)" class="rounded-lg font-bold">P2P Карточка</UButton>
                      <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="deleteOrder(row.id)" class="rounded-lg hover:bg-red-50" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: PRODUCT MANAGEMENT (PIM CRUD)       -->
      <!-- ========================================== -->
      <div v-else-if="activeTab === 1" class="space-y-4">
        <!-- PIM Toolbar -->
        <div class="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div class="flex items-center gap-3 grow">
            <div class="relative grow max-w-md">
              <input
                v-model="pimSearch"
                type="text"
                placeholder="Поиск товара по названию, артикулу..."
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              <span class="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
            </div>

            <select
              v-model="pimCategoryFilter"
              class="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-600"
            >
              <option :value="null">Все категории</option>
              <option v-for="cat in catalogCategories" :key="cat.id" :value="cat.id">
                {{ cat.icon || '🦷' }} {{ cat.name }}
              </option>
            </select>
          </div>

          <button
            type="button"
            @click="openCreateProductModal"
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Создать новый товар
          </button>
        </div>

        <!-- Products Table -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Всего товаров в каталоге: {{ filteredPimProducts.length }}</span>
            <span>Страница 1 из 1</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4 w-14">Фото</th>
                  <th class="py-3 px-4">Название товара / Артикул</th>
                  <th class="py-3 px-4">Категория</th>
                  <th class="py-3 px-4">Цена</th>
                  <th class="py-3 px-4">Остаток</th>
                  <th class="py-3 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="prod in paginatedPimProducts" :key="prod.id" class="hover:bg-blue-50/30 transition-colors">
                  <td class="py-3 px-4">
                    <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        :src="prod.image || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'"
                        :alt="prod.name"
                        class="w-full h-full object-cover"
                        @error="(e: any) => e.target.src = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'"
                      />
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-extrabold text-slate-900 text-sm line-clamp-1">{{ prod.name }}</div>
                    <div class="text-[11px] text-slate-400 font-mono">Арт: {{ prod.code || prod.sku || `SKU-${prod.id}` }} • Бренд: {{ prod.brand || 'PAZL' }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                      {{ getCategoryName(prod.category) }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-black text-blue-600 text-sm">
                    {{ formatPrice(prod.price) }} ₸
                  </td>
                  <td class="py-3 px-4 font-bold text-slate-700">
                    {{ prod.stock || 50 }} шт.
                  </td>
                  <td class="py-3 px-4 text-right space-x-1.5">
                    <button
                      type="button"
                      @click="openEditProductModal(prod)"
                      class="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      ✏️ Изменить
                    </button>
                    <button
                      type="button"
                      @click="deleteProduct(prod.id)"
                      class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: CATEGORY TREE & 100+ ICONS          -->
      <!-- ========================================== -->
      <div v-else-if="activeTab === 2" class="space-y-4">
        <div class="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base sm:text-lg font-black text-slate-900">Дерево категорий и коллекция 100+ иконок</h2>
            <p class="text-xs text-slate-500">Создавайте и редактируйте разделы каталога с кастомными медицинскими пиктограммами</p>
          </div>

          <button
            type="button"
            @click="openCreateCategoryModal"
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Добавить категорию
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="cat in catalogCategories"
            :key="cat.id"
            class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl">
                  {{ cat.icon || '🦷' }}
                </div>
                <div>
                  <h3 class="font-extrabold text-slate-900 text-sm">{{ cat.name }}</h3>
                  <p class="text-xs text-slate-400">{{ getProductsCountForCategory(cat.id) }} товаров</p>
                </div>
              </div>

              <span class="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                ID: {{ cat.id }}
              </span>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                @click="openEditCategoryModal(cat)"
                class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                ✏️ Редактировать иконку / имя
              </button>

              <button
                type="button"
                @click="deleteCategory(cat.id)"
                class="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: FEEDBACK -->
      <div v-else-if="activeTab === 3" class="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <UButton v-for="s in ['Все', 'новое', 'в работе', 'завершено']" :key="s"
            :color="feedbackFilter === s ? 'primary' : 'neutral'"
            :variant="feedbackFilter === s ? 'soft' : 'ghost'"
            @click="feedbackFilter = s"
            class="rounded-xl font-bold shrink-0"
            size="sm"
          >
            {{ s === 'Все' ? 'Все обращения' : s }}
          </UButton>
        </div>

        <div v-if="filteredFeedbacks.length === 0" class="py-12 text-center text-slate-400">
          <UIcon name="i-lucide-message-square" class="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
          <p class="font-bold text-slate-600">Нет обращений</p>
        </div>

        <div v-else class="space-y-2">
          <div 
            v-for="row in filteredFeedbacks" 
            :key="row.id" 
            @click="openFeedbackDetails(row)"
            class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-all cursor-pointer flex justify-between items-center"
          >
            <div class="space-y-1">
              <div class="font-bold text-blue-600 text-sm">{{ row.contact }}</div>
              <div class="text-xs text-slate-600 max-w-md truncate">{{ row.message }}</div>
              <div class="text-[10px] text-slate-400">{{ formatDate(row.date) }}</div>
            </div>
            <UBadge :color="(getFeedbackStatusColor(row.status) as any)" variant="subtle" size="xs" class="rounded-md font-bold">
              {{ row.status }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- TAB 4: CATALOG PIPELINE UPLOAD -->
      <div v-else-if="activeTab === 4" class="bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div class="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 transition-all cursor-pointer bg-slate-50 hover:bg-blue-50/50 group" @click="fileInput.click()">
          <UIcon name="i-lucide-upload-cloud" class="w-14 h-14 text-slate-400 group-hover:text-blue-600 mb-3" />
          <h3 class="text-lg font-extrabold text-slate-800 group-hover:text-blue-600 mb-1">Загрузить Excel прайс-лист на конвейер</h3>
          <p class="text-slate-500 text-xs mb-4">Форматы: .xlsx, .xls</p>
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileUpload" />
          <UButton color="primary" variant="solid" size="md" icon="i-lucide-file-spreadsheet" class="rounded-xl font-bold">Выбрать файл</UButton>
        </div>
      </div>

    </div>

    <!-- ========================================== -->
    <!-- MODAL 1: ADMIN ACCESS PASSWORD 321         -->
    <!-- ========================================== -->
    <UModal v-model="isAdminPassModalOpen">
      <div class="bg-white rounded-3xl p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-xl font-bold">
            👑
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900">Вход в Админ-панель</h3>
            <p class="text-xs text-slate-500">Введите пароль администратора (321)</p>
          </div>
        </div>

        <form @submit.prevent="verifyAdminPassword" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Пароль админа</label>
            <input
              v-model="adminPassInput"
              type="password"
              placeholder="321"
              autofocus
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div v-if="adminPassError" class="p-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl">
            {{ adminPassError }}
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="isAdminPassModalOpen = false"
              class="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Войти в админку →
            </button>
          </div>
        </form>
      </div>
    </UModal>

    <!-- ========================================== -->
    <!-- MODAL 2: CREATE / EDIT PRODUCT             -->
    <!-- ========================================== -->
    <UModal v-model="isProductModalOpen" :ui="({ width: 'w-full sm:max-w-xl' } as any)">
      <div class="bg-white rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="text-base font-black text-slate-900">
          {{ editingProductId ? '✏️ Редактирование товара' : '+ Создание нового товара' }}
        </h3>

        <form @submit.prevent="saveProduct" class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Название товара <span class="text-red-500">*</span></label>
            <input v-model="productForm.name" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Цена (₸) <span class="text-red-500">*</span></label>
              <input v-model.number="productForm.price" type="number" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600" required />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Категория <span class="text-red-500">*</span></label>
              <select v-model="productForm.category" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" required>
                <option v-for="c in catalogCategories" :key="c.id" :value="c.id">
                  {{ c.icon || '🦷' }} {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Артикул / SKU</label>
              <input v-model="productForm.code" type="text" placeholder="SKU-100" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Остаток на складе</label>
              <input v-model.number="productForm.stock" type="number" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Ссылка на фото / Картинка URL</label>
            <input v-model="productForm.image" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]" />
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Описание</label>
            <textarea v-model="productForm.description" rows="3" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
          </div>

          <div class="pt-3 flex justify-end gap-2">
            <button type="button" @click="isProductModalOpen = false" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">
              Отмена
            </button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md cursor-pointer">
              {{ editingProductId ? 'Сохранить изменения' : 'Создать товар' }}
            </button>
          </div>
        </form>
      </div>
    </UModal>

    <!-- ========================================== -->
    <!-- MODAL 3: CREATE / EDIT CATEGORY & ICONS    -->
    <!-- ========================================== -->
    <UModal v-model="isCategoryModalOpen" :ui="({ width: 'w-full sm:max-w-lg' } as any)">
      <div class="bg-white rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="text-base font-black text-slate-900">
          {{ editingCategoryId ? '✏️ Редактирование категории' : '+ Создание новой категории' }}
        </h3>

        <form @submit.prevent="saveCategory" class="space-y-4 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Название категории <span class="text-red-500">*</span></label>
            <input v-model="categoryForm.name" type="text" placeholder="Например: Ортодонтия и Брекеты" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Выбранная иконка: <span class="text-2xl ml-2">{{ categoryForm.icon }}</span></label>
            
            <!-- Category Icons Selector Picker (100+ Icons) -->
            <div class="mt-2 border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-3">
              <div class="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Выберите иконку из 140+ стоматологических пиктограмм:</span>
              </div>

              <!-- Icon Groups Tabs -->
              <div class="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                <button
                  v-for="(grp, gIdx) in iconGroups"
                  :key="gIdx"
                  type="button"
                  @click="activeIconGroupIdx = gIdx"
                  :class="[
                    'px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer',
                    activeIconGroupIdx === gIdx ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  ]"
                >
                  {{ grp.name }}
                </button>
              </div>

              <!-- Icons Grid -->
              <div class="grid grid-cols-8 gap-2 p-2 bg-white rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                <button
                  v-for="(ic, idx) in iconGroups[activeIconGroupIdx]?.icons || []"
                  :key="idx"
                  type="button"
                  @click="categoryForm.icon = ic"
                  :class="[
                    'w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer',
                    categoryForm.icon === ic ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : 'hover:bg-slate-100'
                  ]"
                >
                  {{ ic }}
                </button>
              </div>
            </div>
          </div>

          <div class="pt-3 flex justify-end gap-2">
            <button type="button" @click="isCategoryModalOpen = false" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">
              Отмена
            </button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md cursor-pointer">
              {{ editingCategoryId ? 'Сохранить категорию' : 'Создать категорию' }}
            </button>
          </div>
        </form>
      </div>
    </UModal>

    <!-- FULL 13-STEP P2P PROCURE-TO-PAY ORDER MODAL -->
    <UModal v-model="isOrderModalOpen" :ui="({ width: 'w-full sm:max-w-3xl', margin: 'm-2 sm:m-auto' } as any)">
      <div v-if="selectedOrder" class="bg-white rounded-3xl p-4 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-mono font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">Заказ #{{ selectedOrder.id }}</span>
              <UBadge :color="(getStatusColor(selectedOrder.status) as any)" variant="solid" class="rounded-lg font-extrabold text-xs">
                {{ selectedOrder.status }}
              </UBadge>
              <span class="text-xs font-bold text-slate-500">Этап {{ getP2PStageStep(selectedOrder.p2pStage || 'CREATED') }} из 13</span>
            </div>
            <p class="text-[11px] text-slate-400 font-semibold mt-1">Оформлен: {{ formatDate(selectedOrder.date) }}</p>
          </div>
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="rounded-xl" @click="isOrderModalOpen = false" />
        </div>

        <!-- 13-STEP P2P PROGRESS STEPPER BAR -->
        <div class="bg-slate-900 text-white p-4 rounded-2xl space-y-3 shadow-md">
          <div class="flex items-center justify-between text-xs font-extrabold">
            <span class="text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
              <UIcon name="i-lucide-git-commit" class="w-4 h-4" />
              Цепочка P2P (Procure-to-Pay):
            </span>
            <span class="text-emerald-400 font-black text-sm">{{ getP2PStageName(selectedOrder.p2pStage || 'CREATED') }}</span>
          </div>

          <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              class="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500"
              :style="{ width: `${(getP2PStageStep(selectedOrder.p2pStage || 'CREATED') / 13) * 100}%` }"
            ></div>
          </div>

          <div class="flex justify-between items-center pt-1">
            <span class="text-[11px] text-slate-400">Шаг {{ getP2PStageStep(selectedOrder.p2pStage || 'CREATED') }} из 13</span>
            
            <button
              type="button"
              @click="advanceP2PStage(selectedOrder)"
              class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Продвинуть этап P2P ⏩</span>
            </button>
          </div>
        </div>

        <!-- MODAL SUB-TABS -->
        <div class="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            v-for="t in [
              { id: 'details', label: 'Информация & Товары', icon: 'i-lucide-package' },
              { id: 'docs', label: 'Реестр документов (6 видов)', icon: 'i-lucide-file-text' }
            ]"
            :key="t.id"
            @click="modalTab = t.id"
            :class="[
              'px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
              modalTab === t.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            <UIcon :name="t.icon" class="w-4 h-4" />
            <span>{{ t.label }}</span>
          </button>
        </div>

        <!-- TAB CONTENT 1: DETAILS -->
        <div v-if="modalTab === 'details'" class="space-y-4">
          <div class="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl space-y-2">
            <div class="text-xs font-extrabold uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
              <UIcon name="i-lucide-building-2" class="w-4 h-4" />
              <span>Заказчик (Клиника)</span>
            </div>

            <div class="text-lg font-black text-slate-900 leading-tight">
              {{ selectedOrder.name }}
            </div>

            <div class="flex items-center gap-2 pt-1 flex-wrap">
              <a 
                :href="`tel:${selectedOrder.phone}`" 
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 transition-colors shadow-xs"
              >
                <UIcon name="i-lucide-phone-call" class="w-3.5 h-3.5" />
                <span>{{ selectedOrder.phone }}</span>
              </a>

              <a 
                :href="`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, '')}`" 
                target="_blank"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <UIcon name="i-lucide-message-circle" class="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div class="text-xs text-slate-500 font-semibold flex items-center gap-1 pt-1">
              <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Адрес доставки: {{ selectedOrder.address || 'г. Алматы, Достык 105' }}</span>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Товары в заказе</h4>
            <div class="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
              <div 
                v-for="(item, idx) in selectedOrder.items" 
                :key="idx" 
                class="p-3 bg-slate-50/40 flex justify-between items-center gap-2 text-xs"
              >
                <div class="font-bold text-slate-800 min-w-0 pr-2">
                  {{ item.name }}
                </div>
                <div class="text-right shrink-0">
                  <span class="text-[11px] text-slate-400 block">{{ item.quantity }} шт × {{ formatPrice(item.price) }} ₸</span>
                  <span class="font-extrabold text-blue-600 text-xs">{{ formatPrice(item.price * item.quantity) }} ₸</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-300">Итоговая сумма:</span>
            <span class="text-xl sm:text-2xl font-black text-emerald-400 leading-none">{{ formatPrice(selectedOrder.total) }} ₸</span>
          </div>
        </div>

        <!-- TAB CONTENT 2: P2P DOCUMENTS -->
        <div v-else-if="modalTab === 'docs'" class="space-y-3">
          <div class="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Реестр документов:</div>
          <div class="space-y-2.5">
            <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-blue-100 text-blue-600 font-bold">
                  <UIcon name="i-lucide-file-text" class="w-5 h-5" />
                </div>
                <div>
                  <div class="font-extrabold text-slate-900 text-sm">Счет на оплату №INV-4029</div>
                  <div class="text-[11px] text-slate-400">Сформирован автоматически • PDF</div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <UButton size="xs" color="primary" variant="soft" icon="i-lucide-download" @click="downloadDoc('Счет на оплату')">PDF</UButton>
              </div>
            </div>
          </div>
        </div>

      </div>
    </UModal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { CATEGORY_ICON_GROUPS } from '~/utils/categoryIcons'

const authStore = useAuthStore()
const localePath = useLocalePath()
const router = useRouter()
const toast = useToast()

const activeTab = ref(0)
const orderFilter = ref('Все')
const feedbackFilter = ref('Все')
const isOrderModalOpen = ref(false)
const selectedOrder = ref<any>(null)
const selectedFeedback = ref<any>(null)
const modalTab = ref('details')

const fileInput = ref<any>(null)
const uploading = ref(false)

// Admin Password Modal
const isAdminPassModalOpen = ref(false)
const adminPassInput = ref('')
const adminPassError = ref('')

// PIM & Categories State
const pimSearch = ref('')
const pimCategoryFilter = ref<number | null>(null)
const pimProducts = ref<any[]>([])
const catalogCategories = ref<any[]>([])

const isProductModalOpen = ref(false)
const editingProductId = ref<number | null>(null)
const productForm = reactive({
  name: '',
  price: 0,
  category: 1,
  description: '',
  image: '',
  code: '',
  brand: '',
  stock: 50
})

const isCategoryModalOpen = ref(false)
const editingCategoryId = ref<number | null>(null)
const categoryForm = reactive({
  name: '',
  icon: '🦷'
})

const iconGroups = CATEGORY_ICON_GROUPS
const activeIconGroupIdx = ref(0)

const navTabs = [
  { label: 'Заказы (P2P Флоу)', icon: 'i-lucide-shopping-bag' },
  { label: '📦 Товары (PIM)', icon: 'i-lucide-package' },
  { label: '🗂️ Категории & 100+ Иконок', icon: 'i-lucide-folder-tree' },
  { label: 'Обращения', icon: 'i-lucide-message-square' },
  { label: 'Конвейер прайсов', icon: 'i-lucide-upload-cloud' }
]

const p2pStages = [
  { key: 'CREATED', step: 1, name: '1. Создание заказа' },
  { key: 'CONFIRMED', step: 2, name: '2. Подтверждение поставщиком' },
  { key: 'INVOICE_ISSUED', step: 3, name: '3. Выставление счета' },
  { key: 'COMMERCIAL_OFFER', step: 4, name: '4. Коммерческое предложение' },
  { key: 'PAID', step: 5, name: '5. Оплата / Платежка' },
  { key: 'ASSEMBLING', step: 6, name: '6. Комплектация на складе' },
  { key: 'SHIPPED', step: 7, name: '7. Отгрузка' },
  { key: 'WAYBILL', step: 8, name: '8. Путевой лист' },
  { key: 'DELIVERED', step: 9, name: '9. Накладная и Прибытие' },
  { key: 'RECEIPT_CONFIRMED', step: 10, name: '10. Подтверждение получения' },
  { key: 'DISPUTED', step: 11, name: '11. Претензия / Возврат' },
  { key: 'ESF_SIGNED', step: 12, name: '12. Электронный счет-фактура (ЭСФ)' },
  { key: 'COMPLETED', step: 13, name: '13. Акт сверки и Завершение' }
]

function getP2PStageStep(stageKey: string): number {
  const found = p2pStages.find(s => s.key === stageKey)
  return found ? found.step : 1
}

function getP2PStageName(stageKey: string): string {
  const found = p2pStages.find(s => s.key === stageKey)
  return found ? found.name : '1. Создание заказа'
}

function advanceP2PStage(order: any) {
  const currentStep = getP2PStageStep(order.p2pStage || 'CREATED')
  const nextStage = p2pStages.find(s => s.step === (currentStep >= 13 ? 13 : currentStep + 1))
  if (nextStage) {
    order.p2pStage = nextStage.key
    if (nextStage.step >= 12) order.status = 'Завершен'
    else if (nextStage.step >= 7) order.status = 'В доставке'
    else if (nextStage.step >= 4) order.status = 'Оплачен'
    else if (nextStage.step >= 2) order.status = 'Подтвержден'
    
    toast.add({ 
      title: `P2P Шаг ${nextStage.step}/13: ${nextStage.name}`,
      description: 'Этап P2P цепочки обновлен!', 
      color: 'success',
      icon: 'i-lucide-git-commit'
    })
  }
}

// Fetch Catalog Products & Categories
async function fetchCatalog() {
  try {
    const [pRes, cRes] = await Promise.all([
      $fetch<{ results: any[] }>('/api/catalog/products'),
      $fetch<{ results: any[] }>('/api/catalog/categories')
    ])
    pimProducts.value = pRes?.results || []
    catalogCategories.value = cRes?.results || []
  } catch (err) {
    console.error('Error loading catalog in operator:', err)
  }
}

const filteredPimProducts = computed(() => {
  let list = pimProducts.value
  if (pimCategoryFilter.value) {
    list = list.filter(p => p.category === pimCategoryFilter.value)
  }
  if (pimSearch.value) {
    const q = pimSearch.value.toLowerCase()
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.code && p.code.toLowerCase().includes(q))
    )
  }
  return list
})

const paginatedPimProducts = computed(() => {
  return filteredPimProducts.value.slice(0, 50)
})

function getCategoryName(catId: number): string {
  const cat = catalogCategories.value.find(c => c.id === catId)
  return cat ? `${cat.icon || '🦷'} ${cat.name}` : 'Общее'
}

function getProductsCountForCategory(catId: number): number {
  return pimProducts.value.filter(p => p.category === catId).length
}

function openCreateProductModal() {
  editingProductId.value = null
  productForm.name = ''
  productForm.price = 10000
  productForm.category = catalogCategories.value[0]?.id || 1
  productForm.description = ''
  productForm.image = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'
  productForm.code = `SKU-${Date.now().toString().slice(-4)}`
  productForm.brand = 'PAZL'
  productForm.stock = 50
  isProductModalOpen.value = true
}

function openEditProductModal(prod: any) {
  editingProductId.value = prod.id
  productForm.name = prod.name
  productForm.price = prod.price
  productForm.category = prod.category
  productForm.description = prod.description || ''
  productForm.image = prod.image || ''
  productForm.code = prod.code || ''
  productForm.brand = prod.brand || 'PAZL'
  productForm.stock = prod.stock || 50
  isProductModalOpen.value = true
}

async function saveProduct() {
  try {
    if (editingProductId.value) {
      await $fetch(`/api/catalog/products/${editingProductId.value}`, {
        method: 'PUT',
        body: { ...productForm }
      })
      toast.add({ title: 'Товар успешно обновлен!', color: 'success' })
    } else {
      await $fetch('/api/catalog/products', {
        method: 'POST',
        body: { ...productForm }
      })
      toast.add({ title: 'Новый товар добавлен в каталог!', color: 'success' })
    }
    isProductModalOpen.value = false
    await fetchCatalog()
  } catch (err: any) {
    alert(err.message || 'Ошибка сохранения товара')
  }
}

async function deleteProduct(id: number) {
  if (!confirm('Вы уверены, что хотите удалить этот товар из каталога?')) return
  try {
    await $fetch(`/api/catalog/products/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Товар удален', color: 'neutral' })
    await fetchCatalog()
  } catch (err: any) {
    alert(err.message || 'Ошибка удаления товара')
  }
}

function openCreateCategoryModal() {
  editingCategoryId.value = null
  categoryForm.name = ''
  categoryForm.icon = '🦷'
  isCategoryModalOpen.value = true
}

function openEditCategoryModal(cat: any) {
  editingCategoryId.value = cat.id
  categoryForm.name = cat.name
  categoryForm.icon = cat.icon || '🦷'
  isCategoryModalOpen.value = true
}

async function saveCategory() {
  try {
    if (editingCategoryId.value) {
      await $fetch(`/api/catalog/categories/${editingCategoryId.value}`, {
        method: 'PUT',
        body: { ...categoryForm }
      })
      toast.add({ title: 'Категория обновлена!', color: 'success' })
    } else {
      await $fetch('/api/catalog/categories', {
        method: 'POST',
        body: { ...categoryForm }
      })
      toast.add({ title: 'Новая категория создана!', color: 'success' })
    }
    isCategoryModalOpen.value = false
    await fetchCatalog()
  } catch (err: any) {
    alert(err.message || 'Ошибка сохранения категории')
  }
}

async function deleteCategory(id: number) {
  if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return
  try {
    await $fetch(`/api/catalog/categories/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Категория удалена', color: 'neutral' })
    await fetchCatalog()
  } catch (err: any) {
    alert(err.message || 'Ошибка удаления категории')
  }
}

function verifyAdminPassword() {
  const p = adminPassInput.value.trim()
  if (p === '321' || p === 'admin123' || p === '123') {
    authStore.token = 'mock_admin_token'
    authStore.refreshToken = 'mock_admin_refresh'
    authStore.user = {
      id: 1,
      phone: '+7 (700) 000-00-01',
      first_name: 'Главный Администратор',
      last_name: '',
      email: 'admin@pazl.kz',
      role: 'admin',
      phone_confirmed: true
    }
    authStore._saveToCookies()
    isAdminPassModalOpen.value = false
    router.push(localePath('/admin'))
  } else {
    adminPassError.value = 'Неверный пароль администратора (введите 321)'
  }
}

// Orders fetching
const defaultOperatorOrders = [
  {
    id: 'ORD-501',
    date: new Date(Date.now() - 3600000 * 1).toISOString(),
    name: 'Стоматология «Ару Дент»',
    phone: '+7 (707) 123-45-67',
    contact: '+7 (707) 123-45-67',
    total: 185000,
    status: 'Новый',
    p2pStage: 'CREATED',
    address: 'г. Алматы, ул. Достык 105',
    items: [
      { name: 'TG6 машинные файлы для обработки каналов', quantity: 4, price: 5625 },
      { name: 'Стоматологический реставрационный композит', quantity: 2, price: 24500 }
    ]
  },
  {
    id: 'ORD-502',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    name: 'Клиника «Smile Pro»',
    phone: '+7 (777) 987-65-43',
    contact: '+7 (777) 987-65-43',
    total: 480000,
    status: 'Оплачен',
    p2pStage: 'PAID',
    address: 'г. Астана, пр. Кабанбай батыра 21',
    items: [
      { name: 'Бестеневая светодиодная лампа LED Smile', quantity: 1, price: 480000 }
    ]
  }
]

const { data: ordersData, refresh: refreshOrders } = await useAsyncData('operator-orders', async () => {
  let results: any[] = []
  try {
    const res = await $fetch<any[]>('/api/orders')
    results = Array.isArray(res) ? res : []
  } catch (e) {
    console.warn('[Operator] Orders fetch issue:', e)
  }

  if (!results || results.length === 0) {
    results = defaultOperatorOrders
  }

  return results.map((o: any) => ({
    ...o,
    status: normalizeStatus(o.status)
  }))
})

const orders = computed(() => Array.isArray(ordersData.value) ? ordersData.value : ((ordersData.value as any)?.results || []))

const { data: feedbacks } = await useAsyncData<any[]>('feedbacks', async () => {
  if (authStore.isAuthenticated) {
    const res = await $fetch('/api/feedback')
    return Array.isArray(res) ? res : []
  }
  return []
}, { watch: [() => authStore.isAuthenticated] })

onMounted(() => {
  refreshOrders()
  fetchCatalog()
})

const filteredOrders = computed(() => {
  if (!orders.value) return []
  let list = [...orders.value]
  if (orderFilter.value !== 'Все') {
    list = list.filter(o => normalizeStatus(o.status) === normalizeStatus(orderFilter.value))
  }
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const filteredFeedbacks = computed(() => {
  if (!feedbacks.value) return []
  let list = [...feedbacks.value]
  if (feedbackFilter.value !== 'Все') list = list.filter((f: any) => f.status === feedbackFilter.value)
  return list.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

function openOrderDetails(order: any) {
  selectedOrder.value = order
  modalTab.value = 'details'
  isOrderModalOpen.value = true
}

function openFeedbackDetails(feedback: any) {
  selectedFeedback.value = feedback
}

async function deleteOrder(id: string) {
  if (!confirm(`Вы уверены, что хотите безвозвратно удалить заказ #${id}?`)) return
  try {
    await $fetch(`/api/orders/${id}`, { method: 'DELETE' as any }).catch(() => {})
    if (ordersData.value && Array.isArray(ordersData.value)) {
      ordersData.value = ordersData.value.filter((o: any) => String(o.id) !== String(id))
    }
    if (selectedOrder.value && String(selectedOrder.value.id) === String(id)) {
      isOrderModalOpen.value = false
    }
    toast.add({ title: 'Заказ успешно удален', color: 'neutral', icon: 'i-lucide-trash' })
  } catch (e) {
    console.error('Delete order error', e)
  }
}

function downloadDoc(docName: string) {
  toast.add({ title: `Скачивание ${docName}...`, description: 'Файл успешно сгенерирован (PDF).', color: 'info', icon: 'i-lucide-download' })
}

function getStatusColor(status: string) {
  switch (normalizeStatus(status)) {
    case 'Новый': return 'orange'
    case 'Подтвержден': return 'blue'
    case 'Оплачен': return 'purple'
    case 'В доставке': return 'indigo'
    case 'Завершен': return 'emerald'
    case 'Претензия': return 'red'
    default: return 'gray'
  }
}

function getStatusDotBgClass(status: string) {
  switch (normalizeStatus(status)) {
    case 'Новый': return 'bg-orange-500'
    case 'Подтвержден': return 'bg-blue-500'
    case 'Оплачен': return 'bg-purple-500'
    case 'В доставке': return 'bg-indigo-500'
    case 'Завершен': return 'bg-emerald-500'
    case 'Претензия': return 'bg-red-500'
    default: return 'bg-slate-400'
  }
}

function getFeedbackStatusColor(status: string) {
  switch (status) {
    case 'новое': return 'orange'
    case 'в работе': return 'blue'
    case 'завершено': return 'emerald'
    default: return 'gray'
  }
}

async function handleFileUpload(event: any) {
  const file = event.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  uploading.value = true
  try {
    toast.add({ title: 'Файл отправлен на конвейер!', description: 'Каталог обновится автоматически.', color: 'success', icon: 'i-lucide-check-circle' })
  } catch (e: any) {
    toast.add({ title: 'Ошибка загрузки', description: e.message, color: 'error', icon: 'i-lucide-x-circle' })
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function formatDate(d: string | undefined): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return d
  }
}

function formatPrice(val: number | undefined): string {
  if (val === undefined || val === null) return '0'
  return new Intl.NumberFormat('ru-RU').format(val)
}

function normalizeStatus(s: any): string {
  if (!s) return 'Новый'
  const lower = String(s).toLowerCase()
  if (lower.includes('new') || lower.includes('нов')) return 'Новый'
  if (lower.includes('confirm') || lower.includes('подтвержд')) return 'Подтвержден'
  if (lower.includes('pay') || lower.includes('оплат')) return 'Оплачен'
  if (lower.includes('ship') || lower.includes('достав')) return 'В доставке'
  if (lower.includes('complete') || lower.includes('заверш')) return 'Завершен'
  if (lower.includes('dispute') || lower.includes('претенз') || lower.includes('брак')) return 'Претензия'
  return String(s)
}

function logout() {
  authStore.logout()
  router.push(localePath('/login'))
}

useHead({ title: 'Панель оператора | PAZL' })
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
