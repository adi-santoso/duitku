import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initDatabase } from './utils/db'
import './assets/styles/main.css'

async function init() {
  await initDatabase()

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}

init()
