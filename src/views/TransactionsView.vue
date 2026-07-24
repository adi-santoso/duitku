<template>
  <div class="space-y-4 pb-20 lg:pb-0 animate-fade-in">
    <!-- Search & View Toggle -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari transaksi... (coba: '50k', 'januari', nama kategori)"
          class="input h-12 !rounded-2xl !bg-surface/90 dark:!bg-ink-900/90 !border-ink-900/10 dark:!border-white/10 pl-11 pr-10 text-sm font-bold text-ink-900 dark:text-white focus:ring-lime/40"
          @keyup.enter="fetchTransactions"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-xl hover:bg-canvas dark:hover:bg-ink-800 text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <!-- Search hint badge -->
        <div v-if="searchQuery && paginatedTransactions.length > 0" class="absolute -bottom-6 left-1 text-[11px] text-lime-deep dark:text-lime font-extrabold animate-fade-in">
          ✓ {{ paginatedTransactions.length }} hasil ditemukan
        </div>
      </div>

      <!-- View Mode Toggle -->
      <div class="flex items-center bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 rounded-2xl p-1 shadow-soft">
        <button
          @click="viewMode = 'default'"
          class="p-2.5 rounded-xl transition-all"
          :class="viewMode === 'default' ? 'bg-ink-900 text-white dark:bg-lime dark:text-ink-900 shadow-sm font-extrabold' : 'text-ink-500 hover:text-ink-900 dark:text-slate-400 dark:hover:text-white'"
          title="Tampilan Default"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
        </button>
        <button
          @click="viewMode = 'compact'"
          class="p-2.5 rounded-xl transition-all"
          :class="viewMode === 'compact' ? 'bg-ink-900 text-white dark:bg-lime dark:text-ink-900 shadow-sm font-extrabold' : 'text-ink-500 hover:text-ink-900 dark:text-slate-400 dark:hover:text-white'"
          title="Tampilan Compact"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <button
          @click="viewMode = 'spreadsheet'"
          class="p-2.5 rounded-xl transition-all"
          :class="viewMode === 'spreadsheet' ? 'bg-ink-900 text-white dark:bg-lime dark:text-ink-900 shadow-sm font-extrabold' : 'text-ink-500 hover:text-ink-900 dark:text-slate-400 dark:hover:text-white'"
          title="Tampilan Spreadsheet"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <!-- Type Filter Pills -->
      <button
        v-for="filter in typeFilters"
        :key="filter.value"
        @click="filterType = filter.value"
        class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex-shrink-0"
        :class="filterType === filter.value
          ? 'bg-ink-900 text-white dark:bg-lime dark:text-ink-900 shadow-sm'
          : 'bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 text-ink-600 dark:text-slate-300 hover:border-ink-900/20'"
      >
        {{ filter.label }}
      </button>

      <div class="flex-1 min-w-[8px]" />

      <!-- Filter Button -->
      <button
        @click="showFilterModal = true"
        class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-soft"
        :class="hasActiveFilterOptions
          ? 'bg-ink-900 text-white dark:bg-lime dark:text-ink-900'
          : 'bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 text-ink-700 dark:text-slate-300 hover:border-lime'"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        <span>Filter</span>
        <span v-if="activeFilterCount > 0" class="px-1.5 py-0.5 rounded-full bg-lime text-ink-900 text-[10px] font-extrabold">
          {{ activeFilterCount }}
        </span>
      </button>

      <!-- Result count -->
      <span class="text-xs font-bold text-ink-500 dark:text-slate-400 hidden sm:block flex-shrink-0">
        {{ totalTransactions }} transaksi
      </span>
    </div>

    <!-- Quick Actions -->
    <div v-if="lastTransaction && !isLoading" class="flex items-center gap-3 p-3.5 rounded-2xl bg-lime/15 dark:bg-lime/10 border border-lime/25 animate-fade-in">
      <div class="w-8 h-8 rounded-xl bg-lime/40 text-ink-900 flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-extrabold text-ink-900 dark:text-white">Aksi Cepat Transaksi</p>
        <p class="text-[11px] text-ink-500 dark:text-slate-400 truncate">
          Terakhir: {{ lastTransaction.category_name }} · Rp {{ Number(lastTransaction.amount).toLocaleString('id-ID') }}
        </p>
      </div>
      <button
        @click="duplicateLastTransaction"
        class="px-4 py-2 rounded-xl bg-lime text-ink-900 text-xs font-extrabold shadow-sm hover:bg-lime/90 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
        </svg>
        <span>Duplikat</span>
      </button>
    </div>

    <!-- Spreadsheet Zoom Control -->
    <div v-if="viewMode === 'spreadsheet'" class="card animate-fade-in">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
          </svg>
          <span class="font-medium hidden sm:inline">Mode Spreadsheet</span>
          <span class="sm:hidden">🤏 Cubit untuk zoom</span>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="adjustZoom(-10)"
            class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="Zoom Out"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>

          <button
            @click="resetZoom"
            class="px-3 py-1 rounded-lg text-xs font-bold tabular-nums bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-w-[48px]"
            title="Reset Zoom (Double Tap)"
          >
            {{ zoomLevel }}%
          </button>

          <button
            @click="adjustZoom(10)"
            class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="Zoom In"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filters Badges -->
    <div v-if="hasActiveFilters" class="flex items-center gap-2 flex-wrap">
      <span class="text-xs text-slate-400 dark:text-slate-500">Filter aktif:</span>
      <span v-if="filterType" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        {{ filterType === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
        <button @click="filterType = null" class="hover:text-red-500">&times;</button>
      </span>
      <span v-if="filterCategory" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        {{ getCategoryName(filterCategory) }}
        <button @click="filterCategory = null" class="hover:text-red-500">&times;</button>
      </span>
      <span v-if="filterMonth" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        {{ filterMonth }}
        <button @click="filterMonth = null" class="hover:text-red-500">&times;</button>
      </span>
      <span v-if="filterAmountMin || filterAmountMax" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        Rp {{ filterAmountMin || '0' }} - {{ filterAmountMax || '∞' }}
        <button @click="filterAmountMin = ''; filterAmountMax = ''" class="hover:text-red-500">&times;</button>
      </span>
      <button
        @click="clearAllFilters"
        class="text-[10px] font-semibold text-red-500 hover:text-red-600 ml-1"
      >
        Hapus semua
      </button>
    </div>

    <!-- Transactions Card -->
    <div class="card">
      <!-- Loading -->
      <SkeletonCard v-if="isLoading" variant="list" :items="5" />

      <EmptyState
        v-else-if="paginatedTransactions.length === 0"
        :icon="searchQuery ? 'search' : 'transaction'"
        :title="searchQuery ? 'Tidak ditemukan' : 'Belum ada transaksi'"
        :description="searchQuery ? 'Coba ubah kata kunci pencarian atau hapus filter yang aktif' : 'Mulai catat keuanganmu dengan menambahkan transaksi pertama'"
        :action-label="searchQuery ? '' : 'Tambah Transaksi'"
        :action-icon="searchQuery ? '' : 'plus'"
        :secondary-label="searchQuery ? 'Hapus Filter' : ''"
        @action="showModal = true; modalMode = 'create'; editingTransaction = null"
        @secondary-action="clearAllFilters"
      />

      <!-- DEFAULT VIEW MODE -->
      <template v-if="!isLoading && paginatedTransactions.length > 0 && viewMode === 'default'">
        <!-- Desktop Grouped Table -->
        <div class="hidden md:block space-y-6">
          <div v-for="group in groupedTransactions" :key="group.label" class="space-y-2">
            <!-- Sticky Date Header -->
            <div class="sticky top-0 z-10 bg-surface/90 dark:bg-ink-900/90 backdrop-blur-md px-4.5 py-3 rounded-2xl border border-ink-900/10 dark:border-white/10 shadow-soft">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-display text-sm font-extrabold text-ink-900 dark:text-white">
                    {{ group.label }}
                  </span>
                  <span class="text-xs text-ink-500 dark:text-slate-400 font-medium">
                    {{ group.transactions.length }} transaksi
                  </span>
                </div>
                <span
                  class="text-sm font-extrabold font-display"
                  :class="group.total >= 0 ? 'text-[#70a214] dark:text-lime' : 'text-coral'"
                >
                  {{ group.total >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(group.total)) }}
                </span>
              </div>
            </div>

            <!-- Transactions Table -->
            <div class="overflow-x-auto">
              <table class="w-full">
                <tbody class="divide-y divide-ink-900/5 dark:divide-white/5">
                  <tr
                    v-for="transaction in group.transactions"
                    :key="transaction.id"
                    class="group hover:bg-canvas dark:hover:bg-ink-800/80 transition-all duration-200 cursor-pointer rounded-2xl"
                    @click="viewTransaction(transaction)"
                  >
                    <td class="py-3.5 pl-4 rounded-l-2xl">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                          :style="{ backgroundColor: transaction.category_color + '25' }"
                        >
                          {{ transaction.category_icon }}
                        </div>
                        <span class="text-sm font-bold text-ink-900 dark:text-white">{{ transaction.category_name }}</span>
                      </div>
                    </td>
                    <td class="py-3.5">
                      <div class="flex items-center gap-2">
                        <button
                          @click.stop="togglePin(transaction.id)"
                          class="flex-shrink-0 p-1 rounded-xl transition-colors"
                          :class="isPinned(transaction.id) ? 'text-amber-500' : 'text-ink-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'"
                          :title="isPinned(transaction.id) ? 'Unpin' : 'Pin'"
                        >
                          <svg class="w-4 h-4" :fill="isPinned(transaction.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                        </button>
                        <span class="text-xs font-medium text-ink-500 dark:text-slate-400 truncate max-w-[220px]">{{ transaction.description || '-' }}</span>
                        <span v-for="tag in getTags(transaction.id)" :key="tag" class="text-[9px] px-2 py-0.5 rounded-full bg-violet/15 text-violet dark:text-lime font-extrabold">#{{ tag }}</span>
                        <span v-if="transaction.receipt_image" class="text-ink-400" title="Ada foto struk">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                          </svg>
                        </span>
                        <span v-if="transaction.is_recurring" class="text-ink-400" title="Transaksi berulang">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                          </svg>
                        </span>
                      </div>
                    </td>
                    <td class="py-3.5">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                        :class="transaction.type === 'income' ? 'bg-lime/20 text-ink-900 dark:text-lime' : 'bg-coral/20 text-coral'"
                      >
                        {{ transaction.type === 'income' ? 'Masuk' : 'Keluar' }}
                      </span>
                    </td>
                    <td class="py-3.5 text-right pr-4 rounded-r-2xl">
                      <span
                        class="font-display text-sm font-extrabold"
                        :class="transaction.type === 'income' ? 'text-[#70a214] dark:text-lime' : 'text-ink-900 dark:text-white'"
                      >
                        {{ transaction.type === 'income' ? '+' : '−' }} {{ formatCurrency(transaction.amount) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Mobile Grouped List -->
        <div class="md:hidden space-y-5">
          <div v-for="group in groupedTransactions" :key="group.label" class="space-y-2">
            <!-- Sticky Date Header (Mobile) -->
            <div class="sticky top-0 z-10 bg-surface/90 dark:bg-ink-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-ink-900/10 dark:border-white/10 shadow-soft">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-display text-xs font-extrabold text-ink-900 dark:text-white block">
                    {{ group.label }}
                  </span>
                  <span class="text-[10px] text-ink-500 dark:text-slate-400 font-medium">
                    {{ group.transactions.length }} transaksi
                  </span>
                </div>
                <span
                  class="font-display text-xs font-extrabold"
                  :class="group.total >= 0 ? 'text-[#70a214] dark:text-lime' : 'text-coral'"
                >
                  {{ group.total >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(group.total)) }}
                </span>
              </div>
            </div>

            <!-- Transactions List (Mobile) -->
            <div class="space-y-1.5">
              <SwipeableTransactionItem
                v-for="(transaction, idx) in group.transactions"
                :key="'m-' + transaction.id"
                class="stagger-item"
                @edit="editTransaction(transaction)"
                @delete="confirmDelete(transaction)"
                @click="viewTransaction(transaction)"
              >
                <div
                  class="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 items-center p-3 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-900/5 dark:border-white/5 hover:bg-canvas dark:hover:bg-ink-800 transition-colors group cursor-pointer"
                  :class="{ 'opacity-60 animate-pulse': transaction._optimistic }"
                >
                  <div
                    class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                    :style="{ backgroundColor: transaction.category_color + '25' }"
                  >
                    {{ transaction.category_icon }}
                  </div>

                  <div class="min-w-0">
                    <p class="text-xs font-bold text-ink-900 dark:text-white truncate">{{ transaction.category_name }}</p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <p class="text-[11px] text-ink-500 dark:text-slate-400 truncate">
                        <span v-if="transaction.description">{{ transaction.description }}</span>
                        <span v-else class="italic">Tidak ada deskripsi</span>
                      </p>
                      <span v-for="tag in getTags(transaction.id)" :key="tag" class="text-[9px] px-1.5 py-0.5 rounded-full bg-violet/15 text-violet dark:text-lime font-extrabold flex-shrink-0">#{{ tag }}</span>
                    </div>
                  </div>

                  <div class="text-right flex-shrink-0">
                    <p
                      class="font-display text-xs font-extrabold"
                      :class="transaction.type === 'income' ? 'text-[#70a214] dark:text-lime' : 'text-ink-900 dark:text-white'"
                    >
                      {{ transaction.type === 'income' ? '+' : '−' }} {{ formatCurrency(transaction.amount) }}
                    </p>
                    <div class="flex items-center gap-1 justify-end mt-0.5 text-ink-400">
                      <svg v-if="transaction.receipt_image" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                      <svg v-if="transaction.is_recurring" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                      <button
                        @click.stop="togglePin(transaction.id)"
                        class="p-0.5"
                        :class="isPinned(transaction.id) ? 'text-amber-500' : ''"
                      >
                        <svg class="w-3 h-3" :fill="isPinned(transaction.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </SwipeableTransactionItem>
            </div>
          </div>
        </div>
      </template>

      <!-- COMPACT VIEW MODE -->
      <template v-if="!isLoading && paginatedTransactions.length > 0 && viewMode === 'compact'">
        <!-- Desktop Table (Compact) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 pl-1">Tanggal</th>
                <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2">Kategori</th>
                <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2">Deskripsi</th>
                <th class="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 pr-1">Jumlah</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-800/50">
              <tr
                v-for="transaction in paginatedTransactions"
                :key="'c-' + transaction.id"
                class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                :class="{ 'opacity-60 animate-pulse': transaction._optimistic }"
                @click="viewTransaction(transaction)"
              >
                <td class="py-2 pl-1">
                  <span class="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{{ formatDate(transaction.transaction_date, 'short') }}</span>
                </td>
                <td class="py-2">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm">{{ transaction.category_icon }}</span>
                    <span class="text-xs font-medium text-slate-600 dark:text-slate-400">{{ transaction.category_name }}</span>
                  </div>
                </td>
                <td class="py-2">
                  <span class="text-xs text-slate-500 dark:text-slate-400 truncate block max-w-[250px]">{{ transaction.description || '-' }}</span>
                </td>
                <td class="py-2 text-right pr-1">
                  <span
                    class="text-xs font-bold tabular-nums"
                    :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
                  >
                    {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile List (Compact) -->
        <div class="md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
          <div
            v-for="transaction in paginatedTransactions"
            :key="'mc-' + transaction.id"
            class="flex items-center gap-2 py-2 px-1 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
            :class="{ 'opacity-60 animate-pulse': transaction._optimistic }"
            @click="viewTransaction(transaction)"
          >
            <span class="text-base flex-shrink-0">{{ transaction.category_icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {{ transaction.description || transaction.category_name }}
              </p>
              <p class="text-[10px] text-slate-400 dark:text-slate-500">{{ formatDate(transaction.transaction_date, 'short') }}</p>
            </div>
            <span
              class="text-xs font-bold tabular-nums flex-shrink-0"
              :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </span>
          </div>
        </div>
      </template>

      <!-- SPREADSHEET VIEW MODE -->
      <template v-if="!isLoading && paginatedTransactions.length > 0 && viewMode === 'spreadsheet'">
        <div class="rounded-3xl border border-ink-900/10 dark:border-white/10 bg-surface dark:bg-ink-900 shadow-float overflow-hidden">
          <!-- Spreadsheet Formula & Status Header Bar -->
          <div class="px-4 py-2.5 bg-canvas/80 dark:bg-ink-800/80 border-b border-ink-900/10 dark:border-white/10 flex items-center justify-between text-xs gap-3">
            <div class="flex items-center gap-2 font-mono">
              <span class="px-2 py-0.5 rounded-lg bg-ink-900 text-white dark:bg-lime dark:text-ink-900 font-extrabold text-[10px]">fx</span>
              <span class="font-extrabold text-ink-900 dark:text-white text-[11px] truncate">SUMMARY(Transactions)</span>
              <span class="text-ink-400 dark:text-slate-500 hidden sm:inline">| {{ paginatedTransactions.length }} baris terdaftar</span>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-[11px] font-bold text-ink-500 dark:text-slate-400 hidden sm:inline">Skala Zoom:</span>
              <div class="flex items-center bg-surface dark:bg-ink-900 rounded-xl p-0.5 border border-ink-900/10 dark:border-white/10">
                <button
                  @click="adjustZoom(-10)"
                  class="w-6 h-6 rounded-lg text-ink-600 dark:text-slate-300 hover:bg-canvas dark:hover:bg-ink-800 flex items-center justify-center font-bold"
                  title="Zoom Out"
                >
                  −
                </button>
                <button
                  @click="resetZoom"
                  class="px-2 text-[11px] font-extrabold text-ink-900 dark:text-lime"
                  title="Reset Zoom"
                >
                  {{ zoomLevel }}%
                </button>
                <button
                  @click="adjustZoom(10)"
                  class="w-6 h-6 rounded-lg text-ink-600 dark:text-slate-300 hover:bg-canvas dark:hover:bg-ink-800 flex items-center justify-center font-bold"
                  title="Zoom In"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <!-- Spreadsheet Scrollable Table Grid -->
          <div
            ref="spreadsheetContainer"
            class="spreadsheet-view overflow-x-auto"
            :style="spreadsheetStyles"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <table class="spreadsheet-table w-full">
              <thead class="spreadsheet-header">
                <tr>
                  <th class="w-10 text-center !px-2">#</th>
                  <th class="text-left">Tanggal</th>
                  <th class="text-left">Kategori</th>
                  <th class="text-left">Deskripsi</th>
                  <th class="text-center">Tipe</th>
                  <th class="text-right">Jumlah (Nominal)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(transaction, index) in paginatedTransactions"
                  :key="'s-' + transaction.id"
                  :class="[
                    index % 2 === 0 ? 'row-even' : 'row-odd',
                    { 'opacity-60 animate-pulse': transaction._optimistic }
                  ]"
                  @click="viewTransaction(transaction)"
                >
                  <td class="text-center font-mono text-[11px] text-ink-400 dark:text-slate-500 bg-canvas/40 dark:bg-ink-800/40 font-bold border-r border-ink-900/10 dark:border-white/10 select-none">
                    {{ (currentPage - 1) * perPage + index + 1 }}
                  </td>
                  <td class="tabular-nums font-mono text-xs font-bold text-ink-900 dark:text-white">
                    {{ formatDate(transaction.transaction_date, 'short') }}
                  </td>
                  <td>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-canvas dark:bg-ink-800 border border-ink-900/5 dark:border-white/5 font-extrabold text-xs text-ink-900 dark:text-white">
                      <span>{{ transaction.category_icon }}</span>
                      <span>{{ transaction.category_name }}</span>
                    </span>
                  </td>
                  <td class="description-cell font-bold text-xs text-ink-600 dark:text-slate-300 max-w-[280px] truncate">
                    <span>{{ transaction.description || '-' }}</span>
                    <span v-for="tag in getTags(transaction.id)" :key="tag" class="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-violet/15 text-violet dark:text-lime font-extrabold">#{{ tag }}</span>
                  </td>
                  <td class="text-center">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block"
                      :class="transaction.type === 'income' ? 'bg-lime/25 text-ink-900 dark:text-lime' : 'bg-coral/20 text-coral'"
                    >
                      {{ transaction.type === 'income' ? 'Masuk' : 'Keluar' }}
                    </span>
                  </td>
                  <td class="text-right tabular-nums amount-cell font-display font-extrabold text-xs" :class="transaction.type === 'income' ? 'amount-income' : 'amount-expense'">
                    {{ transaction.type === 'income' ? '+' : '−' }} {{ formatCurrency(transaction.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Zoom Toast -->
        <transition name="toast">
          <div v-if="showZoomToast" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-ink-900 dark:bg-lime text-white dark:text-ink-900 text-xs font-extrabold rounded-2xl shadow-float">
            🔍 Zoom {{ zoomLevel }}%
          </div>
        </transition>
      </template>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between pt-2">
      <p class="text-xs font-medium text-ink-500 dark:text-slate-400">
        {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, totalTransactions) }} dari {{ totalTransactions }}
      </p>

      <div class="flex items-center gap-1">
        <button
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="p-2 rounded-xl text-ink-500 dark:text-slate-400 hover:bg-canvas dark:hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Halaman pertama"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="p-2 rounded-xl text-ink-500 dark:text-slate-400 hover:bg-canvas dark:hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            @click="currentPage = page"
            class="w-8 h-8 rounded-xl text-xs font-extrabold transition-all"
            :class="currentPage === page
              ? 'bg-ink-900 text-white dark:bg-lime dark:text-ink-900 shadow-sm'
              : 'text-ink-600 dark:text-slate-400 hover:bg-canvas dark:hover:bg-ink-800'"
          >
            {{ page }}
          </button>
          <span v-else class="w-8 h-8 flex items-center justify-center text-xs text-ink-400">...</span>
        </template>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-xl text-ink-500 dark:text-slate-400 hover:bg-canvas dark:hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <button
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-xl text-ink-500 dark:text-slate-400 hover:bg-canvas dark:hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Halaman terakhir"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- Per page selector -->
      <BaseSelect v-model="perPage" size="sm" custom-class="!rounded-xl !bg-surface dark:!bg-ink-900 !border-ink-900/10 dark:!border-white/10 text-xs font-bold">
        <option :value="15">15/hal</option>
        <option :value="25">25/hal</option>
        <option :value="50">50/hal</option>
        <option :value="100">100/hal</option>
      </BaseSelect>
    </div>

    <!-- FAB -->
    <button
      @click="showAddMenu = !showAddMenu"
      class="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 w-14 h-14 bg-ink-900 text-white dark:bg-lime dark:text-ink-900 rounded-2xl shadow-float border border-white/10 dark:border-ink-900/20 hover:scale-105 active:scale-95 transition-all z-[55] flex items-center justify-center"
      aria-label="Tambah Transaksi"
    >
      <svg class="w-6 h-6 transition-transform duration-300" :class="showAddMenu ? 'rotate-45' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>

    <!-- FAB Menu -->
    <transition name="fab-menu">
      <div v-if="showAddMenu" class="fixed bottom-40 lg:bottom-22 right-4 lg:right-6 space-y-2.5 z-[55]">
        <button
          @click="showAddTransaction('income')"
          class="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-lime text-ink-900 font-extrabold text-xs shadow-lg shadow-lime/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap animate-slide-up"
        >
          <div class="w-6 h-6 rounded-xl bg-ink-900/10 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span>+ Pemasukan</span>
        </button>

        <button
          @click="showAddTransaction('expense')"
          class="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-coral text-white font-extrabold text-xs shadow-lg shadow-coral/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap animate-slide-up"
        >
          <div class="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
            </svg>
          </div>
          <span>− Pengeluaran</span>
        </button>
      </div>
    </transition>

    <!-- FAB Overlay -->
    <div
      v-if="showAddMenu"
      class="fixed inset-0 bg-ink-900/30 backdrop-blur-[2px] z-50"
      @click="showAddMenu = false"
    />

    <!-- Transaction Modal (Add/Edit) -->
    <TransactionModal
      v-if="showModal"
      :type="transactionType"
      :transaction="editingTransaction"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Transaction Detail Modal -->
    <TransactionDetailModal
      v-if="selectedTransaction"
      :transaction="selectedTransaction"
      @close="selectedTransaction = null"
      @deleted="handleDeleted"
      @edit="handleEdit"
    />

    <!-- Filter Modal -->
    <FilterModal
      v-model="showFilterModal"
      :filters="{
        category: filterCategory,
        month: filterMonth,
        sortBy: sortBy,
        amountMin: filterAmountMin,
        amountMax: filterAmountMax
      }"
      :categories="allCategories"
      :available-months="availableMonths"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Hapus Transaksi?"
      message="Yakin ingin menghapus transaksi ini? Transaksi akan langsung dihapus."
      confirm-text="Hapus"
      cancel-text="Batal"
      variant="danger"
      icon="trash"
      @confirm="performDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import TransactionModal from '@/components/transaction/TransactionModal.vue'
import TransactionDetailModal from '@/components/transaction/TransactionDetailModal.vue'
import SwipeableTransactionItem from '@/components/transaction/SwipeableTransactionItem.vue'
import FilterModal from '@/components/transaction/FilterModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import { useTransactionMeta } from '@/composables/useTransactionMeta'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/formatters'
import { formatDate, getDateGroupLabel, isSameDay } from '@/utils/dateHelpers'
import { smartSearchTransactions } from '@/utils/smartSearch'

const { transactions, totalTransactions, isLoading: transactionsLoading, isSaving, loadTransactions, deleteTransaction, restoreTransaction } = useTransactions()
const { categories: allCategories, loadCategories } = useCategories()
const { togglePin, isPinned, getTags } = useTransactionMeta()
const { success, error } = useToast()

const filterType = ref(null)
const filterCategory = ref(null)
const filterMonth = ref(null)
const filterAmountMin = ref('')
const filterAmountMax = ref('')
const sortBy = ref('date_desc')
const showFilterModal = ref(false)
const showDeleteConfirm = ref(false)
const transactionToDelete = ref(null)
const searchQuery = ref('')
const viewMode = ref('compact')
const currentPage = ref(1)
const perPage = ref(25)
const isLoading = ref(false)
const showModal = ref(false)
const showAddMenu = ref(false)
const transactionType = ref('expense')
const selectedTransaction = ref(null)
const editingTransaction = ref(null)

// Spreadsheet zoom
const zoomLevel = ref(100)
const showZoomToast = ref(false)
const spreadsheetContainer = ref(null)
let zoomToastTimer = null

// Pinch gesture tracking
let initialPinchDistance = 0
let initialZoomLevel = 100
let lastTapTime = 0

// Debounce timer for search
let searchTimer = null

const typeFilters = [
  { value: null, label: 'Semua', activeClass: 'bg-primary-500 text-white shadow-sm shadow-primary-500/25' },
  { value: 'income', label: 'Pemasukan', activeClass: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25' },
  { value: 'expense', label: 'Pengeluaran', activeClass: 'bg-red-500 text-white shadow-sm shadow-red-500/25' },
]

// Generate month options (last 12 months)
const availableMonths = computed(() => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
  const now = new Date()
  const months = []

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({
      value: ym,
      label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`
    })
  }

  return months
})

// Server-side pagination: fetch from API
const fetchTransactions = async () => {
  isLoading.value = true
  try {
    const filters = {}

    if (filterType.value) filters.type = filterType.value
    if (filterCategory.value) filters.categoryId = filterCategory.value
    if (filterMonth.value) {
      const [year, month] = filterMonth.value.split('-')
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      filters.startDate = `${filterMonth.value}-01`
      filters.endDate = `${filterMonth.value}-${String(lastDay).padStart(2, '0')}`
    }
    if (searchQuery.value.trim()) filters.search = searchQuery.value.trim()

    filters.limit = perPage.value
    filters.offset = (currentPage.value - 1) * perPage.value

    await loadTransactions(filters)
  } finally {
    isLoading.value = false
  }
}

// Active filters check
const hasActiveFilters = computed(() => {
  return filterType.value || filterCategory.value || filterMonth.value || filterAmountMin.value || filterAmountMax.value
})

// Check if filter options (not type) are active
const hasActiveFilterOptions = computed(() => {
  return filterCategory.value || filterMonth.value || filterAmountMin.value || filterAmountMax.value || sortBy.value !== 'date_desc'
})

// Count active filters for badge
const activeFilterCount = computed(() => {
  let count = 0
  if (filterCategory.value) count++
  if (filterMonth.value) count++
  if (filterAmountMin.value || filterAmountMax.value) count++
  if (sortBy.value !== 'date_desc') count++
  return count
})

const getCategoryName = (catId) => {
  const cat = allCategories.value.find(c => c.id === catId)
  return cat ? `${cat.icon} ${cat.name}` : catId
}

const clearAllFilters = () => {
  filterType.value = null
  filterCategory.value = null
  filterMonth.value = null
  filterAmountMin.value = ''
  filterAmountMax.value = ''
  sortBy.value = 'date_desc'
}

const applyFilters = (filters) => {
  filterCategory.value = filters.category
  filterMonth.value = filters.month
  sortBy.value = filters.sortBy
  filterAmountMin.value = filters.amountMin
  filterAmountMax.value = filters.amountMax
}

const resetFilters = () => {
  filterCategory.value = null
  filterMonth.value = null
  sortBy.value = 'date_desc'
  filterAmountMin.value = ''
  filterAmountMax.value = ''
}

// Pagination computed
const totalPages = computed(() => Math.ceil(totalTransactions.value / perPage.value))

// paginatedTransactions: apply client-side amount filter, smart search, and sort
const paginatedTransactions = computed(() => {
  let result = [...transactions.value]

  // Client-side smart search (in addition to server-side search)
  if (searchQuery.value.trim()) {
    result = smartSearchTransactions(result, searchQuery.value)
  }

  // Client-side amount filter
  if (filterAmountMin.value) {
    result = result.filter(t => Number(t.amount) >= Number(filterAmountMin.value))
  }
  if (filterAmountMax.value) {
    result = result.filter(t => Number(t.amount) <= Number(filterAmountMax.value))
  }

  // Client-side sort
  switch (sortBy.value) {
    case 'date_asc':
      result.sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date))
      break
    case 'amount_desc':
      result.sort((a, b) => Number(b.amount) - Number(a.amount))
      break
    case 'amount_asc':
      result.sort((a, b) => Number(a.amount) - Number(b.amount))
      break
    default: // date_desc (default from API)
      break
  }

  return result
})

// Group transactions by date
const groupedTransactions = computed(() => {
  const groups = []
  let currentGroup = null

  for (const transaction of paginatedTransactions.value) {
    const groupLabel = getDateGroupLabel(transaction.transaction_date)

    // Create new group if needed
    if (!currentGroup || currentGroup.label !== groupLabel) {
      currentGroup = {
        label: groupLabel,
        date: transaction.transaction_date,
        transactions: [],
        total: 0
      }
      groups.push(currentGroup)
    }

    // Add transaction to current group
    currentGroup.transactions.push(transaction)
    currentGroup.total += transaction.type === 'income'
      ? Number(transaction.amount)
      : -Number(transaction.amount)
  }

  return groups
})

// Last transaction for quick duplicate
const lastTransaction = computed(() => {
  if (transactions.value.length === 0) return null
  return transactions.value[0] // Already sorted by date desc from API
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)

    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages
})

// Spreadsheet dynamic styles
const spreadsheetStyles = computed(() => {
  const fontSize = 10 + (zoomLevel.value - 80) * 0.15 // 10px @ 80%, 12px @ 100%, 16px @ 120%
  const rowHeight = 28 + (zoomLevel.value - 80) * 0.3 // 28px @ 80%, 36px @ 100%, 40px @ 120%

  return {
    '--spreadsheet-font-size': `${fontSize}px`,
    '--spreadsheet-row-height': `${rowHeight}px`,
  }
})

// Zoom functions
const adjustZoom = (delta) => {
  const newZoom = Math.min(120, Math.max(80, zoomLevel.value + delta))
  setZoom(newZoom)
}

const resetZoom = () => {
  setZoom(100)
}

const setZoom = (value) => {
  zoomLevel.value = value
  localStorage.setItem('duitku_spreadsheet_zoom', value.toString())

  // Show toast
  showZoomToast.value = true
  clearTimeout(zoomToastTimer)
  zoomToastTimer = setTimeout(() => {
    showZoomToast.value = false
  }, 1000)

  // Haptic feedback on mobile (if supported)
  if (value === 100 && navigator.vibrate) {
    navigator.vibrate(50)
  }
}

// Pinch gesture handlers
const getDistance = (touch1, touch2) => {
  const dx = touch2.clientX - touch1.clientX
  const dy = touch2.clientY - touch1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    e.preventDefault()
    initialPinchDistance = getDistance(e.touches[0], e.touches[1])
    initialZoomLevel = zoomLevel.value
  }

  // Double tap detection for reset
  const now = Date.now()
  if (now - lastTapTime < 300) {
    resetZoom()
  }
  lastTapTime = now
}

const handleTouchMove = (e) => {
  if (e.touches.length === 2 && initialPinchDistance > 0) {
    e.preventDefault()
    const currentDistance = getDistance(e.touches[0], e.touches[1])
    const scale = currentDistance / initialPinchDistance

    const newZoom = Math.min(120, Math.max(80, initialZoomLevel * scale))
    zoomLevel.value = Math.round(newZoom)

    // Show toast during pinch
    showZoomToast.value = true
    clearTimeout(zoomToastTimer)
  }
}

const handleTouchEnd = () => {
  if (initialPinchDistance > 0) {
    // Save final zoom level
    localStorage.setItem('duitku_spreadsheet_zoom', zoomLevel.value.toString())

    // Hide toast after pinch ends
    zoomToastTimer = setTimeout(() => {
      showZoomToast.value = false
    }, 1000)
  }

  initialPinchDistance = 0
}

// Watch filters: reset page and re-fetch
watch([filterType, filterCategory, filterMonth, perPage, filterAmountMin, filterAmountMax], () => {
  currentPage.value = 1
  fetchTransactions()
})

// Debounced search
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchTransactions()
  }, 400)
})

// Watch page change
watch(currentPage, () => {
  fetchTransactions()
})

const showAddTransaction = (type) => {
  transactionType.value = type
  editingTransaction.value = null
  showModal.value = true
  showAddMenu.value = false
}

const closeModal = () => {
  showModal.value = false
  editingTransaction.value = null
}

const handleSaved = async () => {
  showModal.value = false
  editingTransaction.value = null
  await fetchTransactions()
}

const handleDeleted = async () => {
  selectedTransaction.value = null
  await fetchTransactions()
}

const handleEdit = (transaction) => {
  selectedTransaction.value = null
  transactionType.value = transaction.type
  editingTransaction.value = transaction
  showModal.value = true
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
}

const duplicateLastTransaction = () => {
  if (!lastTransaction.value) return

  // Pre-fill modal with last transaction data
  modalMode.value = 'create'
  editingTransaction.value = {
    ...lastTransaction.value,
    transaction_date: formatDateInput(new Date()), // Use today's date
    id: null // Remove ID so it creates new transaction
  }
  showModal.value = true
}

const confirmDelete = (transaction) => {
  transactionToDelete.value = transaction
  showDeleteConfirm.value = true
}

const performDelete = async () => {
  if (!transactionToDelete.value) return

  try {
    // Optimistic delete with returned transaction for undo
    const deletedTransaction = await deleteTransaction(transactionToDelete.value.id)

    // Show undo toast
    success('Transaksi dihapus', {
      duration: 5000,
      action: {
        label: 'Urungkan',
        handler: async () => {
          try {
            await restoreTransaction(deletedTransaction)
            success('Transaksi dikembalikan')
          } catch (err) {
            error('Gagal mengembalikan transaksi')
          }
        }
      }
    })
  } catch (err) {
    console.error('Failed to delete transaction:', err)
    error('Gagal menghapus transaksi')
  } finally {
    transactionToDelete.value = null
  }
}

onMounted(async () => {
  await loadCategories()
  await fetchTransactions()

  // Load saved zoom level
  const savedZoom = localStorage.getItem('duitku_spreadsheet_zoom')
  if (savedZoom) {
    zoomLevel.value = parseInt(savedZoom, 10)
  }
})
</script>

<style scoped>
.fab-menu-enter-active,
.fab-menu-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fab-menu-enter-from,
.fab-menu-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* Spreadsheet Mode Styles */
.spreadsheet-view {
  background: transparent;
  border-radius: 0;
  overflow: auto;
  max-height: 70vh;
  position: relative;
  font-size: var(--spreadsheet-font-size, 12px);
  transition: font-size 0.15s ease;
  touch-action: pan-x pan-y pinch-zoom;
}

.spreadsheet-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: none;
}

.spreadsheet-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--canvas-color, #f4f3ed);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dark .spreadsheet-header {
  background: #182232;
}

.spreadsheet-header th {
  font-family: var(--font-display);
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.75em;
  letter-spacing: 0.06em;
  color: #64748b;
  padding: calc(var(--spreadsheet-row-height, 36px) * 0.28) 12px;
  border-right: 1px solid rgba(22, 28, 45, 0.08);
  border-bottom: 1px solid rgba(22, 28, 45, 0.1);
  white-space: nowrap;
  transition: padding 0.15s ease;
}

.dark .spreadsheet-header th {
  color: #94a3b8;
  border-right-color: rgba(255, 255, 255, 0.08);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.spreadsheet-header th:last-child {
  border-right: none;
}

.spreadsheet-table tbody tr {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.spreadsheet-table tbody tr:hover {
  background: rgba(200, 241, 109, 0.2) !important;
}

.dark .spreadsheet-table tbody tr:hover {
  background: rgba(200, 241, 109, 0.12) !important;
}

.spreadsheet-table tbody tr.row-even {
  background: var(--surface-color, #ffffff);
}

.spreadsheet-table tbody tr.row-odd {
  background: var(--canvas-color, #f8f7f2);
}

.dark .spreadsheet-table tbody tr.row-even {
  background: #0f172a;
}

.dark .spreadsheet-table tbody tr.row-odd {
  background: #141f30;
}

.spreadsheet-table tbody td {
  padding: calc(var(--spreadsheet-row-height, 36px) * 0.18) 12px;
  border-right: 1px solid rgba(22, 28, 45, 0.06);
  border-bottom: 1px solid rgba(22, 28, 45, 0.06);
  color: #161c2d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: padding 0.15s ease;
}

.dark .spreadsheet-table tbody td {
  color: #f8fafc;
  border-right-color: rgba(255, 255, 255, 0.06);
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.spreadsheet-table tbody td:last-child {
  border-right: none;
}

.amount-income {
  color: #70a214 !important;
}

.amount-expense {
  color: #161c2d !important;
}

.dark .amount-income {
  color: #c8f16d !important;
}

.dark .amount-expense {
  color: #ffffff !important;
}

.category-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.category-icon {
  font-size: 1.1em;
}

.description-cell {
  max-width: 250px;
  color: rgb(100 116 139); /* slate-500 */
}

.dark .description-cell {
  color: rgb(148 163 184); /* slate-400 */
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 600;
}

.type-income {
  background: rgb(209 250 229); /* emerald-100 */
  color: rgb(5 150 105); /* emerald-600 */
}

.type-expense {
  background: rgb(254 226 226); /* red-100 */
  color: rgb(220 38 38); /* red-600 */
}

.dark .type-income {
  background: rgb(5 150 105 / 0.15);
  color: rgb(52 211 153); /* emerald-400 */
}

.dark .type-expense {
  background: rgb(220 38 38 / 0.15);
  color: rgb(248 113 113); /* red-400 */
}

.amount-cell {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.amount-income {
  color: rgb(5 150 105) !important; /* emerald-600 */
}

.amount-expense {
  color: rgb(220 38 38) !important; /* red-600 */
}

.dark .amount-income {
  color: rgb(52 211 153) !important; /* emerald-400 */
}

.dark .amount-expense {
  color: rgb(248 113 113) !important; /* red-400 */
}

/* Zoom Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
