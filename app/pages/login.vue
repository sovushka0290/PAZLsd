<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col justify-center items-center py-12 px-4">
    <div class="w-full max-w-lg">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-3 mb-4">
          <div class="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-xl">
            P
          </div>
          <span class="text-2xl font-black text-slate-900 tracking-tight">PAZL MARKET</span>
        </NuxtLink>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ isStaffMode ? 'Служебный вход в систему' : 'Кабинет стоматологической клиники' }}
        </h1>
        <p class="mt-2 text-sm text-slate-500 font-medium">
          {{ isStaffMode ? 'Авторизация для операторов и администраторов платформы' : 'Оптовые цены, персональные условия и быстрая история заказов' }}
        </p>
      </div>

      <!-- Main Login Card -->
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 border border-slate-100 relative overflow-hidden">
        
        <!-- CLINIC QUICK LOGIN FORM -->
        <div v-if="!isStaffMode">
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
                  placeholder="+7 (___) ___-__-__"
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

        <!-- STAFF (OPERATOR / ADMIN) LOGIN FORM -->
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
                Пароль
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
        </div>

        <!-- Mode Toggle Footer -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            class="text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer"
            @click="isStaffMode = !isStaffMode"
          >
            {{ isStaffMode ? '← Назад ко входу для клиник' : '🔐 Служебный вход (Оператор / Админ)' }}
          </button>

          <NuxtLink :to="localePath('/')" class="text-slate-400 hover:text-slate-600 transition-colors">
            На главную
          </NuxtLink>
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

const isStaffMode = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const staffError = ref('')

const clinicForm = reactive({
  clinicName: '',
  phone: '',
  contactPerson: '',
  address: ''
})

const staffUsername = ref('')
const staffPassword = ref('')

onMounted(() => {
  // Try restoring saved profile from localStorage if any
  if (import.meta.client) {
    try {
      const saved = localStorage.getItem('pazl_clinic_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.clinicName) clinicForm.clinicName = parsed.clinicName
        if (parsed.phone) clinicForm.phone = parsed.phone
        if (parsed.contactPerson) clinicForm.contactPerson = parsed.contactPerson
        if (parsed.address) clinicForm.address = parsed.address
      }
    } catch {}
  }
})

function fillQuickProfile(clinic: string, phone: string, contact: string, address: string) {
  clinicForm.clinicName = clinic
  clinicForm.phone = phone
  clinicForm.contactPerson = contact
  clinicForm.address = address
  handleClinicLogin()
}

async function handleClinicLogin() {
  if (!clinicForm.clinicName.trim()) {
    errorMsg.value = 'Пожалуйста, введите название клиники'
    return
  }
  if (!clinicForm.phone.trim()) {
    errorMsg.value = 'Пожалуйста, укажите контактный телефон'
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

    await router.push(localePath('/cabinet'))
  } catch (err: any) {
    errorMsg.value = err.message || 'Ошибка входа в систему'
  } finally {
    isLoading.value = false
  }
}

async function handleStaffLogin() {
  if (!staffUsername.value.trim() || !staffPassword.value.trim()) {
    staffError.value = 'Введите логин и пароль'
    return
  }

  isLoading.value = true
  staffError.value = ''

  try {
    await authStore.login(staffUsername.value.trim(), staffPassword.value.trim())
    if (authStore.isAdmin) {
      await router.push(localePath('/admin'))
    } else if (authStore.isOperator) {
      await router.push(localePath('/operator'))
    } else {
      await router.push(localePath('/cabinet'))
    }
  } catch (err: any) {
    staffError.value = err.message || 'Неверный логин или пароль'
  } finally {
    isLoading.value = false
  }
}

useSeoMeta({
  title: 'Вход в личный кабинет клиники | PAZL',
})
</script>
