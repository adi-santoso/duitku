<template>
  <main class="relative min-h-screen overflow-hidden bg-canvas dark:bg-ink-950 p-4 sm:p-6 lg:p-8">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-violet/25 blur-3xl dark:bg-violet/15" />
      <div class="absolute -bottom-48 -left-48 h-[34rem] w-[34rem] rounded-full bg-lime/25 blur-3xl dark:bg-lime/10" />
    </div>

    <div class="relative mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1380px] overflow-hidden rounded-[32px] border border-ink-900/10 bg-surface/85 shadow-float backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/85 sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.08fr_.92fr]">
      <section class="relative hidden overflow-hidden bg-ink-900 p-10 text-white lg:flex lg:flex-col xl:p-14" aria-label="Tentang DuitKu">
        <div class="absolute -bottom-36 -right-28 h-96 w-96 rounded-full border-[56px] border-violet/50" />
        <div class="absolute right-40 top-16 h-36 w-36 rotate-12 rounded-[38px] bg-lime/10" />
        <div class="absolute bottom-40 left-16 h-24 w-24 -rotate-12 rounded-full border-[22px] border-coral/40" />

        <div class="relative flex items-center gap-3">
          <div class="grid h-11 w-11 -rotate-3 place-items-center rounded-[15px] rounded-bl-md bg-lime font-display text-xl font-extrabold text-ink-900">D</div>
          <div>
            <p class="font-display text-lg font-extrabold">DuitKu</p>
            <p class="text-[11px] text-slate-400">uang terasa ringan.</p>
          </div>
        </div>

        <div class="relative my-auto max-w-xl py-14">
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold text-slate-300">
            <span class="h-2 w-2 rounded-full bg-lime" /> Personal finance, made calm
          </span>
          <h1 class="mt-6 max-w-lg font-display text-5xl font-extrabold leading-[1.08] tracking-[-0.055em] xl:text-6xl">
            Lebih dekat dengan setiap <span class="text-lime">tujuanmu.</span>
          </h1>
          <p class="mt-6 max-w-md text-sm leading-7 text-slate-300">
            Satu ruang untuk memahami arus uang, menjaga anggaran, dan menumbuhkan tabungan bersama orang terdekat.
          </p>

          <div class="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div class="mb-4 grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink-900">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 18V9m7 9V5m7 13v-6" /></svg>
              </div>
              <strong class="block text-xs">Insight jelas</strong>
              <span class="mt-1 block text-[10px] leading-4 text-slate-400">Pahami pola tanpa spreadsheet rumit.</span>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div class="mb-4 grid h-9 w-9 place-items-center rounded-xl bg-coral text-white">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16v11H4zM8 7V5h8v2m-7 5h6" /></svg>
              </div>
              <strong class="block text-xs">Budget aman</strong>
              <span class="mt-1 block text-[10px] leading-4 text-slate-400">Peringatan sebelum pengeluaran berlebih.</span>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div class="mb-4 grid h-9 w-9 place-items-center rounded-xl bg-violet text-ink-900">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="8" stroke-width="1.8" /><circle cx="12" cy="12" r="2.5" stroke-width="1.8" /></svg>
              </div>
              <strong class="block text-xs">Target nyata</strong>
              <span class="mt-1 block text-[10px] leading-4 text-slate-400">Lihat progres tujuan dalam satu pandangan.</span>
            </div>
          </div>
        </div>

        <p class="relative text-[10px] text-slate-500">Data finansialmu hanya diakses melalui akunmu.</p>
      </section>

      <section class="relative flex items-center justify-center p-5 sm:p-10 lg:p-12 xl:p-16">
        <button
          type="button"
          class="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-2xl border border-ink-900/10 bg-surface/80 text-ink-700 transition-all hover:-translate-y-0.5 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200 sm:right-7 sm:top-7"
          :aria-label="isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
          :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
          @click="toggleDark"
        >
          <svg v-if="isDark" class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="3.5" stroke-width="1.8" /><path stroke-linecap="round" stroke-width="1.8" d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2m16.2-6.7-1.4 1.4M6.7 17.3l-1.4 1.4m13.4 0-1.4-1.4M6.7 6.7 5.3 5.3" /></svg>
          <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" /></svg>
        </button>

        <div class="w-full max-w-md animate-fade-in">
          <div class="mb-8 flex items-center gap-3 lg:hidden">
            <div class="grid h-11 w-11 -rotate-3 place-items-center rounded-[15px] rounded-bl-md bg-lime font-display text-xl font-extrabold text-ink-900">D</div>
            <div>
              <p class="font-display text-lg font-extrabold text-ink-900 dark:text-white">DuitKu</p>
              <p class="text-[11px] text-ink-500 dark:text-slate-400">uang terasa ringan.</p>
            </div>
          </div>

          <div class="mb-7">
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary-600 dark:text-lime">{{ mode === 'login' ? 'Selamat datang kembali' : 'Mulai perjalananmu' }}</p>
            <h2 class="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink-900 dark:text-white sm:text-4xl">
              {{ mode === 'login' ? 'Masuk ke ruang finansialmu.' : 'Buat akun DuitKu.' }}
            </h2>
            <p class="mt-3 text-sm leading-6 text-ink-500 dark:text-slate-400">
              {{ mode === 'login' ? 'Lanjutkan memantau progres dan keputusan keuanganmu.' : 'Mulai catat, atur, dan pahami uangmu dalam satu tempat.' }}
            </p>
          </div>

          <div class="mb-6 flex rounded-2xl bg-ink-900/[0.06] p-1.5 dark:bg-white/[0.06]" role="tablist" aria-label="Mode autentikasi">
            <button
              type="button"
              role="tab"
              :aria-selected="mode === 'login'"
              class="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all"
              :class="mode === 'login' ? 'bg-surface text-ink-900 shadow-sm dark:bg-ink-700 dark:text-white' : 'text-ink-500 hover:text-ink-900 dark:text-slate-400 dark:hover:text-white'"
              @click="setMode('login')"
            >Masuk</button>
            <button
              type="button"
              role="tab"
              :aria-selected="mode === 'register'"
              class="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all"
              :class="mode === 'register' ? 'bg-surface text-ink-900 shadow-sm dark:bg-ink-700 dark:text-white' : 'text-ink-500 hover:text-ink-900 dark:text-slate-400 dark:hover:text-white'"
              @click="setMode('register')"
            >Daftar</button>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label for="auth-email" class="mb-2 block text-xs font-bold text-ink-700 dark:text-slate-300">Email</label>
              <div class="relative">
                <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6" /></svg>
                <input id="auth-email" v-model.trim="email" type="email" class="input h-[52px] !rounded-2xl !border-ink-900/10 !bg-surface/70 pl-12 dark:!border-white/10 dark:!bg-ink-800/70" placeholder="nama@email.com" required autocomplete="email" :disabled="loading">
              </div>
            </div>

            <div>
              <label for="auth-password" class="mb-2 block text-xs font-bold text-ink-700 dark:text-slate-300">Password</label>
              <div class="relative">
                <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="5" y="10" width="14" height="10" rx="2" stroke-width="1.7" /><path stroke-linecap="round" stroke-width="1.7" d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" /></svg>
                <input id="auth-password" v-model="password" :type="showPassword ? 'text' : 'password'" class="input h-[52px] !rounded-2xl !border-ink-900/10 !bg-surface/70 px-12 dark:!border-white/10 dark:!bg-ink-800/70" placeholder="Minimal 6 karakter" required :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" minlength="6" :disabled="loading">
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-400 hover:text-ink-700 dark:hover:text-white" :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'" @click="showPassword = !showPassword">
                  <svg v-if="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" /><circle cx="12" cy="12" r="2.2" stroke-width="1.7" /></svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-width="1.7" d="m4 4 16 16M10.5 7.2A8.3 8.3 0 0 1 12 7c5.5 0 8.5 5 8.5 5a13 13 0 0 1-2.3 2.8M13.7 16.8A7.7 7.7 0 0 1 12 17c-5.5 0-8.5-5-8.5-5a13.5 13.5 0 0 1 2.4-2.9" /></svg>
                </button>
              </div>
            </div>

            <div v-if="mode === 'register'" class="animate-slide-up">
              <label for="auth-confirm-password" class="mb-2 block text-xs font-bold text-ink-700 dark:text-slate-300">Konfirmasi password</label>
              <div class="relative">
                <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="5" y="10" width="14" height="10" rx="2" stroke-width="1.7" /><path stroke-linecap="round" stroke-width="1.7" d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" /></svg>
                <input id="auth-confirm-password" v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" class="input h-[52px] !rounded-2xl !border-ink-900/10 !bg-surface/70 pl-12 dark:!border-white/10 dark:!bg-ink-800/70" placeholder="Ulangi password" required autocomplete="new-password" minlength="6" :disabled="loading">
              </div>
            </div>

            <div v-if="error" role="alert" class="flex items-start gap-2.5 rounded-2xl border border-coral/25 bg-coral/10 p-3 text-xs text-red-700 dark:text-red-300">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" stroke-width="2" /><path stroke-linecap="round" stroke-width="2" d="M12 8v5m0 3h.01" /></svg>{{ error }}
            </div>

            <button type="submit" class="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-ink-900 px-5 text-sm font-extrabold text-white shadow-lg shadow-ink-900/15 transition-all hover:-translate-y-0.5 hover:bg-ink-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-lime dark:text-ink-900 dark:hover:bg-primary-200" :disabled="loading">
              <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" /></svg>
              {{ loading ? 'Memproses...' : mode === 'login' ? 'Masuk ke DuitKu' : 'Buat akun' }}
              <svg v-if="!loading" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" /></svg>
            </button>
          </form>

          <p class="mt-7 text-center text-[11px] leading-5 text-ink-500 dark:text-slate-500">
            {{ mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?' }}
            <button type="button" class="ml-1 font-bold text-ink-900 hover:underline dark:text-lime" @click="setMode(mode === 'login' ? 'register' : 'login')">
              {{ mode === 'login' ? 'Daftar gratis' : 'Masuk sekarang' }}
            </button>
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useDarkMode } from '@/composables/useDarkMode'

const router = useRouter()
const { login, register } = useAuth()
const { isDark, toggleDark } = useDarkMode()

const mode = ref('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const setMode = (value) => {
  mode.value = value
  error.value = ''
  confirmPassword.value = ''
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

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

      await register(email.value, password.value)
    } else {
      await login(email.value, password.value)
    }

    router.push('/')
  } catch (err) {
    error.value = err.message || 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
