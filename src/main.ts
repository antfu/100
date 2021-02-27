import './main.postcss'
import 'windi.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import routes from 'pages-generated'

import App from './App.vue'

const app = createApp(App)
const router = createRouter({
  history: createWebHistory(),
  routes,
})

app.use(router)
app.mount('#app')
