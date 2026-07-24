<template>
  <div class="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-900/10 dark:border-white/10 shadow-soft space-y-5">
    <div>
      <h3 class="font-display text-base font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
        <span>🔮</span>
        <span>Proyeksi Arus Kas (Cashflow Forecast)</span>
      </h3>
      <p class="text-xs font-medium text-ink-500 dark:text-slate-400">Prediksi tren {{ data.forecast.length }} bulan ke depan berdasarkan algoritma historis</p>
    </div>

    <!-- Alerts -->
    <div v-if="data.alerts.length > 0" class="space-y-2">
      <div v-for="(alert, index) in data.alerts" :key="index" class="p-3.5 rounded-2xl bg-amber-400/15 border border-amber-400/20 flex items-center gap-3 text-xs text-amber-600 dark:text-amber-400 font-bold">
        <span class="text-base">⚠️</span>
        <p>{{ alert.message }} di bulan {{ alert.month }}</p>
      </div>
    </div>

    <!-- Chart -->
    <div class="h-64 sm:h-72">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Forecast Table -->
    <div class="space-y-3 pt-2 border-t border-ink-900/5 dark:border-white/5">
      <h4 class="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-slate-400">Detail Rincian Proyeksi</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-ink-900/10 dark:border-white/10 text-ink-400 dark:text-slate-400 font-extrabold uppercase text-[10px]">
              <th class="py-2.5 px-3">Bulan</th>
              <th class="py-2.5 px-3">Prediksi Income</th>
              <th class="py-2.5 px-3">Prediksi Expense</th>
              <th class="py-2.5 px-3">Saldo Netto</th>
              <th class="py-2.5 px-3">Tingkat Kepercayaan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-900/5 dark:divide-white/5">
            <tr v-for="(item, index) in data.forecast" :key="index" class="hover:bg-canvas/50 dark:hover:bg-ink-800/50 transition-colors">
              <td class="py-3 px-3 font-extrabold text-ink-900 dark:text-white">{{ item.label }}</td>
              <td class="py-3 px-3 font-display font-extrabold text-[#70a214] dark:text-lime">{{ formatCurrency(item.predictedIncome) }}</td>
              <td class="py-3 px-3 font-display font-extrabold text-coral">{{ formatCurrency(item.predictedExpense) }}</td>
              <td class="py-3 px-3 font-display font-extrabold" :class="item.predictedBalance >= 0 ? 'text-ink-900 dark:text-white' : 'text-coral'">
                {{ formatCurrency(item.predictedBalance) }}
              </td>
              <td class="py-3 px-3 min-w-[140px]">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-canvas dark:bg-ink-800 rounded-full h-2 overflow-hidden">
                    <div
                      class="h-2 rounded-full bg-lime dark:bg-lime-deep transition-all duration-500"
                      :style="{ width: item.confidence + '%' }"
                    />
                  </div>
                  <span class="text-[10px] font-extrabold text-ink-500 dark:text-slate-400 w-8 text-right">{{ item.confidence }}%</span>
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
      borderColor: '#ff8068',
      backgroundColor: 'rgba(255, 128, 104, 0.15)',
      fill: '+1',
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
    {
      label: 'Range Min',
      data: props.data.forecast.map((f) => f.range.min),
      borderColor: 'transparent',
      backgroundColor: 'rgba(255, 128, 104, 0.05)',
      fill: false,
      pointRadius: 0,
    },
    {
      label: 'Range Max',
      data: props.data.forecast.map((f) => f.range.max),
      borderColor: 'transparent',
      backgroundColor: 'rgba(255, 128, 104, 0.05)',
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
      backgroundColor: '#0c131d',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => {
          const dataIndex = context.dataIndex
          const item = props.data.forecast[dataIndex]

          if (context.datasetIndex === 0) {
            return [
              `Pengeluaran: ${formatCurrency(item.predictedExpense)}`,
              `Rentang: ${formatCurrency(item.range.min)} - ${formatCurrency(item.range.max)}`,
              `Tingkat Kepercayaan: ${item.confidence}%`,
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
        font: { size: 11 },
        color: '#94a3b8',
        callback: (value: any) => formatCurrencyShort(value),
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

function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}jt`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`
  }
  return amount.toString()
}
</script>
