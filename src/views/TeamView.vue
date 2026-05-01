<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">

    <!-- Staff Only: Info Banner -->
    <div v-if="isStaffUser" class="card border-l-4 border-l-amber-500">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-bold text-slate-900 dark:text-white">Anda login sebagai Staff</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Anda memiliki akses penuh untuk mengelola data keuangan (tambah, edit, hapus transaksi, kategori, dan anggaran).
            Hanya owner yang bisa mengelola akun staff.
          </p>
        </div>
      </div>
    </div>

    <!-- Owner: Staff Management -->
    <div v-if="!isStaffUser" class="card">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Kelola Staff</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Buat akun staff untuk mengelola keuangan bersama</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary text-xs !px-3 !py-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Buat Staff
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="staffList.length === 0 && !loading" class="text-center py-10">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Belum ada staff</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Buat akun staff agar orang lain bisa membantu mengelola keuangan Anda</p>
      </div>

      <!-- Loading -->
      <div v-else-if="loading && staffList.length === 0" class="text-center py-10">
        <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm text-slate-500 dark:text-slate-400">Memuat data...</p>
      </div>

      <!-- Staff List -->
      <div v-else class="space-y-2">
        <div
          v-for="staff in staffList"
          :key="staff.id"
          class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center">
              <span class="text-xs font-bold text-primary-600 dark:text-primary-400">
                {{ (staff.display_name || staff.email || '?').charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ staff.display_name || staff.email }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">
                {{ staff.email }}
                &middot; Dibuat {{ formatDate(staff.created_at) }}
              </p>
            </div>
          </div>
          <button
            @click="confirmRemoveStaff(staff)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Hapus staff"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
        <p class="text-xs text-blue-700 dark:text-blue-400">
          Staff memiliki akses penuh untuk mengelola transaksi, kategori, dan anggaran.
          Mereka tidak bisa menambah atau menghapus staff lain.
        </p>
      </div>
    </div>

    <!-- ==================== MODALS ==================== -->

    <!-- Create Staff Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeCreateModal"></div>
          <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 animate-slide-up">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Buat Akun Staff</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Staff akan bisa login dan mengelola data keuangan Anda</p>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nama (opsional)</label>
                <input v-model="newStaffName" type="text" class="input" placeholder="Nama staff" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                <input v-model="newStaffEmail" type="email" class="input" placeholder="email@contoh.com" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
                <input v-model="newStaffPassword" type="password" class="input" placeholder="Minimal 6 karakter" />
              </div>
            </div>
            <p v-if="modalError" class="text-xs text-red-500 mt-2">{{ modalError }}</p>
            <p v-if="modalSuccess" class="text-xs text-emerald-500 mt-2">{{ modalSuccess }}</p>
            <div class="flex items-center gap-2 mt-5">
              <button @click="closeCreateModal" class="btn btn-secondary flex-1">Tutup</button>
              <button @click="handleCreateStaff" class="btn btn-primary flex-1" :disabled="!newStaffEmail.trim() || !newStaffPassword || loading">
                {{ loading ? 'Membuat...' : 'Buat Staff' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Remove Staff Confirm Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showRemoveConfirm" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="showRemoveConfirm = false"></div>
          <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 animate-slide-up">
            <div class="text-center mb-4">
              <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Hapus Staff?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Akun "{{ staffToRemove?.display_name || staffToRemove?.email }}" akan dihapus permanen.
                Staff tidak akan bisa login lagi.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="showRemoveConfirm = false" class="btn btn-secondary flex-1">Batal</button>
              <button @click="handleRemoveStaff" class="btn btn-danger flex-1" :disabled="loading">
                {{ loading ? 'Menghapus...' : 'Hapus' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useStaff } from '@/composables/useStaff'

const { isOwner, isStaff: isStaffFn } = useAuth()
const { staffList, loading, loadStaff, createStaff, removeStaff } = useStaff()

const isStaffUser = computed(() => isStaffFn())

// Modals
const showCreateModal = ref(false)
const showRemoveConfirm = ref(false)

// Form data
const newStaffName = ref('')
const newStaffEmail = ref('')
const newStaffPassword = ref('')
const staffToRemove = ref(null)

// Modal feedback
const modalError = ref('')
const modalSuccess = ref('')

// Methods
const handleCreateStaff = async () => {
  if (!newStaffEmail.value.trim() || !newStaffPassword.value) return
  if (newStaffPassword.value.length < 6) {
    modalError.value = 'Password minimal 6 karakter'
    return
  }
  modalError.value = ''
  modalSuccess.value = ''
  try {
    await createStaff(
      newStaffEmail.value.trim(),
      newStaffPassword.value,
      newStaffName.value.trim() || null
    )
    modalSuccess.value = `Staff ${newStaffEmail.value} berhasil dibuat!`
    newStaffName.value = ''
    newStaffEmail.value = ''
    newStaffPassword.value = ''
  } catch (err) {
    modalError.value = err.message
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newStaffName.value = ''
  newStaffEmail.value = ''
  newStaffPassword.value = ''
  modalError.value = ''
  modalSuccess.value = ''
}

const confirmRemoveStaff = (staff) => {
  staffToRemove.value = staff
  showRemoveConfirm.value = true
}

const handleRemoveStaff = async () => {
  if (!staffToRemove.value) return
  try {
    await removeStaff(staffToRemove.value.id)
    showRemoveConfirm.value = false
    staffToRemove.value = null
  } catch (err) {
    // error handled in composable
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Init
onMounted(async () => {
  if (isOwner()) {
    await loadStaff()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
