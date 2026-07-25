<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
          <span class="text-white font-bold text-xl">P</span>
        </div>
        <h2 class="text-3xl font-extrabold text-slate-900">
          Вход в панель управления
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          PAZL Dental Marketplace
        </p>
      </div>

      <UCard class="w-full" :ui="{ rounded: 'rounded-2xl', shadow: 'shadow-xl', body: { padding: 'p-8' } }">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <UFormField label="Логин" name="username">
            <UInput
              v-model="username"
              icon="i-lucide-user"
              placeholder="Введите ваш логин"
              size="xl"
              class="w-full"
              :ui="{ rounded: 'rounded-xl' }"
            />
          </UFormField>

          <UFormField label="Пароль" name="password">
            <UInput
              v-model="password"
              type="password"
              icon="i-lucide-lock"
              placeholder="Введите пароль"
              size="xl"
              class="w-full"
              :ui="{ rounded: 'rounded-xl' }"
            />
          </UFormField>

          <div v-if="errorMsg" class="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 flex items-center">
            <UIcon name="i-lucide-alert-circle" class="mr-2" />
            {{ errorMsg }}
          </div>

          <UButton
            type="submit"
            color="primary"
            block
            size="xl"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 shadow-md transition-all font-medium"
            :loading="isLoading"
          >
            Войти
          </UButton>
        </form>
        
        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <div class="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-widest mb-4">
            🔥 Демо-доступ без пароля
          </div>
          <p class="text-sm text-slate-500 mb-4 font-medium">Свободный вход для фаундера и инвесторов</p>
          <div class="flex flex-col gap-3">
            <button
              type="button"
              class="w-full py-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-sm rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all"
              @click="quickDemoLogin('admin')"
            >
              Войти как Администратор
            </button>
            <button
              type="button"
              class="w-full py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-sm rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-all"
              @click="quickDemoLogin('operator')"
            >
              Войти как Оператор
            </button>
          </div>
          
          <div class="mt-6">
            <NuxtLink
              :to="localePath('/docs')"
              class="inline-flex items-center justify-center w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all gap-2"
            >
              <span>📄</span> Читать полную тех. документацию
            </NuxtLink>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const router = useRouter()
const localePath = useLocalePath()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

onMounted(() => {
  authStore.initFromCookie()
  if (authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      router.push(localePath('/admin'))
    } else {
      router.push(localePath('/operator'))
    }
  }
})

async function quickDemoLogin(role: 'admin' | 'operator') {
  username.value = role === 'admin' ? 'admin' : 'operator'
  password.value = '123456'
  await handleLogin()
}

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMsg.value = 'Заполните все поля'
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    await authStore.login(username.value, password.value)
    if (authStore.isAdmin) {
      router.push(localePath('/admin'))
    } else {
      router.push(localePath('/operator'))
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'Ошибка входа'
  } finally {
    isLoading.value = false
  }
}

useSeoMeta({
  title: 'Вход | PAZL Admin',
  ogTitle: 'Вход | PAZL Admin'
})
</script>
