<template>
  <div class="space-y-4 pb-20 lg:pb-0 animate-fade-in">
    <!-- Search & View Toggle -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari transaksi..."
          class="input pl-10 h-10 text-sm"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- View Mode Toggle -->
      <div class="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
        <button
          @click="viewMode = 'default'"
          class="p-2 rounded-lg transition-all"
          :class="viewMode === 'default' ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
          title="Tampilan Default"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
        </button>
        <button
          @click="viewMode = 'compact'"
          class="p-2 rounded-lg transition-all"
          :class="viewMode === 'compact' ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
          title="Tampilan Compact"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Type Filter -->
      <button
        v-for="filter in typeFilters"
        :key="filter.value"
        @click="filterType = filter.value"
        class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
        :class="filterType === filter.value
          ? filter.activeClass
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'"
      >
        {{ filter.label }}
      </button>

      <div class="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

      <!-- Category Filter -->
      <select
        v-model="filterCategory"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer appearance-none pr-7 bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem]"
        style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2394a3b8%22><path fill-rule=%22evenodd%22 d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%22 clip-rule=%22evenodd%22/></svg>')"
      >
        <option :value="null">Semua Kategori</option>
        <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">
          {{ cat.icon }} {{ cat.name }}
        </option>
      </select>

      <!-- Date Range Filter -->
      <select
        v-model="filterMonth"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer appearance-none pr-7 bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem]"
        style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2394a3b8%22><path fill-rule=%22evenodd%22 d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%22 clip-rule=%22evenodd%22/></svg>')"
      >
        <option :value="null">Semua Bulan</option>
        <option v-for="m in availableMonths" :key="m.value" :value="m.value">
          {{ m.label }}
        </option>
      </select>

      <!-- Sort -->
      <select
        v-model="sortBy"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer appearance-none pr-7 bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem]"
        style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2394a3b8%22><path fill-rule=%22evenodd%22 d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%22 clip-rule=%22evenodd%22/></svg>')"
      >
        <option value="date_desc">Terbaru</option>
        <option value="date_asc">Terlama</option>
        <option value="amount_desc">Terbesar</option>
        <option value="amount_asc">Terkecil</option>
      </select>

      <!-- Amount Range Toggle -->
      <button
        @click="showAmountFilter = !showAmountFilter"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        :class="(filterAmountMin || filterAmountMax)
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'"
      >
        💰 Jumlah
      </button>

      <div class="flex-1" />

      <!-- Result count -->
      <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
        {{ totalTransactions }} transaksi
      </span>
    </div>

    <!-- Amount Range Filter (collapsible) -->
    <div v-if="showAmountFilter" class="flex items-center gap-2 flex-wrap animate-fade-in">
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">Min</span>
        <input
          v-model="filterAmountMin"
          type="number"
          class="input h-8 text-xs pl-10 w-32"
          placeholder="0"
          min="0"
          step="10000"
        />
      </div>
      <span class="text-xs text-slate-400">—</span>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">Max</span>
        <input
          v-model="filterAmountMax"
          type="number"
          class="input h-8 text-xs pl-11 w-32"
          placeholder="∞"
          min="0"
          step="10000"
        />
      </div>
      <button
        v-if="filterAmountMin || filterAmountMax"
        @click="filterAmountMin = ''; filterAmountMax = ''"
        class="text-xs text-red-500 hover:text-red-600 font-medium"
      >
        Reset
      </button>
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
      <div v-if="isLoading" class="space-y-3 py-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-3 p-3 animate-pulse">
          <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          </div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
        </div>
      </div>

      <div v-else-if="paginatedTransactions.length === 0" class="text-center py-16 text-slate-400 dark:text-slate-500">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p class="text-base font-medium">{{ searchQuery ? 'Tidak ditemukan' : 'Belum ada transaksi' }}</p>
        <p class="text-sm mt-1">{{ searchQuery ? 'Coba ubah kata kunci pencarian' : 'Klik tombol + untuk menambah transaksi baru' }}</p>
      </div>

      <!-- DEFAULT VIEW MODE -->
      <template v-if="!isLoading && paginatedTransactions.length > 0 && viewMode === 'default'">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pl-1">Kategori</th>
                <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Tanggal</th>
                <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Deskripsi</th>
                <th class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Tipe</th>
                <th class="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-1">Jumlah</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="transaction in paginatedTransactions"
                :key="transaction.id"
                class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                @click="viewTransaction(transaction)"
              >
                <td class="py-3.5 pl-1">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      :style="{ backgroundColor: transaction.category_color + '18' }"
                    >
                      {{ transaction.category_icon }}
                    </div>
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ transaction.category_name }}</span>
                  </div>
                </td>
                <td class="py-3.5">
                  <span class="text-sm text-slate-500 dark:text-slate-400">{{ formatDate(transaction.transaction_date, 'medium') }}</span>
                </td>
                <td class="py-3.5">
                  <div class="flex items-center gap-2">
                    <button
                      @click.stop="togglePin(transaction.id)"
                      class="flex-shrink-0 p-0.5 rounded transition-colors"
                      :class="isPinned(transaction.id) ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'"
                      :title="isPinned(transaction.id) ? 'Unpin' : 'Pin'"
                    >
                      <svg class="w-3.5 h-3.5" :fill="isPinned(transaction.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </button>
                    <span class="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{{ transaction.description || '-' }}</span>
                    <span v-for="tag in getTags(transaction.id)" :key="tag" class="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium">#{{ tag }}</span>
                    <span v-if="transaction.receipt_image" class="text-slate-400" title="Ada foto struk">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    </span>
                    <span v-if="transaction.is_recurring" class="text-slate-400" title="Transaksi berulang">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                    </span>
                  </div>
                </td>
                <td class="py-3.5">
                  <span
                    class="badge"
                    :class="transaction.type === 'income' ? 'badge-green' : 'badge-red'"
                  >
                    {{ transaction.type === 'income' ? 'Masuk' : 'Keluar' }}
                  </span>
                </td>
                <td class="py-3.5 text-right pr-1">
                  <span
                    class="text-sm font-bold"
                    :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
                  >
                    {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile List (Default) -->
        <div class="md:hidden space-y-1">
          <div
            v-for="transaction in paginatedTransactions"
            :key="'m-' + transaction.id"
            class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer active:scale-[0.99]"
            @click="viewTransaction(transaction)"
          >
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              :style="{ backgroundColor: transaction.category_color + '18' }"
            >
              {{ transaction.category_icon }}
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ transaction.category_name }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">
                {{ formatDate(transaction.transaction_date, 'medium') }}
                <span v-if="transaction.description"> &middot; {{ transaction.description }}</span>
              </p>
            </div>

            <div class="text-right flex-shrink-0">
              <p
                class="text-sm font-bold"
                :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
              >
                {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
              </p>
              <div class="flex items-center gap-1 justify-end mt-0.5 text-slate-400">
                <svg v-if="transaction.receipt_image" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <svg v-if="transaction.is_recurring" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </div>
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
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, totalTransactions) }} dari {{ totalTransactions }}
      </p>

      <div class="flex items-center gap-1">
        <button
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Halaman pertama"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            @click="currentPage = page"
            class="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
            :class="currentPage === page
              ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'"
          >
            {{ page }}
          </button>
          <span v-else class="w-8 h-8 flex items-center justify-center text-xs text-slate-400">...</span>
        </template>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <button
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Halaman terakhir"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- Per page selector -->
      <select
        v-model="perPage"
        class="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-400 cursor-pointer"
      >
        <option :value="15">15/hal</option>
        <option :value="25">25/hal</option>
        <option :value="50">50/hal</option>
        <option :value="100">100/hal</option>
      </select>
    </div>

    <!-- FAB -->
    <button
      @click="showAddMenu = !showAddMenu"
      class="fixed bottom-20 lg:bottom-8 right-6 w-14 h-14 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/40 active:scale-95 transition-all z-40 flex items-center justify-center"
    >
      <svg class="w-6 h-6 transition-transform" :class="showAddMenu ? 'rotate-45' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>

    <!-- FAB Menu -->
    <transition name="fab-menu">
      <div v-if="showAddMenu" class="fixed bottom-36 lg:bottom-24 right-6 space-y-2 z-40">
        <button
          @click="showAddTransaction('income')"
          class="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all animate-slide-up"
        >
          <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span class="font-semibold text-sm">Pemasukan</span>
        </button>
        <button
          @click="showAddTransaction('expense')"
          class="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all animate-slide-up"
        >
          <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
            </svg>
          </div>
          <span class="font-semibold text-sm">Pengeluaran</span>
        </button>
      </div>
    </transition>

    <!-- FAB Overlay -->
    <div
      v-if="showAddMenu"
      class="fixed inset-0 z-30"
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import TransactionModal from '@/components/transaction/TransactionModal.vue'
import TransactionDetailModal from '@/components/transaction/TransactionDetailModal.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import { useTransactionMeta } from '@/composables/useTransactionMeta'
import { formatCurrency } from '@/utils/formatters'
import { formatDate } from '@/utils/dateHelpers'

const { transactions, totalTransactions, loadTransactions } = useTransactions()
const { categories: allCategories, loadCategories } = useCategories()
const { togglePin, isPinned, getTags } = useTransactionMeta()

const filterType = ref(null)
const filterCategory = ref(null)
const filterMonth = ref(null)
const filterAmountMin = ref('')
const filterAmountMax = ref('')
const sortBy = ref('date_desc')
const showAmountFilter = ref(false)
const searchQuery = ref('')
const viewMode = ref('default')
const currentPage = ref(1)
const perPage = ref(25)
const isLoading = ref(false)
const showModal = ref(false)
const showAddMenu = ref(false)
const transactionType = ref('expense')
const selectedTransaction = ref(null)
const editingTransaction = ref(null)

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

// Pagination computed
const totalPages = computed(() => Math.ceil(totalTransactions.value / perPage.value))

// paginatedTransactions: apply client-side amount filter and sort
const paginatedTransactions = computed(() => {
  let result = [...transactions.value]

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

onMounted(async () => {
  await loadCategories()
  await fetchTransactions()
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
</style>
