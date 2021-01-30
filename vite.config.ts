import { UserConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import PurgeIcons from 'vite-plugin-purge-icons'
import ViteComponents from 'vite-plugin-components'
import PSVG from 'vite-plugin-psvg'
import Vue from '@vitejs/plugin-vue'

const config: UserConfig = {
  optimizeDeps: {
    include: [
      '@vueuse/core',
      '@vueuse/shared',
      '@vueuse/router',
      'three',
      '@iconify/iconify',
      'lodash-es',
      'p5i',
      'matter-js',
      'matter-attractors',
    ],
  },
  plugins: [
    Vue(),
    Pages(),
    ViteComponents(),
    PurgeIcons(),
    PSVG(),
  ],
}

export default config
