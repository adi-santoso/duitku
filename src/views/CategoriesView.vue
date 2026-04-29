<template>
  <div class="space-y-4 lg:space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Expense Categories -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Kategori Pengeluaran</h2>
        <span class="badge badge-red">{{ expenseCategories.length }} kategori</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="cat in expenseCategories"
          :key="cat.id"
          class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all text-center group"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform"
            :style="{ backgroundColor: cat.color + '18' }"
          >
            {{ cat.icon }}
          </div>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300 block truncate">{{ cat.name }}</span>
        </div>
      </div>
    </div>

    <!-- Income Categories -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Kategori Pemasukan</h2>
        <span class="badge badge-green">{{ incomeCategories.length }} kategori</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="cat in incomeCategories"
          :key="cat.id"
          class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all text-center group"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform"
            :style="{ backgroundColor: cat.color + '18' }"
          >
            {{ cat.icon }}
          </div>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300 block truncate">{{ cat.name }}</span>
        </div>
      </div>
    </div>

    <!-- Coming soon note -->
    <div class="flex items-center justify-center gap-2 py-4 text-slate-400 dark:text-slate-500">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
      <p class="text-sm">Fitur tambah kategori custom akan segera hadir</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCategories } from '@/composables/useCategories'

const { expenseCategories, incomeCategories, loadCategories } = useCategories()

onMounted(async () => {
  await loadCategories()
})
</script>
