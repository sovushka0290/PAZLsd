<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col justify-center items-center py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Logo & Title -->
      <div class="text-center mb-8">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-3 mb-6">
          <div class="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-xl">P</span>
          </div>
          <span class="text-2xl font-bold text-slate-900">PAZL</span>
        </NuxtLink>
        <h1 class="text-3xl font-extrabold text-slate-900">
          {{ t('auth.registerTitle') }}
        </h1>
        <p class="mt-2 text-slate-500">
          {{ t('auth.registerSubtitle') }}
        </p>
      </div>

      <!-- Registration Form -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <!-- Role Toggle -->
        <div class="flex rounded-xl bg-slate-100 p-1 mb-6">
          <button
            type="button"
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all"
            :class="[
              role === 'buyer'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            ]"
            @click="role = 'buyer'"
          >
            🛒 Покупатель
          </button>
          <button
            type="button"
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all"
            :class="[
              role === 'supplier'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            ]"
            @click="role = 'supplier'"
          >
            🏭 Поставщик
          </button>
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.firstName') }}
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">👤</span>
              <input
                v-model="firstName"
                type="text"
                :placeholder="t('auth.firstNamePlaceholder')"
                class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                required
              >
            </div>
          </div>

          <!-- Supplier-only fields -->
          <template v-if="role === 'supplier'">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Название компании
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🏢</span>
                <input
                  v-model="companyName"
                  type="text"
                  placeholder="ТОО «Дентал Групп»"
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  required
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                БИН компании
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">📋</span>
                <input
                  v-model="companyBin"
                  type="text"
                  placeholder="123456789012"
                  maxlength="12"
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  required
                >
              </div>
            </div>

            <!-- Upload Document -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Документ компании (Справка / Лицензия)
              </label>
              <div class="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  class="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-1.5"
                  @change="handleFileUpload"
                >
              </div>
              <p v-if="docFileName" class="mt-1 text-xs text-green-600 font-medium">
                📄 Прикреплен: {{ docFileName }}
              </p>
            </div>
          </template>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              Логин (Телефон)
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">📱</span>
              <input
                v-model="phone"
                type="text"
                placeholder="Например: +7 777 123 45 67"
                class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                required
              >
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.password') }}
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔒</span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('auth.createPasswordPlaceholder')"
                minlength="6"
                class="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                required
              >
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
            <p class="mt-1 text-xs text-slate-400">{{ t('auth.minPassword') }}</p>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 flex items-center gap-2">
            <span>⚠️</span>
            {{ errorMsg }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ t('auth.registering') }}
            </span>
            <span v-else>{{ t('auth.registerButton') }}</span>
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-slate-100 text-center">
          <p class="text-sm text-slate-500">
            {{ t('auth.hasAccount') }}
            <NuxtLink
              :to="localePath('/login')"
              class="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {{ t('auth.loginLink') }}
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Back to store -->
      <div class="mt-6 text-center">
        <NuxtLink
          :to="localePath('/')"
          class="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← {{ t('auth.backToStore') }}
        </NuxtLink>
      </div>
    </div>

    <!-- SMS Verification Modal -->
    <div v-if="showSmsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        <h2 class="text-xl font-bold text-slate-900 text-center mb-2">Подтвердите телефон</h2>
        <p class="text-sm text-slate-500 text-center mb-6">
          Мы отправили SMS с кодом на номер<br>
          <strong class="text-slate-700">{{ phone }}</strong>
        </p>

        <div class="flex justify-center gap-2 mb-6">
          <input
            v-for="i in 4"
            :key="i"
            :ref="(el) => { if (el) smsInputRefs[i - 1] = el as HTMLInputElement }"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
            @input="onSmsInput(i - 1, $event)"
            @keydown.backspace="onSmsBackspace(i - 1, $event)"
          >
        </div>

        <div v-if="smsError" class="p-3 bg-red-50 text-red-700 rounded-xl text-sm mb-4 text-center">
          {{ smsError }}
        </div>

        <button
          :disabled="smsCode.length < 4 || isVerifying"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          @click="handleVerifySms"
        >
          {{ isVerifying ? 'Проверка...' : 'Подтвердить' }}
        </button>

        <button
          class="w-full mt-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          @click="skipSmsVerification"
        >
          Пропустить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const role = ref<'buyer' | 'supplier'>(
  (route.query.role as string) === 'supplier' ? 'supplier' : 'buyer'
)
const firstName = ref('')
const phone = ref('')
const password = ref('')
const companyName = ref('')
const companyBin = ref('')
const docFileName = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    docFileName.value = target.files[0].name
  }
}

// SMS modal state
const showSmsModal = ref(false)
const smsInputRefs = ref<HTMLInputElement[]>([])
const smsDigits = ref<string[]>(['', '', '', ''])
const smsError = ref('')
const isVerifying = ref(false)

const smsCode = computed(() => smsDigits.value.join(''))

onMounted(() => {
  authStore.initFromCookie()
  if (authStore.isAuthenticated) {
    router.push(localePath('/cabinet'))
  }
})

async function handleRegister() {
  if (!firstName.value.trim() || !phone.value.trim() || !password.value) {
    errorMsg.value = t('auth.fillAllFields')
    return
  }
  if (role.value === 'supplier' && (!companyName.value.trim() || !companyBin.value.trim())) {
    errorMsg.value = 'Заполните все поля компании'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = t('auth.minPassword')
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    if (role.value === 'supplier') {
      await authStore.registerSupplier(
        phone.value,
        password.value,
        companyName.value,
        companyBin.value,
        docFileName.value || 'Справка_госрегистрация.pdf'
      )
    } else {
      await authStore.register(phone.value, password.value, firstName.value)
    }

    // Direct login without 2FA SMS verification requirement
    goToCabinet()
  } catch (err: any) {
    const detail = err?.data?.detail || err?.message || t('auth.registerError')
    errorMsg.value = detail
  } finally {
    isLoading.value = false
  }
}

function onSmsInput(idx: number, event: Event) {
  const input = event.target as HTMLInputElement
  const val = input.value.replace(/\D/g, '')
  smsDigits.value[idx] = val
  input.value = val

  if (val && idx < 3) {
    smsInputRefs.value[idx + 1]?.focus()
  }
}

function onSmsBackspace(idx: number, event: KeyboardEvent) {
  if (!smsDigits.value[idx] && idx > 0) {
    smsInputRefs.value[idx - 1]?.focus()
  }
}

async function handleVerifySms() {
  isVerifying.value = true
  smsError.value = ''
  try {
    const result = await authStore.verifySmsCode(phone.value, smsCode.value)
    if (result.verified) {
      goToCabinet()
    } else {
      smsError.value = 'Неверный код. Попробуйте ещё раз.'
    }
  } catch {
    smsError.value = 'Ошибка проверки кода'
  } finally {
    isVerifying.value = false
  }
}

function skipSmsVerification() {
  showSmsModal.value = false
  goToCabinet()
}

function goToCabinet() {
  const target = role.value === 'supplier' ? '/supplier' : '/cabinet'
  router.push(localePath(target))
}

useSeoMeta({
  title: () => t('auth.registerTitle') + ' | PAZL',
  ogTitle: () => t('auth.registerTitle') + ' | PAZL'
})
</script>
