import {
  defineConfig,
  presetUno,
  presetWebFonts,
  transformerDirectives
} from 'unocss'
import extractorPug from '@unocss/extractor-pug'

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      fonts: {
        code: 'DM Mono',
        sans: 'DM Sans',
        serif: 'DM Serif Display',
      }
    })
  ],
  transformers: [
    transformerDirectives()
  ],
  extractors: [
    extractorPug()
  ]
})
