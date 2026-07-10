<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">📋 Project Planning</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Rencanakan pembelian dan kelola anggaran project</p>
      </div>
      <button
        @click="openCreateModal"
        class="btn btn-primary h-9 px-4 text-sm"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Buat Project
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && projects.length === 0" class="card text-center py-16">
      <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-sm text-slate-500 dark:text-slate-400">Memuat data project...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && projects.length === 0" class="card text-center py-16">
      <div class="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">Belum ada project</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Buat project pertama untuk mulai merencanakan pembelian</p>
      <button @click="openCreateModal" class="btn btn-primary">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Buat Project
      </button>
    </div>

    <!-- Project Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="project in projects"
        :key="project.id"
        @click="openProject(project.id)"
        class="card cursor-pointer hover:shadow-lg transition-all duration-200 group"
        :class="{ 'opacity-70': project.isCompleted }"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            {{ project.name }}
          </h3>
          <span v-if="project.isCompleted" class="flex-shrink-0 ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            Selesai
          </span>
        </div>

        <!-- Description -->
        <p v-if="project.description" class="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
          {{ project.description }}
        </p>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Budget</p>
            <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(project.totalBudget) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Belanja</p>
            <p class="text-sm font-bold text-primary-600 dark:text-primary-400">{{ formatCurrency(project.totalSpent || '0') }}</p>
          </div>
        </div>

        <!-- Progress -->
        <div class="mb-3">
          <div class="flex items-center justify-between text-xs mb-1.5">
            <span class="text-slate-500 dark:text-slate-400">
              {{ project.purchasedCount || 0 }} / {{ project.itemCount || 0 }} item dibeli
            </span>
            <span class="font-bold text-primary-600 dark:text-primary-400">
              {{ calculateProgress(project.purchasedCount || 0, project.itemCount || 0) }}%
            </span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div
              class="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              :style="{ width: `${calculateProgress(project.purchasedCount || 0, project.itemCount || 0)}%` }"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>{{ formatDate(project.createdAt) }}</span>
          <div class="flex items-center gap-1">
            <button
              @click.stop="openEditModal(project)"
              class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit project"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              @click.stop="confirmDeleteProject(project)"
              class="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              title="Hapus project"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <teleport to="body">
      <div
        v-if="showModal"
        @click="closeModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      >
        <div
          @click.stop
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in"
        >
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              {{ isEditing ? 'Edit Project' : 'Buat Project Baru' }}
            </h3>
            <button
              @click="closeModal"
              class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nama Project *
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Contoh: Renovasi Kamar"
                required
                maxlength="255"
                class="input w-full"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Deskripsi
              </label>
              <textarea
                v-model="form.description"
                placeholder="Deskripsi project (opsional)"
                rows="3"
                class="input w-full resize-none"
              />
            </div>

            <!-- Total Budget (Optional) -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Target Budget <span class="text-xs font-normal text-slate-400">(opsional)</span>
              </label>
              <input
                v-model.number="form.totalBudget"
                type="number"
                min="0"
                step="1000"
                placeholder="Kosongkan jika belum tahu total budget"
                class="input w-full"
              />
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Jika tidak diisi, budget otomatis terhitung dari total estimasi item
              </p>
            </div>

            <!-- Completed Checkbox (only for edit) -->
            <div v-if="isEditing" class="flex items-center gap-2">
              <input
                v-model="form.isCompleted"
                type="checkbox"
                id="isCompleted"
                class="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500"
              />
              <label for="isCompleted" class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Tandai sebagai selesai
              </label>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                @click="closeModal"
                class="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="btn btn-primary flex-1"
              >
                <span v-if="loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
                <span v-else>{{ isEditing ? 'Update' : 'Buat Project' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Delete Confirmation Modal -->
    <teleport to="body">
      <div
        v-if="showDeleteConfirm"
        @click="showDeleteConfirm = false"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      >
        <div @click.stop class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Hapus Project?</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">Aksi ini tidak bisa dibatalkan</p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <div v-if="deletingProject" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p class="text-sm font-bold text-slate-900 dark:text-white mb-2">{{ deletingProject.name }}</p>
              <div class="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span>{{ deletingProject.itemCount || 0 }} item</span>
                <span>•</span>
                <span>{{ deletingProject.purchasedCount || 0 }} sudah dibeli</span>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <div class="flex gap-3">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div class="text-sm text-amber-900 dark:text-amber-200">
                  <p class="font-semibold mb-1">Perhatian:</p>
                  <ul class="space-y-1 text-xs">
                    <li>• Semua item dalam project akan dihapus</li>
                    <li v-if="deletingProject && deletingProject.purchasedCount > 0" class="font-bold">
                      • {{ deletingProject.purchasedCount }} transaksi terkait akan ikut terhapus
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button @click="showDeleteConfirm = false" class="btn btn-secondary flex-1">Batal</button>
              <button @click="handleDeleteProject" :disabled="loading" class="btn bg-red-600 hover:bg-red-700 text-white flex-1">
                <span v-if="loading">Menghapus...</span>
                <span v-else>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjects } from '@/composables/useProjects'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()
const toast = useToast()
const {
  projects,
  loading,
  error,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject
} = useProjects()

const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deletingProject = ref(null)

const form = ref({
  name: '',
  description: '',
  totalBudget: null,
  isCompleted: false
})

onMounted(() => {
  fetchProjects()
})

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    name: '',
    description: '',
    totalBudget: null,
    isCompleted: false
  }
  showModal.value = true
}

const openEditModal = (project) => {
  isEditing.value = true
  editingId.value = project.id
  form.value = {
    name: project.name,
    description: project.description || '',
    totalBudget: Number(project.totalBudget),
    isCompleted: project.isCompleted
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    if (isEditing.value && editingId.value) {
      await updateProject(editingId.value, form.value)
      toast.success('Project berhasil diupdate')
    } else {
      const payload = {
        name: form.value.name,
        description: form.value.description || undefined
      }
      // Only include totalBudget if it's set
      if (form.value.totalBudget !== null && form.value.totalBudget !== '' && form.value.totalBudget > 0) {
        payload.totalBudget = form.value.totalBudget
      }
      await createProject(payload)
      toast.success('Project berhasil dibuat')
    }
    closeModal()
  } catch (err) {
    toast.error(error.value || 'Terjadi kesalahan')
  }
}

const openProject = (id) => {
  router.push(`/projects/${id}`)
}

const confirmDeleteProject = (project) => {
  deletingProject.value = project
  showDeleteConfirm.value = true
}

const handleDeleteProject = async () => {
  try {
    await deleteProject(deletingProject.value.id)
    toast.success('Project berhasil dihapus')
    showDeleteConfirm.value = false
    deletingProject.value = null
  } catch (err) {
    toast.error(error.value || 'Gagal menghapus project')
  }
}

const calculateProgress = (purchased, total) => {
  if (total === 0) return 0
  return Math.round((purchased / total) * 100)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
