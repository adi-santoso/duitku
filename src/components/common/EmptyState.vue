<template>
  <div class="text-center py-16 px-4">
    <!-- Icon/Illustration -->
    <div class="mb-6 relative">
      <div class="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br flex items-center justify-center relative overflow-hidden" :class="iconBgClass">
        <!-- Background decoration -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white"></div>
          <div class="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-white"></div>
        </div>

        <!-- Icon -->
        <svg v-if="icon === 'transaction'" class="w-12 h-12 relative z-10" :class="iconColorClass" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>

        <svg v-else-if="icon === 'search'" class="w-12 h-12 relative z-10" :class="iconColorClass" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>

        <svg v-else-if="icon === 'chart'" class="w-12 h-12 relative z-10" :class="iconColorClass" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>

        <svg v-else-if="icon === 'filter'" class="w-12 h-12 relative z-10" :class="iconColorClass" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>

        <svg v-else-if="icon === 'budget'" class="w-12 h-12 relative z-10" :class="iconColorClass" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>

        <svg v-else class="w-12 h-12 relative z-10" :class="iconColorClass" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
    </div>

    <!-- Title -->
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
      {{ description }}
    </p>

    <!-- Action Button -->
    <button
      v-if="actionLabel"
      @click="$emit('action')"
      class="btn btn-primary inline-flex items-center gap-2"
    >
      <svg v-if="actionIcon === 'plus'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <svg v-else-if="actionIcon === 'refresh'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
      <svg v-else-if="actionIcon === 'filter'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
      {{ actionLabel }}
    </button>

    <!-- Secondary action -->
    <button
      v-if="secondaryLabel"
      @click="$emit('secondary-action')"
      class="btn btn-ghost ml-2"
    >
      {{ secondaryLabel }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'transaction',
    validator: (value) => ['transaction', 'search', 'chart', 'filter', 'budget', 'default'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  actionLabel: {
    type: String,
    default: ''
  },
  actionIcon: {
    type: String,
    default: 'plus',
    validator: (value) => ['plus', 'refresh', 'filter'].includes(value)
  },
  secondaryLabel: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'info'].includes(value)
  }
})

defineEmits(['action', 'secondary-action'])

const iconBgClass = computed(() => {
  const variants = {
    primary: 'from-primary-400 to-primary-600',
    secondary: 'from-slate-400 to-slate-600',
    info: 'from-blue-400 to-blue-600'
  }
  return variants[props.variant]
})

const iconColorClass = computed(() => {
  return 'text-white'
})
</script>
