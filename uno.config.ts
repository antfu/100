import extractorPug from '@unocss/extractor-pug'
import {
  defineConfig,
  presetUno,
  presetWebFonts,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      fonts: {
        code: 'DM Mono',
        sans: 'DM Sans',
        serif: 'DM Serif Display',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  extractors: [
    extractorPug(),
  ],
})
