<template>
  <div class="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h3 class="font-display text-base font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
          <span>📈</span>
          <span>Timeline Savings Rate (%)</span>
        </h3>
        <p class="text-xs font-medium text-ink-500 dark:text-slate-400">
          Rata-rata: <strong class="text-ink-900 dark:text-white font-extrabold">{{ data.avgSavingsRate.toFixed(1) }}%</strong>
          • Target: <strong class="text-coral font-extrabold">{{ data.targetRate }}%</strong>
        </p>
      </div>

      <!-- Legend Pills -->
      <div class="flex items-center gap-3 text-xs font-bold text-ink-500 dark:text-slate-400">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-lime"></span>
          <span>Savings Rate</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-0.5 border-b-2 border-dashed border-coral"></span>
          <span>Target ({{ data.targetRate }}%)</span>
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="h-64 sm:h-72">
      <Line :data="chartData" :options="chartOptions" />
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
      borderColor: '#70a214',
      backgroundColor: 'rgba(200, 241, 109, 0.2)',
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Target',
      data: props.data.history.map(() => props.data.targetRate),
      borderColor: '#ff8068',
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
      backgroundColor: '#0c131d',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || ''
          const value = context.parsed.y.toFixed(1)
          const dataIndex = context.dataIndex
          const saved = props.data.history[dataIndex]?.saved || 0

          if (label === 'Savings Rate (%)') {
            return [
              `${label}: ${value}%`,
              `Tersimpan: ${formatCurrency(saved)}`,
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
        font: { size: 11 },
        color: '#94a3b8',
        callback: (value: any) => value + '%',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
    },
    x: {
      ticks: { font: { size: 11 }, color: '#94a3b8' },
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
