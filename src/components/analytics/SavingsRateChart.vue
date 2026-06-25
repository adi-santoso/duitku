<template>
  <div class="savings-rate-chart">
    <div class="chart-header">
      <h3 class="chart-title">📈 Savings Rate Timeline</h3>
      <p class="chart-subtitle">
        Rata-rata: <strong>{{ data.avgSavingsRate.toFixed(1) }}%</strong>
        • Target: <strong>{{ data.targetRate }}%</strong>
      </p>
    </div>

    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div class="legend">
      <div class="legend-item">
        <span class="legend-color" style="background-color: #10b981"></span>
        <span>Savings Rate</span>
      </div>
      <div class="legend-item">
        <span class="legend-color dashed" style="background-color: #ef4444"></span>
        <span>Target ({{ data.targetRate }}%)</span>
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
import type { SavingsRateHistory } from '@/composables/useAnalytics'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface Props {
  data: SavingsRateHistory
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: props.data.history.map((h) => h.label),
  datasets: [
    {
      label: 'Savings Rate (%)',
      data: props.data.history.map((h) => h.savingsRate),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Target',
      data: props.data.history.map(() => props.data.targetRate),
      borderColor: '#ef4444',
      borderDash: [5, 5],
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
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
          const label = context.dataset.label || ''
          const value = context.parsed.y.toFixed(1)
          const dataIndex = context.dataIndex
          const saved = props.data.history[dataIndex]?.saved || 0

          if (label === 'Savings Rate (%)') {
            return [
              `${label}: ${value}%`,
              `Saved: ${formatCurrency(saved)}`,
            ]
          }
          return `${label}: ${value}%`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => value + '%',
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
.savings-rate-chart {
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.dark .savings-rate-chart {
  background: #1f2937;
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
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

.chart-container {
  height: 300px;
  margin-bottom: 1rem;
}

.legend {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .legend-item {
  color: #9ca3af;
}

.legend-color {
  width: 1.5rem;
  height: 0.25rem;
  border-radius: 9999px;
}

.legend-color.dashed {
  background: repeating-linear-gradient(
    to right,
    currentColor 0,
    currentColor 5px,
    transparent 5px,
    transparent 10px
  );
}

@media (max-width: 640px) {
  .chart-container {
    height: 250px;
  }
}
</style>
