<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col justify-center items-center py-12 px-4">
    <div class="w-full max-w-xl">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-3 mb-4">
          <div class="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-xl">
            P
          </div>
          <span class="text-2xl font-black text-slate-900 tracking-tight">PAZL MARKET</span>
        </NuxtLink>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ activeTab === 'buyer' ? 'Кабинет стоматологической клиники' : activeTab === 'supplier' ? 'Кабинет поставщика / дистрибьютора' : 'Служебный вход в систему' }}
        </h1>
        <p class="mt-2 text-sm text-slate-500 font-medium">
          {{ activeTab === 'buyer' ? 'Оптовые цены, персональные условия и быстрая история заказов' : activeTab === 'supplier' ? 'Загрузка прайс-листов, модерация и продажа клиникам Казахстана' : 'Авторизация для операторов и администраторов платформы' }}
        </p>
      </div>

      <!-- Tab Switcher -->
      <div class="flex bg-slate-200/80 p-1 rounded-2xl mb-4">
        <button
          type="button"
          @click="activeTab = 'buyer'"
          :class="[
            'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5',
            activeTab === 'buyer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <span>🏥</span> Клиника
        </button>

        <button
          type="button"
          @click="activeTab = 'supplier'"
          :class="[
            'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5',
            activeTab === 'supplier' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <span>🏢</span> Поставщик
        </button>

        <button
          type="button"
          @click="activeTab = 'staff'"
          :class="[
            'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5',
            activeTab === 'staff' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <span>🔐</span> Персонал
        </button>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 border border-slate-100 relative overflow-hidden">
        
        <!-- 1. CLINIC (BUYER) LOGIN FORM -->
        <div v-if="activeTab === 'buyer'">
          <form class="space-y-4" @submit.prevent="handleClinicLogin">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Название клиники или стоматологии <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🏥</span>
                <input
                  v-model="clinicForm.clinicName"
                  type="text"
                  placeholder="Например: Стоматология «Dent Smile»"
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Контактный телефон / WhatsApp <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">📱</span>
                <input
                  v-model="clinicForm.phone"
                  type="tel"
                  placeholder="+7 (707) 123-45-67"
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Контактное лицо / Врач
                </label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">👤</span>
                  <input
                    v-model="clinicForm.contactPerson"
                    type="text"
                    placeholder="Др. Асан"
                    class="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Город / Адрес доставки
                </label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">📍</span>
                  <input
                    v-model="clinicForm.address"
                    type="text"
                    placeholder="г. Алматы, ул. Абая 42"
                    class="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div v-if="errorMsg" class="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
              <span>⚠️</span>
              {{ errorMsg }}
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-2"
            >
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
                Вход в кабинет...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                Войти в кабинет клиники →
              </span>
            </button>
          </form>

          <!-- Quick 1-click test profiles -->
          <div class="mt-6 pt-5 border-t border-slate-100">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Быстрый вход для тестирования:
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                @click="fillQuickProfile('ТОО «Dent Smile»', '+7 (777) 123-45-67', 'Алихан Бактыбай', 'г. Алматы, пр. Абая 42')"
                class="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all text-xs cursor-pointer group"
              >
                <div class="font-bold text-slate-800 group-hover:text-blue-600">ТОО «Dent Smile»</div>
                <div class="text-[11px] text-slate-400">+7 (777) 123-45-67</div>
              </button>

              <button
                type="button"
                @click="fillQuickProfile('Стоматология «Ару Дент»', '+7 (701) 987-65-43', 'Др. Айгерим', 'г. Астана, ул. Достык 10')"
                class="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all text-xs cursor-pointer group"
              >
                <div class="font-bold text-slate-800 group-hover:text-blue-600">«Ару Дент» (Астана)</div>
                <div class="text-[11px] text-slate-400">+7 (701) 987-65-43</div>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. SUPPLIER APPLICATION & LOGIN FORM -->
        <div v-else-if="activeTab === 'supplier'">
          <!-- Success Notice Modal / Banner if submitted -->
          <div v-if="supplierSubmitted" class="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl text-center space-y-4 animate-in fade-in">
            <div class="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ⏳
            </div>
            <h3 class="text-lg font-black text-amber-900 leading-tight">
              Заявка на регистрацию принята!
            </h3>
            <p class="text-sm font-semibold text-amber-800 leading-relaxed">
              Пожалуйста, зайдите на сайт с этим же номером телефона <span class="underline font-black">в течение 20 минут - 1 часа</span>. Наш администратор проверит заявку и откроет доступ к загрузке товаров.
            </p>
            <div class="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                @click="supplierSubmitted = false; enterAsDemoSupplier()"
                class="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Войти прямо сейчас (Демо-поставщик)
              </button>
              <button
                type="button"
                @click="supplierSubmitted = false"
                class="px-4 py-3 bg-white border border-amber-300 text-amber-800 font-bold text-xs rounded-xl hover:bg-amber-100 transition-all cursor-pointer"
              >
                Подать новую заявку
              </button>
            </div>
          </div>

          <form v-else class="space-y-4" @submit.prevent="handleSupplierRegister">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Название компании / ИП <span class="text-red-500">*</span>
              </label>
              <input
                v-model="supplierForm.companyName"
                type="text"
                placeholder="ТОО «Стома-Депо» или ИП Dental Pro"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  БИН / ИИН компании <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="supplierForm.bin"
                  type="text"
                  placeholder="120940023412"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Контактный телефон <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="supplierForm.phone"
                  type="tel"
                  placeholder="+7 (705) 111-22-33"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Контактное лицо
                </label>
                <input
                  v-model="supplierForm.contactPerson"
                  type="text"
                  placeholder="Имя Фамилия"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  v-model="supplierForm.email"
                  type="email"
                  placeholder="sales@supplier.kz"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Направление товаров / Категории
              </label>
              <input
                v-model="supplierForm.categories"
                type="text"
                placeholder="Терапия, Оборудование, Инструменты, Ортодонтия"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div v-if="supplierError" class="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100">
              {{ supplierError }}
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              {{ isLoading ? 'Отправка заявки...' : 'Подать заявку на регистрацию поставщика' }}
            </button>

            <!-- Quick enter for approved supplier -->
            <div class="pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                @click="enterAsDemoSupplier"
                class="text-xs font-extrabold text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                ⚡ Уже зарегистрированы? Войти в кабинет поставщика
              </button>
            </div>
          </form>
        </div>

        <!-- 3. STAFF (OPERATOR / ADMIN) LOGIN FORM -->
        <div v-else>
          <form class="space-y-4" @submit.prevent="handleStaffLogin">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Логин сотрудника
              </label>
              <input
                v-model="staffUsername"
                type="text"
                placeholder="admin или operator"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Пароль (Админ: 321 или admin123)
              </label>
              <input
                v-model="staffPassword"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div v-if="staffError" class="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100">
              {{ staffError }}
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md cursor-pointer"
            >
              {{ isLoading ? 'Вход...' : 'Войти в панель управления' }}
            </button>
          </form>

          <div class="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="quickStaffLogin('operator')"
              class="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-center transition-all text-xs font-bold text-slate-800 hover:text-indigo-700 cursor-pointer"
            >
              🛠️ Войти как Оператор
            </button>
            <button
              type="button"
              @click="quickStaffLogin('admin')"
              class="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-center transition-all text-xs font-bold text-slate-800 hover:text-blue-700 cursor-pointer"
            >
              👑 Войти как Администратор
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <NuxtLink :to="localePath('/')" class="text-blue-600 hover:text-blue-800 font-bold transition-colors">
            ← Вернуться в каталог
          </NuxtLink>
          <span class="text-slate-400">PAZL B2B Dental Platform</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref<'buyer' | 'supplier' | 'staff'>('buyer')
const isLoading = ref(false)
const errorMsg = ref('')
const staffError = ref('')
const supplierError = ref('')
const supplierSubmitted = ref(false)

const clinicForm = reactive({
  clinicName: '',
  phone: '',
  contactPerson: '',
  address: ''
})

const supplierForm = reactive({
  companyName: '',
  bin: '',
  phone: '',
  contactPerson: '',
  email: '',
  categories: ''
})

const staffUsername = ref('')
const staffPassword = ref('')

onMounted(() => {
  authStore.initFromCookie()
  const savedClinic = localStorage.getItem('pazl_clinic_profile')
  if (savedClinic) {
    try {
      const parsed = JSON.parse(savedClinic)
      clinicForm.clinicName = parsed.clinicName || ''
      clinicForm.phone = parsed.phone || ''
      clinicForm.contactPerson = parsed.contactPerson || ''
      clinicForm.address = parsed.address || ''
    } catch {}
  }
})

function fillQuickProfile(clinicName: string, phone: string, contactPerson: string, address: string) {
  clinicForm.clinicName = clinicName
  clinicForm.phone = phone
  clinicForm.contactPerson = contactPerson
  clinicForm.address = address
}

async function handleClinicLogin() {
  if (!clinicForm.clinicName || !clinicForm.phone) {
    errorMsg.value = 'Пожалуйста, заполните название клиники и телефон'
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    await authStore.loginClinic({
      clinicName: clinicForm.clinicName,
      phone: clinicForm.phone,
      contactPerson: clinicForm.contactPerson,
      address: clinicForm.address
    })
    router.push(localePath('/cabinet'))
  } catch (err: any) {
    errorMsg.value = err.message || 'Ошибка входа в кабинет клиники'
  } finally {
    isLoading.value = false
  }
}

async function handleSupplierRegister() {
  if (!supplierForm.companyName || !supplierForm.phone || !supplierForm.bin) {
    supplierError.value = 'Заполните название компании, БИН и номер телефона'
    return
  }

  isLoading.value = true
  supplierError.value = ''

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/supplier/register', {
      method: 'POST',
      body: {
        companyName: supplierForm.companyName,
        bin: supplierForm.bin,
        phone: supplierForm.phone,
        contactPerson: supplierForm.contactPerson,
        email: supplierForm.email,
        categories: supplierForm.categories
      }
    })

    if (res.success) {
      supplierSubmitted.value = true
    }
  } catch (err: any) {
    supplierError.value = err.message || 'Ошибка отправки заявки'
  } finally {
    isLoading.value = false
  }
}

async function enterAsDemoSupplier() {
  authStore.token = 'mock_supplier_token'
  authStore.refreshToken = 'mock_supplier_refresh'
  authStore.user = {
    id: 103,
    phone: supplierForm.phone || '+7 (705) 111-22-33',
    first_name: supplierForm.companyName || 'ТОО «Альянс-Дент»',
    last_name: supplierForm.contactPerson || 'Максим Ким',
    email: supplierForm.email || 'alyans@dent.kz',
    role: 'supplier',
    phone_confirmed: true,
    company_name: supplierForm.companyName || 'ТОО «Альянс-Дент»',
    company_bin: supplierForm.bin || '150940003412',
    current_contractor_id: 103
  }
  authStore._saveToCookies()
  router.push(localePath('/supplier'))
}

async function handleStaffLogin() {
  staffError.value = ''
  isLoading.value = true

  const u = staffUsername.value.trim().toLowerCase()
  const p = staffPassword.value.trim()

  // Support password '321', 'admin123', '81726354'
  if ((u === 'admin' || u === 'админ') && (p === '321' || p === 'admin123' || p === '123' || p === '81726354')) {
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
    router.push(localePath('/admin'))
    isLoading.value = false
    return
  }

  if ((u === 'operator' || u === 'оператор' || u.startsWith('oper')) && (p === '123' || p === '123456' || p === 'operator' || p === '321')) {
    authStore.token = 'mock_operator_token'
    authStore.refreshToken = 'mock_operator_refresh'
    authStore.user = {
      id: 2,
      phone: '+7 (700) 000-00-02',
      first_name: 'Оператор Каталога',
      last_name: '',
      email: 'operator@pazl.kz',
      role: 'operator',
      phone_confirmed: true
    }
    authStore._saveToCookies()
    router.push(localePath('/operator'))
    isLoading.value = false
    return
  }

  try {
    await authStore.login(staffUsername.value, staffPassword.value)
    if (authStore.isAdmin) {
      router.push(localePath('/admin'))
    } else {
      router.push(localePath('/operator'))
    }
  } catch (err: any) {
    staffError.value = err.message || 'Неверный логин или пароль сотрудника'
  } finally {
    isLoading.value = false
  }
}

async function quickStaffLogin(role: 'admin' | 'operator') {
  staffUsername.value = role
  staffPassword.value = role === 'admin' ? '321' : '123456'
  await handleStaffLogin()
}

useSeoMeta({
  title: 'Вход в личный кабинет | PAZL Marketplace',
  ogTitle: 'Вход в личный кабинет | PAZL Marketplace'
})
</script>
