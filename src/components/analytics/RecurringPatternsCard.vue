<template>
  <div class="recurring-patterns-card">
    <div class="card-header">
      <h3 class="card-title">🔄 Pola Transaksi Berulang</h3>
      <p class="card-subtitle">Deteksi otomatis transaksi yang berulang secara teratur</p>
    </div>

    <div class="patterns-summary">
      <div class="summary-item">
        <span class="summary-label">Total Pola</span>
        <span class="summary-value">{{ data.summary.totalPatterns }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Potensi Hemat/Tahun</span>
        <span class="summary-value">Rp {{ formatCurrency(data.summary.potentialSavings) }}</span>
      </div>
    </div>

    <div v-if="data.patterns.length === 0" class="empty-state">
      <p>Tidak ditemukan pola transaksi berulang</p>
      <p class="empty-hint">Minimal 3 transaksi serupa dalam 6 bulan terakhir</p>
    </div>

    <div v-else class="patterns-list">
      <div
        v-for="(pattern, index) in displayedPatterns"
        :key="index"
        class="pattern-item"
        :class="[`confidence-${getConfidenceLevel(pattern.confidence)}`]"
      >
        <div class="pattern-header">
          <div class="pattern-info">
            <span class="pattern-icon">{{ pattern.categoryIcon }}</span>
            <div class="pattern-details">
              <h4 class="pattern-name">{{ pattern.categoryName }}</h4>
              <p class="pattern-description" v-if="pattern.description">{{ pattern.description }}</p>
              <div class="pattern-meta">
                <span class="pattern-frequency" :class="`freq-${pattern.frequency}`">
                  {{ getFrequencyLabel(pattern.frequency) }}
                </span>
                <span class="pattern-occurrences">{{ pattern.occurrences }}x transaksi</span>
                <span class="pattern-confidence">
                  {{ Math.round(pattern.confidence) }}% confidence
                </span>
              </div>
            </div>
          </div>
          <div class="pattern-amount">
            <span class="amount-label">Rata-rata</span>
            <span class="amount-value">Rp {{ formatCurrency(pattern.avgAmount) }}</span>
          </div>
        </div>

        <div class="pattern-prediction">
          <div class="prediction-item">
            <span class="prediction-label">Transaksi Terakhir</span>
            <span class="prediction-value">{{ formatDate(pattern.lastDate) }}</span>
          </div>
          <div class="prediction-item">
            <span class="prediction-label">Prediksi Selanjutnya</span>
            <span class="prediction-value highlight">{{ formatDate(pattern.nextPredictedDate) }}</span>
          </div>
          <div class="prediction-item">
            <span class="prediction-label">Interval Rata-rata</span>
            <span class="prediction-value">{{ pattern.avgInterval }} hari</span>
          </div>
        </div>

        <div class="pattern-actions">
          <button class="action-button primary" @click="createRecurring(pattern)">
            ✅ Jadikan Recurring
          </button>
          <button class="action-button secondary" @click="viewTransactions(pattern)">
            👁️ Lihat Riwayat
          </button>
        </div>

        <!-- Transaction History (collapsible) -->
        <div v-if="expandedPattern === index" class="pattern-transactions">
          <h5 class="transactions-title">Riwayat Transaksi</h5>
          <div class="transactions-list">
            <div
              v-for="tx in pattern.transactions"
              :key="tx.id"
              class="transaction-item"
            >
              <span class="tx-date">{{ formatDate(tx.date) }}</span>
              <span class="tx-description">{{ tx.description || '-' }}</span>
              <span class="tx-amount">Rp {{ formatCurrency(tx.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="data.patterns.length > 5" class="show-more">
      <button @click="showAll = !showAll" class="show-more-button">
        {{ showAll ? 'Tampilkan Lebih Sedikit' : `Tampilkan Semua (${data.patterns.length})` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RecurringPatternsResult, RecurringPattern } from '@/composables/useAnalytics'

interface Props {
  data: RecurringPatternsResult
}

const props = defineProps<Props>()
const emit = defineEmits<{
  createRecurring: [pattern: RecurringPattern]
}>()

const showAll = ref(false)
const expandedPattern = ref<number | null>(null)

const displayedPatterns = computed(() => {
  return showAll.value ? props.data.patterns : props.data.patterns.slice(0, 5)
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
  }
  return labels[frequency] || frequency
}

function getConfidenceLevel(confidence: number): string {
  if (confidence >= 90) return 'high'
  if (confidence >= 70) return 'medium'
  return 'low'
}

function createRecurring(pattern: RecurringPattern) {
  emit('createRecurring', pattern)
}

function viewTransactions(pattern: RecurringPattern) {
  const index = props.data.patterns.indexOf(pattern)
  expandedPattern.value = expandedPattern.value === index ? null : index
}
</script>

<style scoped>
.recurring-patterns-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.patterns-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.patterns-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pattern-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  transition: all 0.2s;
}

.pattern-item.confidence-high {
  border-left: 4px solid #10b981;
}

.pattern-item.confidence-medium {
  border-left: 4px solid #f59e0b;
}

.pattern-item.confidence-low {
  border-left: 4px solid #6b7280;
}

.pattern-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.pattern-info {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.pattern-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.pattern-details {
  flex: 1;
}

.pattern-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.pattern-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.pattern-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
}

.pattern-frequency {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.pattern-frequency.freq-daily {
  background: #dbeafe;
  color: #1e40af;
}

.pattern-frequency.freq-weekly {
  background: #ddd6fe;
  color: #5b21b6;
}

.pattern-frequency.freq-monthly {
  background: #d1fae5;
  color: #065f46;
}

.pattern-frequency.freq-yearly {
  background: #fef3c7;
  color: #92400e;
}

.pattern-occurrences {
  color: #6b7280;
}

.pattern-confidence {
  color: #6b7280;
}

.pattern-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.amount-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.amount-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.pattern-prediction {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.prediction-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.prediction-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.prediction-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.prediction-value.highlight {
  color: #10b981;
}

.pattern-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.primary {
  background: #10b981;
  color: white;
}

.action-button.primary:hover {
  background: #059669;
}

.action-button.secondary {
  background: #f3f4f6;
  color: #1f2937;
}

.action-button.secondary:hover {
  background: #e5e7eb;
}

.pattern-transactions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.transactions-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transaction-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.tx-date {
  color: #6b7280;
}

.tx-description {
  color: #1f2937;
}

.tx-amount {
  font-weight: 600;
  color: #1f2937;
  text-align: right;
}

.show-more {
  margin-top: 1rem;
  text-align: center;
}

.show-more-button {
  padding: 0.5rem 1.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s;
}

.show-more-button:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .pattern-header {
    flex-direction: column;
    gap: 1rem;
  }

  .pattern-amount {
    align-items: flex-start;
  }

  .transaction-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .tx-amount {
    text-align: left;
  }
}
</style>
