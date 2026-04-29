<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl" />
    </div>

    <div class="w-full max-w-sm relative z-10 animate-fade-in">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">DuitKu</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola keuangan dengan mudah</p>
      </div>

      <!-- Login/Register Card -->
      <div class="card">
        <!-- Tab Toggle -->
        <div class="flex mb-5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            @click="mode = 'login'"
            class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            :class="mode === 'login'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            Masuk
          </button>
          <button
            @click="mode = 'register'"
            class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            :class="mode === 'register'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            Daftar
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder="nama@email.com"
              required
              autocomplete="email"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder="Minimal 6 karakter"
              required
              autocomplete="current-password"
              minlength="6"
            />
          </div>

          <div v-if="mode === 'register'">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Konfirmasi Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="input"
              placeholder="Ulangi password"
              required
              autocomplete="new-password"
              minlength="6"
            />
          </div>

          <!-- Success message -->
          <div v-if="success" class="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ success }}
          </div>

          <!-- Error message -->
          <div v-if="error" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary w-full h-11" :disabled="loading">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ loading ? 'Memproses...' : (mode === 'login' ? 'Masuk' : 'Daftar') }}
          </button>
        </form>
      </div>

      <!-- Info -->
      <div class="mt-4 p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Info</p>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{ mode === 'login'
            ? 'Masuk dengan akun yang sudah terdaftar. Belum punya akun? Klik tab Daftar.'
            : 'Buat akun baru dengan email dan password. Password minimal 6 karakter.'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login, register } = useAuth()

const mode = ref('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    if (mode.value === 'register') {
      if (password.value !== confirmPassword.value) {
        error.value = 'Password tidak cocok'
        return
      }

      if (password.value.length < 6) {
        error.value = 'Password minimal 6 karakter'
        return
      }

      const data = await register(email.value, password.value)

      // Check if email confirmation is required
      if (data.user && !data.session) {
        success.value = 'Akun berhasil dibuat! Cek email untuk verifikasi.'
        mode.value = 'login'
      } else {
        // Auto-login after registration
        router.push('/')
      }
    } else {
      await login(email.value, password.value)
      router.push('/')
    }
  } catch (err) {
    if (err.message?.includes('Invalid login credentials')) {
      error.value = 'Email atau password salah'
    } else if (err.message?.includes('User already registered')) {
      error.value = 'Email sudah terdaftar'
    } else if (err.message?.includes('Password should be at least')) {
      error.value = 'Password minimal 6 karakter'
    } else {
      error.value = err.message || 'Terjadi kesalahan. Silakan coba lagi.'
    }
  } finally {
    loading.value = false
  }
}
</script>
