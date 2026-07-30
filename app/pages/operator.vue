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
            <p class="text-xs text-slate-500 font-medium">Управление заказами, P2P цепочкой и документами (Procure-to-Pay)</p>
          </div>
        </div>
        
        <div class="flex gap-2 items-center w-full sm:w-auto justify-end">
          <UButton color="white" variant="solid" icon="i-lucide-external-link" :to="localePath('/')" size="sm" class="rounded-xl font-bold">На сайт</UButton>
          <UButton color="red" variant="soft" icon="i-lucide-log-out" @click="logout" size="sm" class="rounded-xl font-bold">Выйти</UButton>
        </div>
      </div>

      <!-- Navigation Tabs (Mobile Scrollable) -->
      <div class="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1 no-scrollbar">
        <button 
          v-for="(tab, i) in [{ label: 'Заказы (P2P Флоу)', icon: 'i-lucide-shopping-bag' }, { label: 'Обращения', icon: 'i-lucide-message-square' }, { label: 'Конвейер прайсов', icon: 'i-lucide-upload-cloud' }]" 
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

      <!-- TAB 0: ORDERS (P2P FLOW) -->
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
            <!-- Card Header: ID, P2P Stage, Status -->
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

            <!-- Client / Clinic Details -->
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

            <!-- Card Footer: Total Price & Tap Prompt -->
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
        <div class="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
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
                    <UBadge :color="getStatusColor(row.status)" variant="solid" size="sm" class="rounded-lg font-extrabold">
                      {{ row.status }}
                    </UBadge>
                  </td>
                  <td class="py-4 px-4 text-right" @click.stop>
                    <div class="flex items-center justify-end gap-2">
                      <UButton size="xs" color="blue" variant="soft" icon="i-lucide-eye" @click="openOrderDetails(row)" class="rounded-lg font-bold">P2P Карточка</UButton>
                      <UButton size="xs" color="red" variant="ghost" icon="i-lucide-trash-2" @click="deleteOrder(row.id)" class="rounded-lg hover:bg-red-50" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 1: FEEDBACK -->
      <div v-else-if="activeTab === 1" class="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <UButton v-for="s in ['Все', 'новое', 'в работе', 'завершено']" :key="s"
            :color="feedbackFilter === s ? 'primary' : 'gray'"
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
            <UBadge :color="getFeedbackStatusColor(row.status)" variant="subtle" size="xs" class="rounded-md font-bold">
              {{ row.status }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- TAB 2: CATALOG UPLOAD -->
      <div v-else-if="activeTab === 2" class="bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div class="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 transition-all cursor-pointer bg-slate-50 hover:bg-blue-50/50 group" @click="fileInput.click()">
          <UIcon name="i-lucide-upload-cloud" class="w-14 h-14 text-slate-400 group-hover:text-blue-600 mb-3" />
          <h3 class="text-lg font-extrabold text-slate-800 group-hover:text-blue-600 mb-1">Загрузить Excel прайс-лист</h3>
          <p class="text-slate-500 text-xs mb-4">Форматы: .xlsx, .xls</p>
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileUpload" />
          <UButton color="blue" variant="solid" size="md" icon="i-lucide-file-spreadsheet" class="rounded-xl font-bold">Выбрать прайс-лист</UButton>
        </div>
      </div>

    </div>

    <!-- FULL 13-STEP P2P PROCURE-TO-PAY ORDER MODAL -->
    <UModal v-model="isOrderModalOpen" :ui="{ width: 'w-full sm:max-w-3xl', margin: 'm-2 sm:m-auto' }">
      <div v-if="selectedOrder" class="bg-white rounded-3xl p-4 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-mono font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">Заказ #{{ selectedOrder.id }}</span>
              <UBadge :color="getStatusColor(selectedOrder.status)" variant="solid" class="rounded-lg font-extrabold text-xs">
                {{ selectedOrder.status }}
              </UBadge>
              <span class="text-xs font-bold text-slate-500">Этап {{ getP2PStageStep(selectedOrder.p2pStage || 'CREATED') }} из 13</span>
            </div>
            <p class="text-[11px] text-slate-400 font-semibold mt-1">Оформлен: {{ formatDate(selectedOrder.date) }}</p>
          </div>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" class="rounded-xl" @click="isOrderModalOpen = false" />
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

          <!-- Step Progress Bar -->
          <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              class="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500"
              :style="{ width: `${(getP2PStageStep(selectedOrder.p2pStage || 'CREATED') / 13) * 100}%` }"
            ></div>
          </div>

          <!-- Advance P2P Stage Action Button -->
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

        <!-- MODAL SUB-TABS: (1. Клиника & Товары, 2. Документы P2P, 3. Таймлайн и Аудит) -->
        <div class="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            v-for="t in [
              { id: 'details', label: 'Информация & Товары', icon: 'i-lucide-package' },
              { id: 'docs', label: 'Реестр документов (6 видов)', icon: 'i-lucide-file-text' },
              { id: 'audit', label: 'Таймлайн & Аудит', icon: 'i-lucide-history' }
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

        <!-- TAB CONTENT 1: DETAILS & CLIENT HIGHLIGHT -->
        <div v-if="modalTab === 'details'" class="space-y-4">
          <!-- CLIENT / CLINIC HIGHLIGHT BOX -->
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

          <!-- SUPPLIER INFO BOX -->
          <div class="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-1">
            <div class="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <UIcon name="i-lucide-truck" class="w-3.5 h-3.5 text-emerald-600" />
              <span>Поставщик</span>
            </div>
            <div class="font-extrabold text-slate-800 text-sm">ТОО «Стома Поставщик» (КазМедИмпорт)</div>
            <div class="text-xs text-slate-500 font-medium">Центральный склад отгрузки (Алматы)</div>
          </div>

          <!-- ITEMS LIST -->
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

          <!-- TOTAL SUM BANNER -->
          <div class="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-300">Итоговая сумма:</span>
            <span class="text-xl sm:text-2xl font-black text-emerald-400 leading-none">{{ formatPrice(selectedOrder.total) }} ₸</span>
          </div>
        </div>

        <!-- TAB CONTENT 2: P2P DOCUMENTS REGISTER -->
        <div v-else-if="modalTab === 'docs'" class="space-y-3">
          <div class="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Реестр документов по заказу №{{ selectedOrder.id }}:</div>

          <div class="space-y-2.5">
            <!-- 1. Счет на оплату -->
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
                <UButton size="xs" color="blue" variant="soft" icon="i-lucide-download" @click="downloadDoc('Счет на оплату')">PDF</UButton>
                <UButton size="xs" color="emerald" variant="soft" icon="i-lucide-share-2" @click="shareDoc('Счет на оплату')">WA</UButton>
              </div>
            </div>

            <!-- 2. Платежное поручение -->
            <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-emerald-100 text-emerald-600 font-bold">
                  <UIcon name="i-lucide-credit-card" class="w-5 h-5" />
                </div>
                <div>
                  <div class="font-extrabold text-slate-900 text-sm">Платежное поручение №PAY-9921</div>
                  <div class="text-[11px] text-emerald-600 font-bold">Статус: Подтвержден 100%</div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <UButton size="xs" color="gray" variant="soft" icon="i-lucide-download" @click="downloadDoc('Платежное поручение')">Скачать</UButton>
              </div>
            </div>

            <!-- 3. Путевой лист -->
            <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-purple-100 text-purple-600 font-bold">
                  <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
                </div>
                <div>
                  <div class="font-extrabold text-slate-900 text-sm">Путевой лист №PL-102</div>
                  <div class="text-[11px] text-slate-400">Водитель: Арман Т. (Gazel 777)</div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <UButton size="xs" color="gray" variant="soft" icon="i-lucide-eye" @click="downloadDoc('Путевой лист')">Карта</UButton>
              </div>
            </div>

            <!-- 4. Накладная (ТТН) -->
            <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-orange-100 text-orange-600 font-bold">
                  <UIcon name="i-lucide-package-check" class="w-5 h-5" />
                </div>
                <div>
                  <div class="font-extrabold text-slate-900 text-sm">Товарная накладная №TTN-8820</div>
                  <div class="text-[11px] text-slate-400">Отгружено 100% со склада</div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <UButton size="xs" color="blue" variant="soft" icon="i-lucide-download" @click="downloadDoc('Накладная')">PDF</UButton>
              </div>
            </div>

            <!-- 5. Электронный счет-фактура (ЭСФ) -->
            <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-indigo-100 text-indigo-600 font-bold">
                  <UIcon name="i-lucide-key-round" class="w-5 h-5" />
                </div>
                <div>
                  <div class="font-extrabold text-slate-900 text-sm">ЭСФ №ESF-4401</div>
                  <div class="text-[11px] text-emerald-600 font-bold">Подписан ЭЦП (ИСФ РК)</div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <UButton size="xs" color="emerald" variant="solid" icon="i-lucide-check-check" @click="downloadDoc('ЭСФ')">ЭЦП Подписан</UButton>
              </div>
            </div>

            <!-- 6. Акт сверки -->
            <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-slate-200 text-slate-700 font-bold">
                  <UIcon name="i-lucide-file-check" class="w-5 h-5" />
                </div>
                <div>
                  <div class="font-extrabold text-slate-900 text-sm">Акт сверки №ACT-2026</div>
                  <div class="text-[11px] text-slate-400">Сформирован за текущий период</div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <UButton size="xs" color="gray" variant="soft" icon="i-lucide-download" @click="downloadDoc('Акт сверки')">Скачать</UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB CONTENT 3: AUDIT TIMELINE -->
        <div v-else-if="modalTab === 'audit'" class="space-y-4">
          <div class="text-xs font-extrabold text-slate-500 uppercase tracking-wider">История событий и лог аудита (Audit Log):</div>
          
          <div class="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            <div class="relative flex items-start gap-3 pl-8">
              <span class="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white"></span>
              <div>
                <div class="text-xs font-extrabold text-slate-900">Заказ создан и оформлен клиникой</div>
                <div class="text-[11px] text-slate-400">Пользователь: {{ selectedOrder.name }} • {{ formatDate(selectedOrder.date) }}</div>
              </div>
            </div>

            <div class="relative flex items-start gap-3 pl-8">
              <span class="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></span>
              <div>
                <div class="text-xs font-extrabold text-slate-900">Поставщик подтвердил позиции и зарезервировал склад</div>
                <div class="text-[11px] text-slate-400">Актер: Менеджер поставщика ТОО Стома • Автоматически</div>
              </div>
            </div>

            <div class="relative flex items-start gap-3 pl-8">
              <span class="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white"></span>
              <div>
                <div class="text-xs font-extrabold text-slate-900">Выставлен счет №INV-4029 и загружено платежное поручение</div>
                <div class="text-[11px] text-slate-400">Оплата подтверждена 100%</div>
              </div>
            </div>

            <div class="relative flex items-start gap-3 pl-8">
              <span class="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-orange-400 ring-4 ring-white"></span>
              <div>
                <div class="text-xs font-extrabold text-slate-900">Комплектация и сформирована накладная №TTN-8820</div>
                <div class="text-[11px] text-slate-400">Передано курьеру доставки</div>
              </div>
            </div>
          </div>
        </div>

        <!-- STATUS SELECTION BUTTONS -->
        <div class="space-y-2 pt-2 border-t border-slate-100">
          <label class="block text-xs font-extrabold uppercase text-slate-400 tracking-wider">Изменить статус заказа:</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="st in ['Новый', 'Подтвержден', 'Оплачен', 'В доставке', 'Завершен', 'Претензия']"
              :key="st"
              type="button"
              @click="updateOrderStatus(selectedOrder.id, st)"
              :class="[
                'p-2.5 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer text-center',
                selectedOrder.status === st 
                  ? getStatusBadgeClasses(st)
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              ]"
            >
              <span :class="['w-2 h-2 rounded-full shrink-0', getStatusDotBgClass(st)]"></span>
              <span class="truncate">{{ st }}</span>
            </button>
          </div>
        </div>

        <!-- MODAL FOOTER CONTROLS -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
          <UButton 
            color="red" 
            variant="soft" 
            icon="i-lucide-trash-2" 
            @click="deleteOrder(selectedOrder.id)"
            size="sm"
            class="rounded-xl font-extrabold"
          >
            Удалить
          </UButton>

          <UButton 
            color="gray" 
            variant="solid" 
            @click="isOrderModalOpen = false"
            size="sm"
            class="rounded-xl font-extrabold"
          >
            Закрыть
          </UButton>
        </div>

      </div>
    </UModal>

    <!-- MOBILE FEEDBACK MODAL -->
    <UModal v-model="isFeedbackModalOpen">
      <div v-if="selectedFeedback" class="bg-white rounded-3xl p-5 space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 class="text-base font-bold text-slate-900">Обращение от {{ selectedFeedback.contact }}</h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" class="rounded-xl" @click="isFeedbackModalOpen = false" />
        </div>
        <div class="text-xs text-slate-400">{{ formatDate(selectedFeedback.date) }}</div>
        <div class="bg-slate-50 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
          {{ selectedFeedback.message }}
        </div>
      </div>
    </UModal>

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['admin-auth']
})

const localePath = useLocalePath()
const authStore = useAuthStore()
const toast = useToast()

const activeTab = ref(0)
const orderFilter = ref('Все')
const feedbackFilter = ref('Все')
const modalTab = ref('details')

// Modals state
const isOrderModalOpen = ref(false)
const selectedOrder = ref<any>(null)

const isFeedbackModalOpen = ref(false)
const selectedFeedback = ref<any>(null)

const uploading = ref(false)
const fileInput = ref<any>(null)

const p2pStages = [
  { key: 'CREATED', step: 1, name: '1. Создание заказа' },
  { key: 'CONFIRMED', step: 2, name: '2. Подтверждение поставщиком' },
  { key: 'RESERVED', step: 3, name: '3. Резервирование товара' },
  { key: 'INVOICED', step: 4, name: '4. Счет на оплату' },
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
      color: 'green',
      icon: 'i-lucide-git-commit'
    })
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
  },
  {
    id: 'ORD-503',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
    name: 'Стоматологический центр «Дент Плюс»',
    phone: '+7 (701) 555-12-34',
    contact: '+7 (701) 555-12-34',
    total: 135000,
    status: 'Завершен',
    p2pStage: 'COMPLETED',
    address: 'г. Шымкент, ул. Трасса 12',
    items: [
      { name: 'Ультразвуковой скайлер Woodpecker UDS-E', quantity: 1, price: 135000 }
    ]
  }
]

const { data: ordersData, pending: pendingOrders, refresh: refreshOrders } = await useAsyncData('operator-orders', async () => {
  let results: any[] = []
  try {
    const res = await $fetch('/api/v2/operator/orders/')
    results = Array.isArray((res as any)?.results) ? (res as any).results : (Array.isArray(res) ? res : [])
  } catch (e) {
    console.warn('[Operator] Orders fetch issue:', e)
  }

  if (import.meta.client) {
    try {
      const local = JSON.parse(localStorage.getItem('mock_orders') || '[]')
      if (local.length > 0) {
        const formattedLocal = local.map((o: any) => ({
          id: o.id,
          date: o.date || new Date().toISOString(),
          name: o.name || 'Стоматологическая клиника',
          phone: o.phone || '+7 (707) 123-45-67',
          contact: o.contact || o.phone || '+7 (707) 123-45-67',
          total: o.total || 0,
          status: normalizeStatus(o.status),
          p2pStage: o.p2pStage || 'CREATED',
          address: o.address || 'г. Алматы',
          items: o.items || []
        }))
        const existingIds = new Set(results.map((r: any) => String(r.id)))
        const newFromLocal = formattedLocal.filter((l: any) => !existingIds.has(String(l.id)))
        results = [...newFromLocal, ...results]
      }
    } catch(e) {}
  }

  if (!results || results.length === 0) {
    results = defaultOperatorOrders
  } else {
    const existingIds = new Set(results.map((r: any) => String(r.id)))
    const missingDefaults = defaultOperatorOrders.filter((d: any) => !existingIds.has(String(d.id)))
    results = [...results, ...missingDefaults]
  }

  return results.map((o: any) => ({
    ...o,
    status: normalizeStatus(o.status)
  }))
})

const orders = computed(() => Array.isArray(ordersData.value) ? ordersData.value : (ordersData.value?.results || []))

const { data: feedbacks, pending: pendingFeedbacks, refresh: refreshFeedbacks } = await useAsyncData('feedbacks', () => {
  if (authStore.isAuthenticated) return $fetch('/api/feedback')
  return []
}, { watch: [() => authStore.isAuthenticated] })

onMounted(() => {
  refreshOrders()
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
  if (feedbackFilter.value !== 'Все') list = list.filter(f => f.status === feedbackFilter.value)
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

function openOrderDetails(order: any) {
  selectedOrder.value = order
  modalTab.value = 'details'
  isOrderModalOpen.value = true
}

function openFeedbackDetails(feedback: any) {
  selectedFeedback.value = feedback
  isFeedbackModalOpen.value = true
}

function updateOrderStatus(id: string, newStatus: string) {
  try {
    if (ordersData.value) {
      const list = Array.isArray(ordersData.value) ? ordersData.value : (ordersData.value as any)?.results
      if (list) {
        const item = list.find((o: any) => String(o.id) === String(id))
        if (item) {
          item.status = newStatus
        }
      }
    }
    if (selectedOrder.value && String(selectedOrder.value.id) === String(id)) {
      selectedOrder.value.status = newStatus
    }
    if (import.meta.client) {
      const local = JSON.parse(localStorage.getItem('mock_orders') || '[]')
      const item = local.find((o: any) => String(o.id) === String(id))
      if (item) {
        item.status = newStatus
        localStorage.setItem('mock_orders', JSON.stringify(local))
      }
    }
    toast.add({ title: `Статус заказа изменен на "${newStatus}"`, color: 'green', icon: 'i-lucide-check-circle' })
  } catch (e) {
    console.error('Update status error', e)
  }
}

function deleteOrder(id: string) {
  if (!confirm(`Вы уверены, что хотите безвозвратно удалить заказ #${id}?`)) return
  try {
    if (import.meta.client) {
      const local = JSON.parse(localStorage.getItem('mock_orders') || '[]')
      const updated = local.filter((o: any) => String(o.id) !== String(id))
      localStorage.setItem('mock_orders', JSON.stringify(updated))
    }
    if (ordersData.value) {
      if (Array.isArray(ordersData.value)) {
        ordersData.value = ordersData.value.filter((o: any) => String(o.id) !== String(id))
      }
    }
    if (selectedOrder.value && String(selectedOrder.value.id) === String(id)) {
      isOrderModalOpen.value = false
    }
    toast.add({ title: 'Заказ успешно удален', color: 'gray', icon: 'i-lucide-trash' })
  } catch (e) {
    console.error('Delete order error', e)
  }
}

function downloadDoc(docName: string) {
  toast.add({ title: `Скачивание ${docName}...`, description: 'Файл успешно сгенерирован (PDF).', color: 'blue', icon: 'i-lucide-download' })
}

function shareDoc(docName: string) {
  toast.add({ title: `Отправка в WhatsApp: ${docName}`, description: 'Ссылка отправлена заказчику.', color: 'emerald', icon: 'i-lucide-share-2' })
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

function getStatusBadgeClasses(status: string) {
  switch (normalizeStatus(status)) {
    case 'Новый': return 'bg-orange-500 text-white border-orange-500 shadow-xs'
    case 'Подтвержден': return 'bg-blue-600 text-white border-blue-600 shadow-xs'
    case 'Оплачен': return 'bg-purple-600 text-white border-purple-600 shadow-xs'
    case 'В доставке': return 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
    case 'Завершен': return 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
    case 'Претензия': return 'bg-red-600 text-white border-red-600 shadow-xs'
    default: return 'bg-slate-600 text-white border-slate-600'
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
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiBaseUrl
    const url = `${baseUrl}/api/v2/operator/upload-catalog/`
    await $fetch(url, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Token ${authStore.token}` }
    })
    toast.add({ title: 'Файл отправлен на конвейер!', description: 'Каталог обновится автоматически.', color: 'green', icon: 'i-lucide-check-circle' })
  } catch (e: any) {
    toast.add({ title: 'Ошибка загрузки', description: e.message, color: 'red', icon: 'i-lucide-x-circle' })
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function logout() {
  authStore.logout()
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
