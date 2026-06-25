<template>
  <div class="forecast-chart">
    <div class="chart-header">
      <h3 class="chart-title">🔮 Cashflow Forecast</h3>
      <p class="chart-subtitle">Proyeksi {{ data.forecast.length }} bulan ke depan</p>
    </div>

    <!-- Alerts -->
    <div v-if="data.alerts.length > 0" class="alerts">
      <div v-for="(alert, index) in data.alerts" :key="index" class="alert-item">
        <span class="alert-icon">⚠️</span>
        <p>{{ alert.message }} di bulan {{ alert.month }}</p>
      </div>
    </div>

    <!-- Chart -->
    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Forecast Table -->
    <div class="forecast-table">
      <h4 class="table-title">Detail Proyeksi</h4>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Income</th>
              <th>Expense</th>
              <th>Balance</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data.forecast" :key="index">
              <td>{{ item.label }}</td>
              <td class="income">{{ formatCurrency(item.predictedIncome) }}</td>
              <td class="expense">{{ formatCurrency(item.predictedExpense) }}</td>
              <td :class="balanceClass(item.predictedBalance)">
                {{ formatCurrency(item.predictedBalance) }}
              </td>
              <td>
                <div class="confidence-bar">
                  <div
                    class="confidence-fill"
                    :style="{ width: item.confidence + '%' }"
                  ></div>
                  <span class="confidence-text">{{ item.confidence }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { CashflowForecast } from '@/composables/useAnalytics'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface Props {
  data: CashflowForecast
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: props.data.forecast.map((f) => f.label),
  datasets: [
    {
      label: 'Predicted Expense',
      data: props.data.forecast.map((f) => f.predictedExpense),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: '+1',
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
    {
      label: 'Range Min',
      data: props.data.forecast.map((f) => f.range.min),
      borderColor: 'transparent',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      fill: false,
      pointRadius: 0,
    },
    {
      label: 'Range Max',
      data: props.data.forecast.map((f) => f.range.max),
      borderColor: 'transparent',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      fill: '-1',
      pointRadius: 0,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const dataIndex = context.dataIndex
          const item = props.data.forecast[dataIndex]

          if (context.datasetIndex === 0) {
            return [
              `Expense: ${formatCurrency(item.predictedExpense)}`,
              `Range: ${formatCurrency(item.range.min)} - ${formatCurrency(item.range.max)}`,
              `Confidence: ${item.confidence}%`,
            ]
          }
          return ''
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => formatCurrencyShort(value),
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}))

function balanceClass(balance: number): string {
  return balance >= 0 ? 'balance-positive' : 'balance-negative'
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}jt`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`
  }
  return amount.toString()
}
</script>

<style scoped>
.forecast-chart {
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.dark .forecast-chart {
  background: #1f2937;
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.dark .chart-title {
  color: #f3f4f6;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.dark .chart-subtitle {
  color: #9ca3af;
}

.alerts {
  margin-bottom: 1.5rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background-color: #fef3c7;
  color: #92400e;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.dark .alert-item {
  background-color: #78350f;
  color: #fef3c7;
}

.alert-icon {
  font-size: 1.25rem;
}

.alert-item p {
  margin: 0;
}

.chart-container {
  height: 300px;
  margin-bottom: 1.5rem;
}

.forecast-table {
  margin-top: 1.5rem;
}

.table-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.dark .table-title {
  color: #f3f4f6;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f9fafb;
}

.dark thead {
  background-color: #111827;
}

th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.dark th {
  color: #9ca3af;
  border-bottom-color: #374151;
}

td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
}

.dark td {
  color: #f3f4f6;
  border-bottom-color: #374151;
}

.income {
  color: #10b981;
  font-weight: 600;
}

.expense {
  color: #ef4444;
  font-weight: 600;
}

.balance-positive {
  color: #10b981;
  font-weight: 700;
}

.balance-negative {
  color: #ef4444;
  font-weight: 700;
}

.confidence-bar {
  position: relative;
  width: 100%;
  height: 1.5rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.dark .confidence-bar {
  background-color: #374151;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #10b981);
  transition: width 0.5s ease;
}

.confidence-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #111827;
}

.dark .confidence-text {
  color: #f3f4f6;
}

@media (max-width: 640px) {
  .chart-container {
    height: 250px;
  }

  th,
  td {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
