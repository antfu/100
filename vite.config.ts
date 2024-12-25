import type { UserConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import Pages from 'vite-plugin-pages'
import PSVG from 'vite-plugin-psvg'

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
