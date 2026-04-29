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

      <div class="flex-1" />

      <!-- Result count -->
      <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
        {{ filteredTransactions.length }} transaksi
      </span>
    </div>

    <!-- Transactions Card -->
    <div class="card">
      <div v-if="filteredTransactions.length === 0" class="text-center py-16 text-slate-400 dark:text-slate-500">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p class="text-base font-medium">{{ searchQuery ? 'Tidak ditemukan' : 'Belum ada transaksi' }}</p>
        <p class="text-sm mt-1">{{ searchQuery ? 'Coba ubah kata kunci pencarian' : 'Klik tombol + untuk menambah transaksi baru' }}</p>
      </div>

      <!-- DEFAULT VIEW MODE -->
      <template v-if="paginatedTransactions.length > 0 && viewMode === 'default'">
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
                    <span class="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{{ transaction.description || '-' }}</span>
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
      <template v-if="paginatedTransactions.length > 0 && viewMode === 'compact'">
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
        {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, filteredTransactions.length) }} dari {{ filteredTransactions.length }}
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
import { formatCurrency } from '@/utils/formatters'
import { formatDate } from '@/utils/dateHelpers'

const { transactions, loadTransactions } = useTransactions()
const { categories: allCategories, loadCategories } = useCategories()

const filterType = ref(null)
const filterCategory = ref(null)
const filterMonth = ref(null)
const searchQuery = ref('')
const viewMode = ref('default')
const currentPage = ref(1)
const perPage = ref(25)
const showModal = ref(false)
const showAddMenu = ref(false)
const transactionType = ref('expense')
const selectedTransaction = ref(null)
const editingTransaction = ref(null)

const typeFilters = [
  { value: null, label: 'Semua', activeClass: 'bg-primary-500 text-white shadow-sm shadow-primary-500/25' },
  { value: 'income', label: 'Pemasukan', activeClass: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25' },
  { value: 'expense', label: 'Pengeluaran', activeClass: 'bg-red-500 text-white shadow-sm shadow-red-500/25' },
]

// Available months from transactions
const availableMonths = computed(() => {
  const months = new Set()
  transactions.value.forEach(t => {
    const d = t.transaction_date
    if (d) {
      const ym = d.substring(0, 7) // "2026-04"
      months.add(ym)
    }
  })

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

  return Array.from(months)
    .sort()
    .reverse()
    .map(ym => {
      const [year, month] = ym.split('-')
      return {
        value: ym,
        label: `${monthNames[parseInt(month) - 1]} ${year}`
      }
    })
})

// Filtered transactions
const filteredTransactions = computed(() => {
  let result = transactions.value

  // Type filter
  if (filterType.value) {
    result = result.filter(t => t.type === filterType.value)
  }

  // Category filter
  if (filterCategory.value) {
    result = result.filter(t => t.category_id === filterCategory.value)
  }

  // Month filter
  if (filterMonth.value) {
    result = result.filter(t => t.transaction_date && t.transaction_date.startsWith(filterMonth.value))
  }

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(t => {
      return (t.description && t.description.toLowerCase().includes(q)) ||
             (t.category_name && t.category_name.toLowerCase().includes(q)) ||
             (t.amount && t.amount.toString().includes(q))
    })
  }

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / perPage.value))

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredTransactions.value.slice(start, end)
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

// Reset page when filters change
watch([filterType, filterCategory, filterMonth, searchQuery, perPage], () => {
  currentPage.value = 1
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
  await loadTransactions()
}

const handleDeleted = async () => {
  selectedTransaction.value = null
  await loadTransactions()
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
  await loadTransactions()
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
