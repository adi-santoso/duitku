<template>
  <div class="velocity-widget" :class="`velocity-${velocity.velocity}`">
    <div class="widget-header">
      <h3 class="widget-title">
        <span class="fire-icon">🔥</span>
        Spending Velocity
      </h3>
      <span class="velocity-badge" :class="`badge-${velocity.velocity}`">
        {{ velocityText }}
      </span>
    </div>

    <div class="velocity-bar-container">
      <div class="velocity-bar">
        <div
          class="velocity-progress"
          :style="{ width: `${progressPercentage}%`, backgroundColor: velocityColor }"
        ></div>
      </div>
      <span class="velocity-percentage">{{ progressPercentage.toFixed(0) }}%</span>
    </div>

    <div class="velocity-stats">
      <div class="stat-item">
        <p class="stat-label">Rata-rata per hari</p>
        <p class="stat-value">{{ formatCurrency(velocity.dailyRate) }}</p>
      </div>

      <div class="stat-item">
        <p class="stat-label">Terpakai ({{ velocity.daysPassed }} hari)</p>
        <p class="stat-value">{{ formatCurrency(velocity.currentSpent) }}</p>
      </div>

      <div class="stat-item">
        <p class="stat-label">Proyeksi akhir bulan</p>
        <p class="stat-value projected">{{ formatCurrency(velocity.projectedTotal) }}</p>
      </div>
    </div>

    <div v-if="velocity.isOverpacing" class="warning-message">
      <span class="warning-icon">⚠️</span>
      <p>
        Pengeluaran
        <strong>{{ Math.abs(velocity.percentageVsHistorical).toFixed(0) }}% lebih cepat</strong>
        dari biasanya ({{ velocity.daysLeft }} hari tersisa)
      </p>
    </div>

    <div v-else-if="velocity.percentageVsHistorical < -20" class="success-message">
      <span class="success-icon">✅</span>
      <p>
        Pengeluaran
        <strong>{{ Math.abs(velocity.percentageVsHistorical).toFixed(0) }}% lebih hemat</strong>
        dari biasanya!
      </p>
    </div>

    <div v-else class="neutral-message">
      <span class="neutral-icon">📊</span>
      <p>Pengeluaran dalam batas normal</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpendingVelocity } from '@/composables/useAnalytics'

interface Props {
  velocity: SpendingVelocity
}

const props = defineProps<Props>()

const velocityText = computed(() => {
  switch (props.velocity.velocity) {
    case 'fast':
      return 'Cepat'
    case 'slow':
      return 'Lambat'
    default:
      return 'Normal'
  }
})

const velocityColor = computed(() => {
  switch (props.velocity.velocity) {
    case 'fast':
      return '#ef4444'
    case 'slow':
      return '#10b981'
    default:
      return '#3b82f6'
  }
})

const progressPercentage = computed(() => {
  const percentage = (props.velocity.daysPassed / props.velocity.daysInMonth) * 100
  return Math.min(percentage, 100)
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<style scoped>
.velocity-widget {
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.dark .velocity-widget {
  background: #1f2937;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dark .widget-title {
  color: #f3f4f6;
}

.fire-icon {
  font-size: 1.5rem;
}

.velocity-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.badge-fast {
  background-color: #ef4444;
}

.badge-slow {
  background-color: #10b981;
}

.badge-normal {
  background-color: #3b82f6;
}

.velocity-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.velocity-bar {
  flex: 1;
  height: 0.75rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.dark .velocity-bar {
  background-color: #374151;
}

.velocity-progress {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s ease, background-color 0.3s ease;
}

.velocity-percentage {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  min-width: 3rem;
  text-align: right;
}

.dark .velocity-percentage {
  color: #f3f4f6;
}

.velocity-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.dark .stat-item {
  background-color: #111827;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.dark .stat-label {
  color: #9ca3af;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dark .stat-value {
  color: #f3f4f6;
}

.stat-value.projected {
  color: #3b82f6;
}

.warning-message,
.success-message,
.neutral-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.warning-message {
  background-color: #fef3c7;
  color: #92400e;
}

.dark .warning-message {
  background-color: #78350f;
  color: #fef3c7;
}

.success-message {
  background-color: #d1fae5;
  color: #065f46;
}

.dark .success-message {
  background-color: #065f46;
  color: #d1fae5;
}

.neutral-message {
  background-color: #dbeafe;
  color: #1e40af;
}

.dark .neutral-message {
  background-color: #1e3a8a;
  color: #dbeafe;
}

.warning-icon,
.success-icon,
.neutral-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.warning-message p,
.success-message p,
.neutral-message p {
  margin: 0;
  line-height: 1.5;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .velocity-stats {
    grid-template-columns: 1fr;
  }
}
</style>
