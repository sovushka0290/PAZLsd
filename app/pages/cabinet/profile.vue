<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">{{ t('auth.profile') }}</h1>
    </div>

    <!-- Personal Info -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 class="text-lg font-bold text-slate-900 mb-6">Личные данные</h2>
      <form class="space-y-6" @submit.prevent="handleSave">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- First Name -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              Имя
            </label>
            <input
              v-model="form.firstName"
              type="text"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
          </div>

          <!-- Last Name -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              Фамилия
            </label>
            <input
              v-model="form.lastName"
              type="text"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
          </div>

          <!-- Phone (disabled) -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              Телефон
            </label>
            <div class="flex gap-2">
              <input
                :value="user?.phone"
                type="text"
                disabled
                class="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-base text-slate-500 cursor-not-allowed"
              >
              <button
                v-if="!user?.phone_confirmed"
                type="button"
                class="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors whitespace-nowrap"
                @click="showSmsModal = true"
              >
                Подтвердить
              </button>
              <span
                v-else
                class="inline-flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium"
              >
                ✅ Подтвержден
              </span>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
          </div>
        </div>

        <div class="pt-4 flex items-center justify-end border-t border-slate-100">
          <span v-if="saveSuccess" class="text-green-600 mr-4 font-medium flex items-center gap-2">
            <span>✅</span> Сохранено
          </span>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Change Password -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 class="text-lg font-bold text-slate-900 mb-6">Смена пароля</h2>
      <form class="space-y-4" @submit.prevent="handleChangePassword">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            Текущий пароль
          </label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            Новый пароль
          </label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            minlength="6"
            class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            required
          >
          <p class="mt-1 text-xs text-slate-400">Минимум 6 символов</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            Подтвердите новый пароль
          </label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            minlength="6"
            class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            required
          >
        </div>

        <div v-if="passwordError" class="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
          {{ passwordError }}
        </div>
        <div v-if="passwordSuccess" class="p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
          ✅ Пароль успешно изменён
        </div>

        <div class="pt-4 flex justify-end border-t border-slate-100">
          <button
            type="submit"
            :disabled="isChangingPassword"
            class="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {{ isChangingPassword ? 'Сохранение...' : 'Изменить пароль' }}
          </button>
        </div>
      </form>
    </div>

    <!-- SMS Verification Modal -->
    <div v-if="showSmsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        <h2 class="text-xl font-bold text-slate-900 text-center mb-2">Подтвердите телефон</h2>
        <p class="text-sm text-slate-500 text-center mb-6">
          Введите код из SMS, отправленный на<br>
          <strong class="text-slate-700">{{ user?.phone }}</strong>
        </p>

        <div v-if="!smsSent" class="text-center">
          <button
            :disabled="isSendingSms"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
            @click="handleSendSms"
          >
            {{ isSendingSms ? 'Отправка...' : 'Отправить SMS-код' }}
          </button>
        </div>

        <template v-else>
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
        </template>

        <button
          class="w-full mt-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          @click="showSmsModal = false"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'cabinet',
  middleware: 'cabinet-auth'
})

const { t } = useI18n()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const isSaving = ref(false)
const saveSuccess = ref(false)

const form = reactive({
  firstName: user.value?.first_name || '',
  lastName: user.value?.last_name || '',
  email: user.value?.email || ''
})

// ── Save Profile ──────────────────────────────

async function handleSave() {
  isSaving.value = true
  saveSuccess.value = false
  try {
    await authStore.updateProfile({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email
    })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e) {
    alert('Ошибка при сохранении профиля')
  } finally {
    isSaving.value = false
  }
}

// ── Change Password ───────────────────────────

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const isChangingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = false

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Пароли не совпадают'
    return
  }
  if (passwordForm.newPassword.length < 6) {
    passwordError.value = 'Минимум 6 символов'
    return
  }

  isChangingPassword.value = true
  try {
    await authStore.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
    passwordSuccess.value = true
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    setTimeout(() => { passwordSuccess.value = false }, 5000)
  } catch (err: any) {
    passwordError.value = err?.data?.detail || 'Ошибка при смене пароля'
  } finally {
    isChangingPassword.value = false
  }
}

// ── SMS Verification ──────────────────────────

const showSmsModal = ref(false)
const smsSent = ref(false)
const isSendingSms = ref(false)
const smsInputRefs = ref<HTMLInputElement[]>([])
const smsDigits = ref<string[]>(['', '', '', ''])
const smsError = ref('')
const isVerifying = ref(false)

const smsCode = computed(() => smsDigits.value.join(''))

async function handleSendSms() {
  isSendingSms.value = true
  try {
    await authStore.sendSmsCode(user.value?.phone || '')
    smsSent.value = true
    nextTick(() => {
      smsInputRefs.value[0]?.focus()
    })
  } catch {
    smsError.value = 'Не удалось отправить SMS'
  } finally {
    isSendingSms.value = false
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

function onSmsBackspace(idx: number, _event: KeyboardEvent) {
  if (!smsDigits.value[idx] && idx > 0) {
    smsInputRefs.value[idx - 1]?.focus()
  }
}

async function handleVerifySms() {
  isVerifying.value = true
  smsError.value = ''
  try {
    const result = await authStore.verifySmsCode(user.value?.phone || '', smsCode.value)
    if (result.verified) {
      showSmsModal.value = false
      smsSent.value = false
      smsDigits.value = ['', '', '', '']
    } else {
      smsError.value = 'Неверный код'
    }
  } catch {
    smsError.value = 'Ошибка проверки кода'
  } finally {
    isVerifying.value = false
  }
}
</script>
