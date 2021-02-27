import { UserConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import ViteComponents from 'vite-plugin-components'
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons'
import PSVG from 'vite-plugin-psvg'
import Vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

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
    ViteComponents({
      customComponentResolvers: [
        ViteIconsResolver({
          componentPrefix: '',
        }),
      ],
    }),
    ViteIcons(),
    PSVG(),
    WindiCSS(),
  ],
}

export default config
