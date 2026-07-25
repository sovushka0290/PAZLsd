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
          {{ t('auth.loginTitle') }}
        </h1>
        <p class="mt-2 text-slate-500">
          {{ t('auth.loginSubtitle') }}
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <form class="space-y-5" @submit.prevent="handleLogin">
          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.phone') }}
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">📱</span>
              <input
                v-model="phone"
                type="tel"
                :placeholder="t('auth.phonePlaceholder')"
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
                :placeholder="t('auth.passwordPlaceholder')"
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
              {{ t('auth.loggingIn') }}
            </span>
            <span v-else>{{ t('auth.loginButton') }}</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-6 pt-6 border-t border-slate-100 text-center">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Быстрый вход для презентации</p>
          <div class="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              class="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-all flex items-center justify-center gap-1"
              @click="quickDemoLogin('buyer')"
            >
              <span>🛒</span> Клиника
            </button>
            <button
              type="button"
              class="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-1"
              @click="quickDemoLogin('supplier')"
            >
              <span>🏭</span> Поставщик
            </button>
          </div>

          <p class="text-sm text-slate-500">
            {{ t('auth.noAccount') }}
            <NuxtLink
              :to="localePath('/register')"
              class="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {{ t('auth.registerLink') }}
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
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

onMounted(() => {
  authStore.initFromCookie()
  if (authStore.isAuthenticated) {
    redirectByRole()
  }
})

async function quickDemoLogin(role: 'buyer' | 'supplier') {
  phone.value = role === 'supplier' ? '+7 (707) 888-99-00' : '+7 (707) 777-66-55'
  password.value = '123456'
  await handleLogin()
}

function redirectByRole() {
  if (authStore.isAdmin) {
    router.push(localePath('/admin'))
  } else if (authStore.isOperator) {
    router.push(localePath('/operator'))
  } else if (authStore.isSupplier) {
    router.push(localePath('/supplier'))
  } else {
    router.push(localePath('/cabinet'))
  }
}

async function handleLogin() {
  if (!phone.value.trim() || !password.value) {
    errorMsg.value = t('auth.fillAllFields')
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    await authStore.loginByPhone(phone.value, password.value)
    redirectByRole()
  } catch (err: any) {
    const detail = err?.data?.detail || err?.message || t('auth.loginError')
    errorMsg.value = detail
  } finally {
    isLoading.value = false
  }
}

useSeoMeta({
  title: () => t('auth.loginTitle') + ' | PAZL',
  ogTitle: () => t('auth.loginTitle') + ' | PAZL'
})
</script>
