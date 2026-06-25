<template>
  <div class="budget-alert-card" :class="`tier-${alert.tier.toLowerCase()}`">
    <div class="budget-ring-container">
      <svg class="progress-ring" viewBox="0 0 120 120">
        <!-- Background circle -->
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#e5e7eb"
          stroke-width="8"
        />
        <!-- Progress circle -->
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          :stroke="alert.tierColor"
          stroke-width="8"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          transform="rotate(-90 60 60)"
          class="progress-circle"
        />
      </svg>

      <div class="ring-center">
        <span class="category-icon">{{ alert.categoryIcon }}</span>
        <span class="percentage">{{ alert.percentage }}%</span>
      </div>
    </div>

    <div class="budget-content">
      <h3 class="category-name">{{ alert.categoryName }}</h3>

      <div class="amounts">
        <p class="spent">{{ formatCurrency(alert.spent) }}</p>
        <p class="budget-total">dari {{ formatCurrency(alert.budgetAmount) }}</p>
      </div>

      <div class="tier-badge" :style="{ backgroundColor: alert.tierColor }">
        <span class="tier-icon">{{ alert.tierIcon }}</span>
        <span class="tier-message">{{ alert.tierMessage }}</span>
      </div>

      <div v-if="alert.remaining > 0" class="daily-allowance">
        <p class="allowance-label">Sisa per hari ({{ alert.daysLeft }} hari)</p>
        <p class="allowance-amount">{{ formatCurrency(alert.dailyAllowance) }}</p>
      </div>

      <div v-else class="over-budget">
        <p class="over-amount">Lebih {{ formatCurrency(Math.abs(alert.remaining)) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BudgetAlert } from '@/composables/useAnalytics'

interface Props {
  alert: BudgetAlert
}

const props = defineProps<Props>()

const circumference = computed(() => 2 * Math.PI * 54)
const progressOffset = computed(() => {
  const progress = Math.min(props.alert.ratio, 1.25) // Cap at 125%
  return circumference.value - (progress * circumference.value)
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
.budget-alert-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  transition: all 0.2s;
}

.dark .budget-alert-card {
  background: #1f2937;
}

.budget-alert-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.budget-ring-container {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 120px;
}

.progress-ring {
  width: 100%;
  height: 100%;
}

.progress-circle {
  transition: stroke-dashoffset 0.5s ease;
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.category-icon {
  font-size: 2rem;
}

.percentage {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.dark .percentage {
  color: #f3f4f6;
}

.budget-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dark .category-name {
  color: #f3f4f6;
}

.amounts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spent {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dark .spent {
  color: #f3f4f6;
}

.budget-total {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.dark .budget-total {
  color: #9ca3af;
}

.tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  width: fit-content;
}

.tier-icon {
  font-size: 1rem;
}

.daily-allowance {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.dark .daily-allowance {
  border-top-color: #374151;
}

.allowance-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.dark .allowance-label {
  color: #9ca3af;
}

.allowance-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
  margin: 0;
}

.over-budget {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.dark .over-budget {
  border-top-color: #374151;
}

.over-amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #ef4444;
  margin: 0;
}

/* Tier-specific styles */
.tier-safe {
  border-left: 4px solid #10b981;
}

.tier-caution {
  border-left: 4px solid #f59e0b;
}

.tier-warning {
  border-left: 4px solid #f97316;
}

.tier-exceeded {
  border-left: 4px solid #ef4444;
}

.tier-critical {
  border-left: 4px solid #dc2626;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .budget-alert-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .budget-ring-container {
    width: 100px;
    height: 100px;
  }

  .budget-content {
    align-items: center;
  }

  .daily-allowance,
  .over-budget {
    width: 100%;
  }
}
</style>
