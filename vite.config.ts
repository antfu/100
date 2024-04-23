import type { UserConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import PSVG from 'vite-plugin-psvg'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

const config: UserConfig = {
  optimizeDeps: {
    include: [
      '@vueuse/core',
      '@vueuse/shared',
      '@vueuse/router',
      'three',
      'lodash-es',
      'p5i',
      'matter-js',
      'matter-attractors',
    ],
  },
  plugins: [
    Vue(),
    Pages(),
    Components({
      resolvers: [
        IconsResolver({
          prefix: '',
        }),
      ],
    }),
    Icons(),
    PSVG(),
    UnoCSS(),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
      ],
    }),
  ],
}

export default config
