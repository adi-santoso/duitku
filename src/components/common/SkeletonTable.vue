<template>
  <div class="card overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-slate-100 dark:border-slate-800">
          <th v-for="(col, idx) in columns" :key="idx" class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3" :class="col.align === 'right' ? 'text-right' : 'text-left'">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        <tr v-for="i in rows" :key="i" class="animate-pulse">
          <td v-for="(col, idx) in columns" :key="idx" class="py-3.5" :class="col.align === 'right' ? 'text-right' : 'text-left'">
            <div v-if="idx === 0" class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
            </div>
            <div v-else class="h-4 bg-slate-200 dark:bg-slate-700 rounded" :class="col.width || 'w-24'"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: {
    type: Array,
    default: () => [
      { label: 'Kategori', align: 'left' },
      { label: 'Tanggal', align: 'left', width: 'w-32' },
      { label: 'Deskripsi', align: 'left', width: 'w-40' },
      { label: 'Tipe', align: 'left', width: 'w-20' },
      { label: 'Jumlah', align: 'right', width: 'w-28' }
    ]
  },
  rows: {
    type: Number,
    default: 5
  }
})
</script>
