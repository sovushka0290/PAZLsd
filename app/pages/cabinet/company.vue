<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900">Данные клиники и реквизиты</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Информация используется для автоматического оформления заказов и накладных</p>
      </div>
      <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
        ✅ Верифицированная клиника
      </span>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
      <form class="space-y-6" @submit.prevent="handleSaveCompany">
        <!-- Section 1: Basic Info -->
        <div>
          <h2 class="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🏥</span> Основная информация
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Название клиники / организации <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.clinicName"
                type="text"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                БИН / ИИН клиники
              </label>
              <input
                v-model="form.bin"
                type="text"
                placeholder="12-значный номер"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Section 2: Contacts -->
        <div class="border-t border-slate-100 pt-6">
          <h2 class="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📱</span> Контактные данные
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Контактный телефон / WhatsApp <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Контактное лицо / Главный врач
              </label>
              <input
                v-model="form.contactPerson"
                type="text"
                placeholder="ФИО врача или снабженца"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Section 3: Delivery Address -->
        <div class="border-t border-slate-100 pt-6">
          <h2 class="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📍</span> Адрес доставки стоматологических материалов
          </h2>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Город, улица, дом, кабинет
            </label>
            <input
              v-model="form.address"
              type="text"
              placeholder="г. Алматы, пр. Абая 42, каб. 5"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div v-if="saveSuccess" class="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
          <span>✅</span>
          Данные клиники успешно сохранены и обновлены в профиле!
        </div>

        <div class="pt-4 flex items-center justify-end border-t border-slate-100">
          <button
            type="submit"
            :disabled="isSaving"
            class="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить данные' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'cabinet',
  middleware: 'cabinet-auth'
})

const authStore = useAuthStore()
const isSaving = ref(false)
const saveSuccess = ref(false)

const form = reactive({
  clinicName: '',
  phone: '',
  contactPerson: '',
  address: '',
  bin: ''
})

onMounted(() => {
  const u = authStore.user
  if (u) {
    form.clinicName = u.company_name || u.first_name || 'ТОО «Dent Smile»'
    form.phone = u.phone || '+7 (777) 123-45-67'
    form.contactPerson = u.last_name || 'Алихан Бактыбай'
    form.bin = (u as any).company_bin || '120940023412'
    form.address = (u as any).address || 'г. Алматы, ул. Абая 42, офис 5'
  }
})

async function handleSaveCompany() {
  isSaving.value = true
  saveSuccess.value = false
  try {
    await authStore.updateClinicProfile({
      clinicName: form.clinicName,
      phone: form.phone,
      contactPerson: form.contactPerson,
      address: form.address,
      bin: form.bin
    })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 4000)
  } catch (e) {
    console.error(e)
  } finally {
    isSaving.value = false
  }
}

useSeoMeta({
  title: 'Реквизиты и данные клиники | PAZL'
})
</script>
