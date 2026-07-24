<template>
  <div class="space-y-6 pb-20 lg:pb-0 animate-fade-in">
    <!-- Top Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
          <span>📊</span>
          <span>Laporan Keuangan</span>
        </h1>
        <p class="text-xs font-medium text-ink-500 dark:text-slate-400">Analisis arus kas, pola transaksi & ringkasan statistik</p>
      </div>

      <!-- Month Selector Dropdown -->
      <div class="w-full sm:w-64">
        <BaseSelect :model-value="selectedMonthIndex" @update:model-value="handleMonthChange" custom-class="!rounded-2xl h-12 !bg-surface dark:!bg-ink-900 !border-ink-900/10 dark:!border-white/10 text-xs font-extrabold text-ink-900 dark:text-white shadow-soft">
          <option v-for="(month, idx) in monthsList" :key="month.label" :value="idx">
            📅 {{ month.label }}
          </option>
        </BaseSelect>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <template v-if="isLoading">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkeletonCard v-for="i in 3" :key="i" variant="stat" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonCard v-for="i in 2" :key="i" variant="chart" />
      </div>
    </template>

    <template v-else>
      <!-- Hero Cashflow Overview Banner -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Main Net Balance Hero Card (8 cols) -->
        <div class="lg:col-span-8 relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-ink-900 text-white dark:bg-lime dark:text-ink-900 shadow-float flex flex-col justify-between">
          <!-- Background Decorative Circles -->
          <div class="absolute -right-12 -bottom-16 w-56 h-56 rounded-full border-[32px] opacity-15 pointer-events-none border-white dark:border-ink-900"></div>
          <div class="absolute -right-4 -top-8 w-28 h-28 rounded-3xl opacity-15 rotate-12 pointer-events-none bg-white dark:bg-ink-900"></div>

          <div class="relative z-10 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 dark:bg-ink-900/15 text-white dark:text-ink-900">
                ✦ Status Arus Kas Bulan Ini
              </span>
              <span
                class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                :class="summary.balance >= 0 ? 'bg-lime text-ink-900 dark:bg-ink-900 dark:text-lime' : 'bg-coral text-white'"
              >
                {{ summary.balance >= 0 ? '✓ Surplus Sehat' : '⚠️ Defisit' }}
              </span>
            </div>

            <div>
              <p class="text-xs font-extrabold uppercase tracking-widest opacity-80">Saldo Netto (Sisa Kas)</p>
              <h2 class="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">
                {{ summary.balance >= 0 ? '+' : '−' }} {{ formatCurrency(Math.abs(summary.balance)) }}
              </h2>
            </div>

            <!-- Savings / Income Ratio Visual Bar -->
            <div class="space-y-1.5 pt-2">
              <div class="flex justify-between text-xs font-extrabold opacity-90">
                <span>Rasio Tabungan Bulan Ini</span>
                <span>{{ summary.income > 0 ? Math.max(0, Math.round((summary.balance / summary.income) * 100)) : 0 }}% Tersimpan</span>
              </div>
              <div class="w-full h-3 rounded-full bg-white/20 dark:bg-ink-900/20 overflow-hidden p-0.5">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="summary.balance >= 0 ? 'bg-white dark:bg-ink-900' : 'bg-coral'"
                  :style="{ width: `${summary.income > 0 ? Math.min(100, Math.max(0, (summary.balance / summary.income) * 100)) : 0}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Sub Cards: Income & Expense (4 cols) -->
        <div class="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <!-- Total Pemasukan Card -->
          <div class="p-5 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft hover:-translate-y-1 hover:shadow-float transition-all duration-300 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-lime/25 text-ink-900 dark:text-lime flex items-center justify-center font-extrabold text-xl flex-shrink-0">
              ↑
            </div>
            <div class="min-w-0">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Total Pemasukan</p>
              <p class="font-display text-xl font-extrabold text-[#70a214] dark:text-lime truncate mt-0.5">
                {{ formatCurrency(summary.income) }}
              </p>
            </div>
          </div>

          <!-- Total Pengeluaran Card -->
          <div class="p-5 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft hover:-translate-y-1 hover:shadow-float transition-all duration-300 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-coral/15 text-coral flex items-center justify-center font-extrabold text-xl flex-shrink-0">
              ↓
            </div>
            <div class="min-w-0">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Total Pengeluaran</p>
              <p class="font-display text-xl font-extrabold text-coral truncate mt-0.5">
                {{ formatCurrency(summary.expense) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts & Leaderboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Donut Chart & Composition Card (5 cols) -->
        <div class="lg:col-span-5 p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-display text-base font-extrabold text-ink-900 dark:text-white">Komposisi Pengeluaran</h2>
              <span class="text-xs font-bold text-ink-400 dark:text-slate-500">{{ expenseByCategory.length }} Kategori</span>
            </div>

            <EmptyState
              v-if="expenseByCategory.length === 0"
              icon="chart"
              title="Belum ada transaksi"
              description="Tambahkan pengeluaran bulan ini untuk melihat komposisi"
              variant="secondary"
            />

            <div v-else>
              <div class="relative h-60 flex items-center justify-center my-2">
                <Doughnut :data="donutChartData" :options="donutChartOptions" />
                <!-- Centered Donut Label -->
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">Total Terpakai</span>
                  <span class="font-display text-base font-extrabold text-ink-900 dark:text-white">{{ formatCompactNumber(summary.expense) }}</span>
                </div>
              </div>

              <!-- Top Legend Grid -->
              <div class="mt-4 grid grid-cols-2 gap-2">
                <div v-for="cat in expenseByCategory.slice(0, 4)" :key="cat.id" class="flex items-center gap-2 p-2 rounded-2xl bg-canvas dark:bg-ink-800 border border-ink-900/5 dark:border-white/5">
                  <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: cat.color }"></div>
                  <span class="text-xs font-bold text-ink-900 dark:text-white truncate flex-1">{{ cat.name }}</span>
                  <span class="text-xs font-extrabold text-ink-500 dark:text-slate-400">{{ Math.round((cat.total / summary.expense) * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ranked Category Leaderboard (7 cols) -->
        <div class="lg:col-span-7 p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-display text-base font-extrabold text-ink-900 dark:text-white">Leaderboard Pengeluaran Terbesar</h2>
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold bg-canvas dark:bg-ink-800 text-ink-500 dark:text-slate-400 uppercase tracking-wider">Peringkat Kategori</span>
          </div>

          <div v-if="expenseByCategory.length === 0" class="text-center py-12 text-ink-400 dark:text-slate-500">
            <p class="text-xs font-bold">Tidak ada data pengeluaran bulan ini</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(cat, idx) in expenseByCategory"
              :key="'lb-' + cat.id"
              class="group p-3 rounded-2xl bg-canvas/60 dark:bg-ink-800/60 hover:bg-canvas dark:hover:bg-ink-800 border border-ink-900/5 dark:border-white/5 transition-all duration-200"
            >
              <div class="flex items-center gap-3 mb-2">
                <!-- Rank Badge -->
                <span
                  class="w-6 h-6 rounded-xl flex items-center justify-center font-display text-xs font-extrabold flex-shrink-0"
                  :class="idx === 0 ? 'bg-coral text-white' : idx === 1 ? 'bg-lime text-ink-900' : 'bg-canvas dark:bg-ink-900 text-ink-500 dark:text-slate-400'"
                >
                  #{{ idx + 1 }}
                </span>

                <!-- Category Icon -->
                <div
                  class="w-9 h-9 rounded-2xl flex items-center justify-center text-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-sm"
                  :style="{ backgroundColor: cat.color + '25' }"
                >
                  {{ cat.icon }}
                </div>

                <!-- Category Title -->
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-extrabold text-ink-900 dark:text-white truncate">{{ cat.name }}</p>
                  <p class="text-[10px] font-bold text-ink-400 dark:text-slate-400 truncate">
                    {{ Math.round((cat.total / summary.expense) * 100) }}% dari total pengeluaran
                  </p>
                </div>

                <!-- Amount -->
                <div class="text-right flex-shrink-0">
                  <p class="font-display text-xs font-extrabold text-ink-900 dark:text-white">{{ formatCurrency(cat.total) }}</p>
                </div>
              </div>

              <!-- Animated Progress Fill -->
              <div class="w-full bg-surface dark:bg-ink-900 rounded-full h-2 overflow-hidden">
                <div
                  class="h-2 rounded-full transition-all duration-700"
                  :style="{
                    width: `${(cat.total / summary.expense) * 100}%`,
                    backgroundColor: cat.color
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Chart Section (Full Width) -->
      <div class="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-base font-extrabold text-ink-900 dark:text-white">Tren Keuangan 6 Bulan Terakhir</h2>
            <p class="text-[11px] font-medium text-ink-500 dark:text-slate-400">Perbandingan pergerakan pemasukan & pengeluaran berkala</p>
          </div>
        </div>

        <EmptyState
          v-if="!trendChartData"
          icon="chart"
          title="Tidak ada data tren"
          description="Tambahkan transaksi berkala untuk mengaktifkan grafik tren"
          variant="secondary"
        />

        <div v-else class="h-64 sm:h-72">
          <Line :data="trendChartData" :options="lineChartOptions" />
        </div>
      </div>

      <!-- Financial Habits & Spending Patterns Grid -->
      <div v-if="spendingPatterns" class="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-display text-base font-extrabold text-ink-900 dark:text-white">Pola & Kebiasaan Transaksi</h2>
            <p class="text-[11px] font-medium text-ink-500 dark:text-slate-400">Deteksi kebiasaan belanja harian & tren pengeluaran</p>
          </div>
        </div>

        <!-- Key Insights Grid Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Card 1: Rata-rata Harian -->
          <div class="p-4.5 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-lime/25 text-ink-900 dark:text-lime flex items-center justify-center text-lg flex-shrink-0">
              📅
            </div>
            <div>
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Rata-rata/Hari</p>
              <p class="font-display text-sm font-extrabold text-ink-900 dark:text-white mt-0.5">{{ formatCurrency(spendingPatterns.dailyAverage) }}</p>
            </div>
          </div>

          <!-- Card 2: Hari Terboros -->
          <div class="p-4.5 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-coral/20 text-coral flex items-center justify-center text-lg flex-shrink-0">
              🔥
            </div>
            <div>
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-coral">Hari Terboros</p>
              <p class="font-display text-sm font-extrabold text-coral mt-0.5">{{ spendingPatterns.peakDay?.day || 'TBA' }}</p>
            </div>
          </div>

          <!-- Card 3: Status Pola -->
          <div class="p-4.5 rounded-2xl bg-canvas/70 dark:bg-ink-800/70 border border-ink-900/5 dark:border-white/5 flex items-center gap-3 sm:col-span-2 lg:col-span-1">
            <div class="w-10 h-10 rounded-2xl bg-violet/20 text-violet dark:text-lime flex items-center justify-center text-lg flex-shrink-0">
              ⚡
            </div>
            <div>
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400">Status Konsumsi</p>
              <p class="font-display text-sm font-extrabold text-ink-900 dark:text-white mt-0.5">
                {{ summary.income > 0 && summary.expense > summary.income ? 'Pengeluaran Tinggi' : 'Terkendali Safe' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Day of Week Histogram & Period Distribution -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <!-- Day of Week Distribution -->
          <div class="space-y-3">
            <p class="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-slate-400">Intensitas Pengeluaran per Hari</p>
            <div class="space-y-2">
              <div v-for="day in spendingPatterns.dayOfWeek" :key="day.dayIndex" class="flex items-center gap-3">
                <span class="text-[11px] font-extrabold text-ink-500 dark:text-slate-400 w-10 flex-shrink-0">{{ day.day.substring(0, 3) }}</span>
                <div class="flex-1 bg-canvas dark:bg-ink-800 rounded-full h-3 overflow-hidden">
                  <div
                    class="h-3 rounded-full transition-all duration-500"
                    :class="day.dayIndex === spendingPatterns.peakDay?.dayIndex ? 'bg-coral' : 'bg-lime dark:bg-lime-deep'"
                    :style="{ width: `${maxDayTotal > 0 ? (day.total / maxDayTotal) * 100 : 0}%` }"
                  />
                </div>
                <span class="text-[11px] font-extrabold text-ink-900 dark:text-white w-16 text-right tabular-nums">{{ formatCompactNumber(day.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Period Distribution -->
          <div class="space-y-3">
            <p class="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-slate-400">Distribusi per Periode Waktu</p>
            <div class="space-y-2.5">
              <div v-for="period in spendingPatterns.periodAnalysis" :key="period.label" class="flex items-center gap-3 p-2 rounded-2xl bg-canvas/60 dark:bg-ink-800/60">
                <span class="text-[11px] font-bold text-ink-500 dark:text-slate-400 w-28 flex-shrink-0 truncate">{{ period.label }}</span>
                <div class="flex-1 bg-surface dark:bg-ink-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    class="h-2.5 rounded-full bg-violet transition-all duration-500"
                    :style="{ width: `${period.percentage}%` }"
                  />
                </div>
                <span class="text-[11px] font-extrabold text-ink-900 dark:text-white w-10 text-right">{{ period.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Comparison Timeline Card -->
      <div class="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft">
        <h2 class="font-display text-base font-extrabold text-ink-900 dark:text-white mb-4">Perbandingan Bulanan & Riwayat Trend</h2>
        <div class="space-y-0 divide-y divide-ink-900/5 dark:divide-white/5">
          <div v-for="(month, idx) in comparisonData" :key="month.label" class="py-3.5 first:pt-0 last:pb-0">
            <div class="flex items-center justify-between mb-2">
              <p class="font-display text-xs font-extrabold text-ink-900 dark:text-white">{{ month.label }}</p>
              <button
                @click="toggleMonthDetail(idx)"
                class="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-canvas dark:bg-ink-800 text-ink-900 dark:text-white hover:bg-lime hover:text-ink-900 transition-all"
              >
                {{ expandedMonthIdx === idx ? 'Tutup Detail' : 'Lihat Detail' }}
              </button>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400 mb-0.5">Pemasukan</p>
                <p class="font-display text-xs font-extrabold text-[#70a214] dark:text-lime">{{ formatCurrency(month.income) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400 mb-0.5">Pengeluaran</p>
                <p class="font-display text-xs font-extrabold text-coral">{{ formatCurrency(month.expense) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400 mb-0.5">Saldo</p>
                <p class="font-display text-xs font-extrabold" :class="month.balance >= 0 ? 'text-ink-900 dark:text-white' : 'text-coral'">
                  {{ formatCurrency(month.balance) }}
                </p>
              </div>
            </div>

            <!-- Expanded Category Breakdown -->
            <div v-if="expandedMonthIdx === idx" class="mt-3 pt-3 border-t border-ink-900/5 dark:border-white/5 animate-fade-in">
              <div v-if="monthDetailLoading" class="text-center py-3">
                <span class="text-xs font-bold text-ink-400">Memuat detail...</span>
              </div>
              <div v-else-if="monthDetailData.length > 0" class="space-y-2">
                <div v-for="cat in monthDetailData" :key="cat.id" class="flex items-center gap-2 p-2 rounded-2xl bg-canvas/60 dark:bg-ink-800/60">
                  <span class="text-sm">{{ cat.icon }}</span>
                  <span class="text-xs font-bold text-ink-900 dark:text-white flex-1 truncate">{{ cat.name }}</span>
                  <span class="font-display text-xs font-extrabold text-ink-900 dark:text-white">{{ formatCurrency(cat.total) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Year-in-Review Showcase Card -->
      <div class="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-base font-extrabold text-ink-900 dark:text-white">Ringkasan Tahunan Showcase</h2>
            <p class="text-[11px] font-medium text-ink-500 dark:text-slate-400">Evaluasi performa finansial secara keseluruhan</p>
          </div>
          <BaseSelect
            v-model="reviewYear"
            @update:modelValue="loadYearReview"
            size="sm"
            custom-class="!rounded-xl !bg-canvas dark:!bg-ink-800 !border-ink-900/10 text-xs font-bold"
          >
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </BaseSelect>
        </div>

        <div v-if="yearReviewLoading" class="text-center py-8">
          <div class="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>

        <div v-else-if="yearReview">
          <!-- Key Stats Grid -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div class="p-4 rounded-2xl bg-lime/15 dark:bg-lime/10 border border-lime/20">
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-900 dark:text-lime mb-1">Total Pemasukan</p>
              <p class="font-display text-sm font-extrabold text-[#70a214] dark:text-lime truncate">{{ formatCurrency(yearReview.totalIncome) }}</p>
            </div>
            <div class="p-4 rounded-2xl bg-coral/15 dark:bg-coral/10 border border-coral/20">
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-coral mb-1">Total Pengeluaran</p>
              <p class="font-display text-sm font-extrabold text-coral truncate">{{ formatCurrency(yearReview.totalExpense) }}</p>
            </div>
            <div class="p-4 rounded-2xl bg-canvas dark:bg-ink-800 border border-ink-900/5 dark:border-white/5">
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400 mb-1">Total Ditabung</p>
              <p class="font-display text-sm font-extrabold text-ink-900 dark:text-white truncate">{{ formatCurrency(yearReview.totalSaved) }}</p>
            </div>
            <div class="p-4 rounded-2xl bg-canvas dark:bg-ink-800 border border-ink-900/5 dark:border-white/5">
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-ink-400 dark:text-slate-400 mb-1">Rasio Tabungan</p>
              <p class="font-display text-sm font-extrabold text-violet dark:text-lime truncate">{{ yearReview.savingsRate }}%</p>
            </div>
          </div>

          <!-- Highlights & Top Categories -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div v-if="yearReview.bestMonth" class="flex items-center gap-2.5 text-xs p-3 rounded-2xl bg-canvas/60 dark:bg-ink-800/60">
                <span class="text-base">🏆</span>
                <span class="text-ink-500 dark:text-slate-400 font-bold">Bulan Terbaik:</span>
                <span class="font-extrabold text-ink-900 dark:text-white ml-auto">{{ yearReview.bestMonth.label }}</span>
              </div>
              <div v-if="yearReview.highestExpenseMonth" class="flex items-center gap-2.5 text-xs p-3 rounded-2xl bg-canvas/60 dark:bg-ink-800/60">
                <span class="text-base">💸</span>
                <span class="text-ink-500 dark:text-slate-400 font-bold">Pengeluaran Tertinggi:</span>
                <span class="font-extrabold text-coral ml-auto">{{ yearReview.highestExpenseMonth.label }} ({{ formatCurrency(yearReview.highestExpenseMonth.expense) }})</span>
              </div>
            </div>

            <div v-if="yearReview.topCategories.length > 0">
              <p class="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-slate-400 mb-2">Top Kategori Tahunan</p>
              <div class="space-y-1.5">
                <div v-for="(cat, i) in yearReview.topCategories.slice(0, 3)" :key="'yr-' + cat.id" class="flex items-center gap-2.5 p-2.5 rounded-2xl bg-canvas/60 dark:bg-ink-800/60">
                  <span class="text-[10px] font-extrabold text-ink-400 w-4">#{{ i + 1 }}</span>
                  <span class="text-base">{{ cat.icon }}</span>
                  <span class="text-xs font-bold text-ink-900 dark:text-white flex-1 truncate">{{ cat.name }}</span>
                  <span class="font-display text-xs font-extrabold text-ink-900 dark:text-white">{{ formatCurrency(cat.total) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6 text-ink-400 dark:text-slate-500">
          <p class="text-xs font-bold">Belum ada data untuk tahun ini</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Doughnut } from 'vue-chartjs'
import BaseSelect from '@/components/common/BaseSelect.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useTransactions } from '@/composables/useTransactions'
import { useSpendingPatterns } from '@/composables/useSpendingPatterns'
import { useYearReview } from '@/composables/useYearReview'
import { formatCurrency, formatCompactNumber, formatNumber } from '@/utils/formatters'
import { getMonthsList, getMonthRange, getMonthName } from '@/utils/dateHelpers'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const { getSummary, getExpenseByCategory } = useTransactions()
const { patterns: spendingPatterns, analyzePatterns } = useSpendingPatterns()
const { review: yearReview, loading: yearReviewLoading, generateReview } = useYearReview()

const currentYear = new Date().getFullYear()
const reviewYear = ref(currentYear)
const availableYears = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 3; y--) years.push(y)
  return years
})

const loadYearReview = () => {
  generateReview(reviewYear.value)
}

const monthsList = getMonthsList()
const selectedMonthIndex = ref(0)
const selectedMonth = computed(() => monthsList[selectedMonthIndex.value])

const handleMonthChange = (value) => {
  // Ensure value is a number
  selectedMonthIndex.value = typeof value === 'number' ? value : parseInt(value, 10)
  loadData()
}

// Computed for max day total (for bar width calculation)
const maxDayTotal = computed(() => {
  if (!spendingPatterns.value) return 0
  return Math.max(...spendingPatterns.value.dayOfWeek.map(d => d.total))
})
const summary = ref({ income: 0, expense: 0, balance: 0 })
const expenseByCategory = ref([])
const comparisonData = ref([])
const trendChartData = ref(null)
const isLoading = ref(true)
const expandedMonthIdx = ref(null)
const monthDetailData = ref([])
const monthDetailLoading = ref(false)

/**
 * Toggle month detail: load per-category breakdown for that month
 * and compare with the previous month
 */
const toggleMonthDetail = async (idx) => {
  if (expandedMonthIdx.value === idx) {
    expandedMonthIdx.value = null
    return
  }

  expandedMonthIdx.value = idx
  monthDetailLoading.value = true
  monthDetailData.value = []

  try {
    const month = monthsList[idx]
    const { start, end } = getMonthRange(month.year, month.month)

    // Get expense by category for this month
    const thisMonthCats = await getExpenseByCategory(start, end)

    // Get previous month for comparison
    let prevCats = []
    if (idx + 1 < monthsList.length) {
      const prevMonth = monthsList[idx + 1]
      const prevRange = getMonthRange(prevMonth.year, prevMonth.month)
      prevCats = await getExpenseByCategory(prevRange.start, prevRange.end)
    }

    // Build comparison map
    const prevMap = {}
    prevCats.forEach(c => { prevMap[c.id] = c.total })

    monthDetailData.value = thisMonthCats.map(c => ({
      ...c,
      change: prevMap[c.id] && prevMap[c.id] > 0
        ? Math.round(((c.total - prevMap[c.id]) / prevMap[c.id]) * 100)
        : null,
    }))
  } catch (err) {
    console.error('Error loading month detail:', err)
  } finally {
    monthDetailLoading.value = false
  }
}

// Donut chart
const donutChartData = computed(() => {
  if (expenseByCategory.value.length === 0) return null
  return {
    labels: expenseByCategory.value.map(c => c.name),
    datasets: [{
      data: expenseByCategory.value.map(c => c.total),
      backgroundColor: expenseByCategory.value.map(c => c.color),
      borderWidth: 0,
      hoverOffset: 6
    }]
  }
})

const donutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const value = ctx.raw
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
          const pct = Math.round((value / total) * 100)
          return ` ${formatCurrency(value)} (${pct}%)`
        }
      }
    }
  }
}

// Line chart options
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#94a3b8' }
    },
    y: {
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: {
        font: { size: 11 },
        color: '#94a3b8',
        callback: (val) => formatCompactNumber(val)
      }
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, padding: 16, font: { size: 11 } }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
      }
    }
  },
  elements: {
    line: { tension: 0.3 },
    point: { radius: 4, hoverRadius: 6 }
  }
}

const buildTrendChart = (comparisons) => {
  const labels = comparisons.map(c => c.label.split(' ')[0].substring(0, 3))
  trendChartData.value = {
    labels: labels.reverse(),
    datasets: [
      {
        label: 'Pemasukan',
        data: comparisons.map(c => c.income).reverse(),
        borderColor: '#70a214',
        backgroundColor: 'rgba(200, 241, 109, 0.2)',
        fill: true,
        borderWidth: 2.5
      },
      {
        label: 'Pengeluaran',
        data: comparisons.map(c => c.expense).reverse(),
        borderColor: '#ff8068',
        backgroundColor: 'rgba(255, 128, 104, 0.15)',
        fill: true,
        borderWidth: 2.5
      }
    ]
  }
}

const loadData = async () => {
  isLoading.value = true

  try {
    // Ensure selectedMonth is valid
    if (!selectedMonth.value || !selectedMonth.value.year || !selectedMonth.value.month) {
      console.error('Invalid selectedMonth:', selectedMonth.value, 'selectedMonthIndex:', selectedMonthIndex.value)
      isLoading.value = false
      return
    }

    const { start, end } = getMonthRange(selectedMonth.value.year, selectedMonth.value.month)

    const [summaryData, expenseByCat] = await Promise.all([
      getSummary(start, end),
      getExpenseByCategory(start, end)
    ])

    summary.value = summaryData
    expenseByCategory.value = expenseByCat

    // Build comparison data (last 6 months)
    const comparisons = []
    for (const month of monthsList.slice(0, 6)) {
      const { start, end } = getMonthRange(month.year, month.month)
      const data = await getSummary(start, end)

      comparisons.push({
        label: month.label,
        income: data.income,
        expense: data.expense,
        balance: data.balance
      })
    }
    comparisonData.value = comparisons
    buildTrendChart(comparisons)

    // Analyze spending patterns (non-blocking)
    analyzePatterns()

    // Load year review (non-blocking)
    loadYearReview()
  } catch (error) {
    console.error('Error loading report data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
