<template>
  <div class="analytics-view">
    <div class="page-header">
      <h1 class="page-title">📊 Analytics & Insights</h1>
      <p class="page-subtitle">Analisis mendalam tentang keuangan Anda</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Memuat data analytics...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="loadAllAnalytics" class="retry-button">Coba Lagi</button>
    </div>

    <!-- Content -->
    <div v-else class="analytics-content">
      <!-- Budget Alerts Section -->
      <section v-if="budgetAlerts && budgetAlerts.length > 0" class="analytics-section">
        <h2 class="section-title">🎯 Budget Alerts</h2>
        <div class="budget-alerts-grid">
          <BudgetAlertCard
            v-for="alert in priorityAlerts"
            :key="alert.budgetId"
            :alert="alert"
          />
        </div>
        <div v-if="budgetAlerts.length > 3" class="show-more">
          <button @click="showAllBudgets = !showAllBudgets" class="show-more-button">
            {{ showAllBudgets ? 'Tampilkan Lebih Sedikit' : `Tampilkan Semua (${budgetAlerts.length})` }}
          </button>
        </div>
      </section>

      <!-- Spending Velocity -->
      <section v-if="spendingVelocity" class="analytics-section">
        <SpendingVelocityWidget :velocity="spendingVelocity" />
      </section>

      <!-- Savings Rate History -->
      <section v-if="savingsRateHistory" class="analytics-section">
        <SavingsRateChart :data="savingsRateHistory" />
      </section>

      <!-- Income vs Expense Trend -->
      <section v-if="trendData" class="analytics-section">
        <TrendChart :data="trendData" @update:granularity="handleGranularityChange" />
      </section>

      <!-- Category Insights Section -->
      <section class="analytics-section">
        <div class="section-header">
          <h2 class="section-title">🔍 Category Insights</h2>
          <select v-model="selectedCategoryId" class="category-select">
            <option :value="null" disabled>Pilih Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>
        <CategoryInsightCard v-if="categoryInsights" :insight="categoryInsights" />
        <div v-else class="empty-state">
          <p>Pilih kategori untuk melihat insights</p>
        </div>
      </section>

      <!-- Cashflow Forecast -->
      <section v-if="cashflowForecast" class="analytics-section">
        <ForecastChart :data="cashflowForecast" />
      </section>

      <!-- Recurring Patterns Detection -->
      <section v-if="recurringPatterns" class="analytics-section">
        <RecurringPatternsCard
          :data="recurringPatterns"
          @create-recurring="handleCreateRecurring"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { useCategories } from '@/composables/useCategories'
import type { RecurringPattern } from '@/composables/useAnalytics'
import BudgetAlertCard from '@/components/analytics/BudgetAlertCard.vue'
import SpendingVelocityWidget from '@/components/analytics/SpendingVelocityWidget.vue'
import SavingsRateChart from '@/components/analytics/SavingsRateChart.vue'
import TrendChart from '@/components/analytics/TrendChart.vue'
import CategoryInsightCard from '@/components/analytics/CategoryInsightCard.vue'
import ForecastChart from '@/components/analytics/ForecastChart.vue'
import RecurringPatternsCard from '@/components/analytics/RecurringPatternsCard.vue'

const {
  budgetAlerts,
  spendingVelocity,
  savingsRateHistory,
  trendData,
  categoryInsights,
  cashflowForecast,
  recurringPatterns,
  loading,
  error,
  fetchBudgetAlerts,
  fetchSpendingVelocity,
  fetchSavingsRateHistory,
  fetchTrend,
  fetchCategoryInsights,
  fetchCashflowForecast,
  fetchRecurringPatterns,
} = useAnalytics()

const { categories, loadCategories } = useCategories()

const selectedCategoryId = ref<number | null>(null)
const showAllBudgets = ref(false)
const trendGranularity = ref<'day' | 'week' | 'month' | 'year'>('month')

// Priority alerts (show highest priority first)
const priorityAlerts = computed(() => {
  if (!budgetAlerts.value) return []

  const tierOrder = ['CRITICAL', 'EXCEEDED', 'WARNING', 'CAUTION', 'SAFE']
  const sorted = [...budgetAlerts.value].sort((a, b) => {
    return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
  })

  return showAllBudgets.value ? sorted : sorted.slice(0, 3)
})

// Watch selected category
watch(selectedCategoryId, async (newCategoryId) => {
  if (newCategoryId) {
    await fetchCategoryInsights(newCategoryId, 6)
  }
})

// Handle granularity change for trend chart
async function handleGranularityChange(newGranularity: 'day' | 'week' | 'month' | 'year') {
  trendGranularity.value = newGranularity
  await loadTrendData()
}

// Load trend data with current settings
async function loadTrendData() {
  const now = new Date()
  let startDate: string
  let endDate = now.toISOString().split('T')[0]

  switch (trendGranularity.value) {
    case 'day':
      // Last 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      break
    case 'week':
      // Last 12 weeks
      startDate = new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      break
    case 'year':
      // Last 5 years
      startDate = new Date(now.getFullYear() - 5, 0, 1).toISOString().split('T')[0]
      break
    default:
      // Last 12 months
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString().split('T')[0]
  }

  await fetchTrend(startDate, endDate, trendGranularity.value)
}

// Load all analytics data
async function loadAllAnalytics() {
  try {
    loading.value = true
    error.value = null

    await Promise.all([
      fetchBudgetAlerts(),
      fetchSpendingVelocity(),
      fetchSavingsRateHistory(12),
      loadTrendData(),
      fetchCashflowForecast(3),
      fetchRecurringPatterns(3),
      loadCategories(),
    ])
  } catch (err) {
    console.error('Error loading analytics:', err)
  } finally {
    loading.value = false
  }
}

// Handle create recurring from pattern
function handleCreateRecurring(pattern: RecurringPattern) {
  // TODO: Navigate to transaction form with pre-filled data
  console.log('Creating recurring transaction from pattern:', pattern)
  alert(`Fitur ini akan mengarahkan ke form transaksi dengan data:\n\nKategori: ${pattern.categoryName}\nAmount: Rp ${pattern.avgAmount.toLocaleString('id-ID')}\nFrequency: ${pattern.frequency}\n\n(Coming soon...)`)
}

onMounted(() => {
  loadAllAnalytics()
})
</script>

<style scoped>
.analytics-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.dark .page-title {
  color: #f3f4f6;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.dark .page-subtitle {
  color: #9ca3af;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  font-size: 1.125rem;
  color: #ef4444;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #2563eb;
}

.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.analytics-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.dark .section-title {
  color: #f3f4f6;
}

.budget-alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.show-more {
  margin-top: 1rem;
  text-align: center;
}

.show-more-button {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #111827;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.dark .show-more-button {
  background-color: #374151;
  color: #f3f4f6;
}

.show-more-button:hover {
  background-color: #e5e7eb;
}

.dark .show-more-button:hover {
  background-color: #4b5563;
}

.category-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  color: #111827;
  font-size: 0.875rem;
  cursor: pointer;
}

.dark .category-select {
  background-color: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.dark .empty-state {
  background: #1f2937;
}

.empty-state p {
  color: #6b7280;
  font-size: 1rem;
}

.dark .empty-state p {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .analytics-view {
    padding: 1rem 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .budget-alerts-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .category-select {
    width: 100%;
  }
}
</style>
