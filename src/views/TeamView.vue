<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">

    <!-- My Teams -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Tim Saya</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Kelola tim dan anggota keuangan bersama</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary text-xs !px-3 !py-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Buat Tim
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="teams.length === 0 && !loading" class="text-center py-10">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Belum ada tim</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Buat tim untuk mulai mengelola keuangan bersama</p>
      </div>

      <!-- Loading -->
      <div v-else-if="loading && teams.length === 0" class="text-center py-10">
        <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm text-slate-500 dark:text-slate-400">Memuat tim...</p>
      </div>

      <!-- Team List -->
      <div v-else class="space-y-2">
        <button
          v-for="team in teams"
          :key="team.id"
          @click="selectTeam(team)"
          class="w-full flex items-center justify-between p-3 rounded-xl transition-colors group"
          :class="selectedTeam?.id === team.id
            ? 'bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              :class="selectedTeam?.id === team.id
                ? 'bg-primary-500'
                : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-primary-400 dark:group-hover:bg-primary-600'"
            >
              {{ team.name.charAt(0).toUpperCase() }}
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ team.name }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">
                {{ team.myRole === 'owner' ? 'Pemilik' : 'Anggota' }}
                <span v-if="team.description"> &middot; {{ team.description }}</span>
              </p>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Team Detail -->
    <template v-if="selectedTeam">
      <!-- Team Info & Actions -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ selectedTeam.name }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ selectedTeam.description || 'Tidak ada deskripsi' }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="isOwner"
              @click="showEditModal = true"
              class="btn btn-ghost text-xs !px-2.5 !py-1.5"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit
            </button>
            <button
              v-if="isOwner"
              @click="showDeleteConfirm = true"
              class="btn btn-ghost text-xs !px-2.5 !py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Hapus
            </button>
            <button
              v-if="!isOwner"
              @click="showLeaveConfirm = true"
              class="btn btn-ghost text-xs !px-2.5 !py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              Keluar Tim
            </button>
          </div>
        </div>
      </div>

      <!-- Members Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Anggota ({{ teamMembers.length }})</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Daftar anggota tim</p>
          </div>
          <div v-if="isOwner" class="flex items-center gap-2">
            <button
              @click="showAddMemberModal = true"
              class="btn btn-secondary text-xs !px-3 !py-1.5"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              Tambah
            </button>
            <button
              @click="showCreateAccountModal = true"
              class="btn btn-primary text-xs !px-3 !py-1.5"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Buat Akun
            </button>
          </div>
        </div>

        <!-- Member List -->
        <div class="space-y-2">
          <div
            v-for="member in teamMembers"
            :key="member.id"
            class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center">
                <span class="text-xs font-bold text-primary-600 dark:text-primary-400">
                  {{ (member.email || '?').charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ member.email }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500">
                  {{ member.role === 'owner' ? 'Pemilik' : 'Anggota' }}
                  &middot; Bergabung {{ formatDate(member.joined_at) }}
                </p>
              </div>
            </div>
            <button
              v-if="isOwner && member.role !== 'owner'"
              @click="confirmRemoveMember(member)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Hapus anggota"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== MODALS ==================== -->

    <!-- Create Team Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="showCreateModal = false"></div>
          <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 animate-slide-up">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">Buat Tim Baru</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nama Tim</label>
                <input v-model="newTeamName" type="text" class="input" placeholder="Contoh: Keluarga, Bisnis..." @keyup.enter="handleCreateTeam" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Deskripsi (opsional)</label>
                <input v-model="newTeamDescription" type="text" class="input" placeholder="Deskripsi singkat" />
              </div>
            </div>
            <div class="flex items-center gap-2 mt-5">
              <button @click="showCreateModal = false" class="btn btn-secondary flex-1">Batal</button>
              <button @click="handleCreateTeam" class="btn btn-primary flex-1" :disabled="!newTeamName.trim() || loading">
                {{ loading ? 'Membuat...' : 'Buat Tim' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Edit Team Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showEditModal" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="showEditModal = false"></div>
          <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 animate-slide-up">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">Edit Tim</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nama Tim</label>
                <input v-model="editTeamName" type="text" class="input" placeholder="Nama tim" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Deskripsi</label>
                <input v-model="editTeamDescription" type="text" class="input" placeholder="Deskripsi tim" />
              </div>
            </div>
            <div class="flex items-center gap-2 mt-5">
              <button @click="showEditModal = false" class="btn btn-secondary flex-1">Batal</button>
              <button @click="handleUpdateTeam" class="btn btn-primary flex-1" :disabled="!editTeamName.trim() || loading">
                {{ loading ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Add Member Modal (existing user by email) -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showAddMemberModal" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeAddMemberModal"></div>
          <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 animate-slide-up">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Tambah Anggota</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Masukkan email user yang sudah terdaftar di DuitKu</p>
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
              <input v-model="addMemberEmail" type="email" class="input" placeholder="contoh@email.com" @keyup.enter="handleAddMember" />
            </div>
            <p v-if="modalError" class="text-xs text-red-500 mt-2">{{ modalError }}</p>
            <p v-if="modalSuccess" class="text-xs text-emerald-500 mt-2">{{ modalSuccess }}</p>
            <div class="flex items-center gap-2 mt-5">
              <button @click="closeAddMemberModal" class="btn btn-secondary flex-1">Tutup</button>
              <button @click="handleAddMember" class="btn btn-primary flex-1" :disabled="!addMemberEmail.trim() || loading">
                {{ loading ? 'Menambahkan...' : 'Tambah' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Create Account Modal (new user) -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showCreateAccountModal" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeCreateAccountModal"></div>
          <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 animate-slide-up">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Buat Akun Anggota</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Buat akun baru dan langsung masuk ke tim</p>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                <input v-model="newAccountEmail" type="email" class="input" placeholder="email@contoh.com" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
                <input v-model="newAccountPassword" type="password" class="input" placeholder="Minimal 6 karakter" />
              </div>
            </div>
            <p v-if="modalError" class="text-xs text-red-500 mt-2">{{ modalError }}</p>
            <p v-if="modalSuccess" class="text-xs text-emerald-500 mt-2">{{ modalSuccess }}</p>
            <div class="flex items-center gap-2 mt-5">
              <button @click="closeCreateAccountModal" class="btn btn-secondary flex-1">Tutup</button>
              <button @click="handleCreateAccount" class="btn btn-primary flex-1" :disabled="!newAccountEmail.trim() || !newAccountPassword || loading">
                {{ loading ? 'Membuat...' : 'Buat & Tambah' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Delete Team Confirm Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteConfirm = false"></div>
          <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 animate-slide-up">
            <div class="text-center mb-4">
              <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Hapus Tim?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Tim "{{ selectedTeam?.name }}" dan semua datanya akan dihapus permanen.</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="showDeleteConfirm = false" class="btn btn-secondary flex-1">Batal</button>
              <button @click="handleDeleteTeam" class="btn btn-danger flex-1" :disabled="loading">
                {{ loading ? 'Menghapus...' : 'Hapus' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Leave Team Confirm Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showLeaveConfirm" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="showLeaveConfirm = false"></div>
          <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 animate-slide-up">
            <div class="text-center mb-4">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Keluar dari Tim?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Kamu akan keluar dari tim "{{ selectedTeam?.name }}".</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="showLeaveConfirm = false" class="btn btn-secondary flex-1">Batal</button>
              <button @click="handleLeaveTeam" class="btn btn-danger flex-1" :disabled="loading">
                {{ loading ? 'Keluar...' : 'Keluar' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Remove Member Confirm Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showRemoveConfirm" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="showRemoveConfirm = false"></div>
          <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 animate-slide-up">
            <div class="text-center mb-4">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Hapus Anggota?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Hapus {{ memberToRemove?.email }} dari tim?</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="showRemoveConfirm = false" class="btn btn-secondary flex-1">Batal</button>
              <button @click="handleRemoveMember" class="btn btn-danger flex-1" :disabled="loading">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useTeam } from '@/composables/useTeam'
import { useAuth } from '@/composables/useAuth'

const {
  teams,
  teamMembers,
  loading,
  loadTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  loadTeamMembers,
  addMemberByEmail,
  createMemberAccount,
  removeMember,
  leaveTeam
} = useTeam()

const { getUserId } = useAuth()

// State
const selectedTeam = ref(null)

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showAddMemberModal = ref(false)
const showCreateAccountModal = ref(false)
const showDeleteConfirm = ref(false)
const showLeaveConfirm = ref(false)
const showRemoveConfirm = ref(false)

// Form data
const newTeamName = ref('')
const newTeamDescription = ref('')
const editTeamName = ref('')
const editTeamDescription = ref('')
const addMemberEmail = ref('')
const newAccountEmail = ref('')
const newAccountPassword = ref('')
const memberToRemove = ref(null)

// Modal feedback
const modalError = ref('')
const modalSuccess = ref('')

// Computed
const isOwner = computed(() => {
  if (!selectedTeam.value) return false
  return selectedTeam.value.owner_id === getUserId()
})

// Methods
const selectTeam = async (team) => {
  selectedTeam.value = team
  await loadTeamMembers(team.id)
}

const handleCreateTeam = async () => {
  if (!newTeamName.value.trim()) return
  try {
    const team = await createTeam(newTeamName.value.trim(), newTeamDescription.value.trim())
    showCreateModal.value = false
    newTeamName.value = ''
    newTeamDescription.value = ''
    await selectTeam({ ...team, myRole: 'owner' })
  } catch (err) {
    // error handled in composable
  }
}

const handleUpdateTeam = async () => {
  if (!editTeamName.value.trim() || !selectedTeam.value) return
  try {
    await updateTeam(selectedTeam.value.id, {
      name: editTeamName.value.trim(),
      description: editTeamDescription.value.trim()
    })
    selectedTeam.value.name = editTeamName.value.trim()
    selectedTeam.value.description = editTeamDescription.value.trim()
    showEditModal.value = false
  } catch (err) {
    // error handled in composable
  }
}

const handleDeleteTeam = async () => {
  if (!selectedTeam.value) return
  try {
    await deleteTeam(selectedTeam.value.id)
    selectedTeam.value = null
    showDeleteConfirm.value = false
  } catch (err) {
    // error handled in composable
  }
}

const handleLeaveTeam = async () => {
  if (!selectedTeam.value) return
  try {
    await leaveTeam(selectedTeam.value.id)
    selectedTeam.value = null
    showLeaveConfirm.value = false
  } catch (err) {
    // error handled in composable
  }
}

const handleAddMember = async () => {
  if (!addMemberEmail.value.trim() || !selectedTeam.value) return
  modalError.value = ''
  modalSuccess.value = ''
  try {
    await addMemberByEmail(selectedTeam.value.id, addMemberEmail.value.trim())
    modalSuccess.value = `${addMemberEmail.value} berhasil ditambahkan ke tim!`
    addMemberEmail.value = ''
  } catch (err) {
    modalError.value = err.message
  }
}

const closeAddMemberModal = () => {
  showAddMemberModal.value = false
  addMemberEmail.value = ''
  modalError.value = ''
  modalSuccess.value = ''
}

const handleCreateAccount = async () => {
  if (!newAccountEmail.value.trim() || !newAccountPassword.value || !selectedTeam.value) return
  if (newAccountPassword.value.length < 6) {
    modalError.value = 'Password minimal 6 karakter'
    return
  }
  modalError.value = ''
  modalSuccess.value = ''
  try {
    await createMemberAccount(selectedTeam.value.id, newAccountEmail.value.trim(), newAccountPassword.value)
    modalSuccess.value = `Akun ${newAccountEmail.value} berhasil dibuat dan ditambahkan ke tim!`
    newAccountEmail.value = ''
    newAccountPassword.value = ''
  } catch (err) {
    modalError.value = err.message
  }
}

const closeCreateAccountModal = () => {
  showCreateAccountModal.value = false
  newAccountEmail.value = ''
  newAccountPassword.value = ''
  modalError.value = ''
  modalSuccess.value = ''
}

const confirmRemoveMember = (member) => {
  memberToRemove.value = member
  showRemoveConfirm.value = true
}

const handleRemoveMember = async () => {
  if (!memberToRemove.value || !selectedTeam.value) return
  try {
    await removeMember(selectedTeam.value.id, memberToRemove.value.user_id)
    showRemoveConfirm.value = false
    memberToRemove.value = null
  } catch (err) {
    // error handled in composable
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Watch for edit modal
watch(showEditModal, (val) => {
  if (val && selectedTeam.value) {
    editTeamName.value = selectedTeam.value.name
    editTeamDescription.value = selectedTeam.value.description || ''
  }
})

// Init
onMounted(async () => {
  await loadTeams()
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
