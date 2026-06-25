<template>
  <div class="category-insight-card">
    <div class="card-header" :style="{ borderLeftColor: insight.categoryColor }">
      <div class="header-left">
        <span class="category-icon">{{ insight.categoryIcon }}</span>
        <div>
          <h3 class="category-name">{{ insight.categoryName }}</h3>
          <p class="transaction-count">{{ insight.currentMonth.transactionCount }} transaksi</p>
        </div>
      </div>
      <div class="header-right">
        <p class="current-amount">{{ formatCurrency(insight.currentMonth.amount) }}</p>
      </div>
    </div>

    <!-- Anomaly Alert -->
    <div v-if="insight.anomaly.detected" class="anomaly-alert" :class="`severity-${insight.anomaly.severity}`">
      <span class="anomaly-icon">{{ insight.anomaly.direction === 'spike' ? '⬆️' : '⬇️' }}</span>
      <p>
        <strong>{{ insight.anomaly.direction === 'spike' ? 'Naik' : 'Turun' }}</strong>
        {{ Math.abs(insight.anomaly.percentageFromMean).toFixed(0) }}% dari rata-rata
        (Z-score: {{ insight.anomaly.zScore }})
      </p>
    </div>

    <!-- Comparisons -->
    <div class="comparisons">
      <div class="comparison-item">
        <p class="comparison-label">vs Bulan Lalu</p>
        <p class="comparison-value" :class="changeClass(insight.comparison.prevMonth.change)">
          {{ formatChange(insight.comparison.prevMonth.change) }}
        </p>
      </div>
      <div class="comparison-item">
        <p class="comparison-label">vs Rata-rata 3 Bulan</p>
        <p class="comparison-value" :class="changeClass(insight.comparison.threeMonthAvg.change)">
          {{ formatChange(insight.comparison.threeMonthAvg.change) }}
        </p>
      </div>
    </div>

    <!-- Patterns -->
    <div v-if="insight.patterns.peakDay" class="patterns">
      <h4 class="section-title">🔍 Pola Pengeluaran</h4>
      <div class="pattern-grid">
        <div class="pattern-item">
          <span class="pattern-icon">📅</span>
          <div>
            <p class="pattern-label">Hari Puncak</p>
            <p class="pattern-value">{{ insight.patterns.peakDay }}</p>
            <p class="pattern-detail">Rata-rata {{ formatCurrency(insight.patterns.peakDayAvg) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Merchants -->
    <div v-if="insight.patterns.topMerchants.length > 0" class="top-merchants">
      <h4 class="section-title">🏆 Top Merchants</h4>
      <div class="merchant-list">
        <div
          v-for="(merchant, index) in insight.patterns.topMerchants.slice(0, 3)"
          :key="index"
          class="merchant-item"
        >
          <span class="merchant-rank">#{{ index + 1 }}</span>
          <div class="merchant-info">
            <p class="merchant-name">{{ merchant.name }}</p>
            <p class="merchant-stats">{{ merchant.count }}x • {{ formatCurrency(merchant.total) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div v-if="insight.recommendations.length > 0" class="recommendations">
      <h4 class="section-title">💡 Rekomendasi</h4>
      <div
        v-for="(rec, index) in insight.recommendations"
        :key="index"
        class="recommendation-item"
        :class="`priority-${rec.priority}`"
      >
        <p class="rec-action">{{ rec.action }}</p>
        <p class="rec-impact">{{ rec.impact }}</p>
        <ul v-if="rec.tips && rec.tips.length > 0" class="rec-tips">
          <li v-for="(tip, tipIndex) in rec.tips" :key="tipIndex">{{ tip }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryInsight } from '@/composables/useAnalytics'

interface Props {
  insight: CategoryInsight
}

defineProps<Props>()

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatChange(change: number): string {
  const prefix = change > 0 ? '+' : ''
  return `${prefix}${change.toFixed(1)}%`
}

function changeClass(change: number): string {
  if (change > 10) return 'change-up'
  if (change < -10) return 'change-down'
  return 'change-neutral'
}
</script>

<style scoped>
.category-insight-card {
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  border-left: 4px solid transparent;
}

.dark .category-insight-card {
  background: #1f2937;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .card-header {
  border-bottom-color: #374151;
}

.header-left {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.category-icon {
  font-size: 2.5rem;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dark .category-name {
  color: #f3f4f6;
}

.transaction-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.dark .transaction-count {
  color: #9ca3af;
}

.current-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dark .current-amount {
  color: #f3f4f6;
}

.anomaly-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.severity-high {
  background-color: #fee2e2;
  color: #991b1b;
}

.dark .severity-high {
  background-color: #7f1d1d;
  color: #fee2e2;
}

.severity-medium {
  background-color: #fef3c7;
  color: #92400e;
}

.dark .severity-medium {
  background-color: #78350f;
  color: #fef3c7;
}

.anomaly-icon {
  font-size: 1.5rem;
}

.anomaly-alert p {
  margin: 0;
}

.comparisons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.comparison-item {
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  text-align: center;
}

.dark .comparison-item {
  background-color: #111827;
}

.comparison-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.dark .comparison-label {
  color: #9ca3af;
}

.comparison-value {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.change-up {
  color: #ef4444;
}

.change-down {
  color: #10b981;
}

.change-neutral {
  color: #6b7280;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.dark .section-title {
  color: #f3f4f6;
}

.patterns {
  margin-bottom: 1rem;
}

.pattern-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pattern-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.dark .pattern-item {
  background-color: #111827;
}

.pattern-icon {
  font-size: 1.5rem;
}

.pattern-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.dark .pattern-label {
  color: #9ca3af;
}

.pattern-value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0.25rem 0;
}

.dark .pattern-value {
  color: #f3f4f6;
}

.pattern-detail {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.dark .pattern-detail {
  color: #9ca3af;
}

.top-merchants {
  margin-bottom: 1rem;
}

.merchant-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.merchant-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.dark .merchant-item {
  background-color: #111827;
}

.merchant-rank {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f59e0b;
  min-width: 2rem;
}

.merchant-info {
  flex: 1;
}

.merchant-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dark .merchant-name {
  color: #f3f4f6;
}

.merchant-stats {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.dark .merchant-stats {
  color: #9ca3af;
}

.recommendations {
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.dark .recommendations {
  border-top-color: #374151;
}

.recommendation-item {
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  border-left: 3px solid;
}

.priority-high {
  background-color: #fee2e2;
  border-left-color: #ef4444;
  color: #991b1b;
}

.dark .priority-high {
  background-color: #7f1d1d;
  color: #fee2e2;
}

.priority-medium {
  background-color: #fef3c7;
  border-left-color: #f59e0b;
  color: #92400e;
}

.dark .priority-medium {
  background-color: #78350f;
  color: #fef3c7;
}

.priority-alert {
  background-color: #fed7aa;
  border-left-color: #f97316;
  color: #7c2d12;
}

.dark .priority-alert {
  background-color: #7c2d12;
  color: #fed7aa;
}

.rec-action {
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.rec-impact {
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.rec-tips {
  margin: 0.5rem 0 0 0;
  padding-left: 1.25rem;
  font-size: 0.875rem;
}

.rec-tips li {
  margin-bottom: 0.25rem;
}

@media (max-width: 640px) {
  .comparisons {
    grid-template-columns: 1fr;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
