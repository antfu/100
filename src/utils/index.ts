import { useRafFn } from '@vueuse/core'
import { ref } from 'vue'

export * from './canvas'
export * from './colors'
export * from './load'
export * from './shake'
export * from './stringify'
export * from './vector'

export function noop() {}

export function shuffle<T>(arr: T[]): T[] {
  const array = arr.slice(0)
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function range(to: number) {
  return Array.from({ length: to }).fill(0).map((_, i) => i)
}

export function useWindowPosition() {
  const screenTop = ref(window.screenTop)
  const screenLeft = ref(window.screenLeft)

  const timeout = useRafFn(() => {
    screenTop.value = window.screenTop
    screenLeft.value = window.screenLeft
  })

  return { screenLeft, screenTop, timeout }
}

export function random(max = 1, min = 0) {
  return Math.random() * (max - min) + min
}
