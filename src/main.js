import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Register service worker for PWA support (production only)
// In development, SW can intercept and break Supabase API calls
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[App] SW registered:', registration.scope)
      })
      .catch((error) => {
        console.log('[App] SW registration failed:', error)
      })
  })
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // Unregister any leftover SW from development
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister()
      console.log('[App] DEV: Unregistered leftover SW')
    })
  })
}
