import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/views/TransactionsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/CategoriesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/budgets',
    name: 'Budgets',
    component: () => import('@/views/BudgetsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('@/views/TeamView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  // Wait for auth to finish initializing before making routing decisions
  const { authReady, isAuthenticated } = useAuth()
  await authReady

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    next('/')
  } else {
    next()
  }
})

export default router
