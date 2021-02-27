/* eslint-disable @typescript-eslint/no-var-requires */

import { defineConfig } from 'vite-plugin-windicss'

export default defineConfig({
  darkMode: 'class',
  theme: {
    extend: {
      opacity: {
        10: '0.1',
        85: '0.85',
      },
      fontFamily: {
        mono: ['Fira Code', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
    },
  },
})
