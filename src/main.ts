/// <reference types="vite-plugin-pages/client" />

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

import App from './App.vue'
import '@unocss/reset/tailwind.css'

import './main.postcss'

import 'uno.css'

const app = createApp(App)
const router = createRouter({
  history: createWebHistory(),
  routes,
})

app.use(router)
app.mount('#app')
