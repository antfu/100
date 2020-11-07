<template lang='pug'>
paper.overflow-hidden
  canvas(ref='el' width='400' height='400' @click='f.run()')
</template>

<script setup lang='ts'>
import { noop } from '@vueuse/shared'
import { onMounted, ref } from 'vue'

export const el = ref<HTMLCanvasElement | null>(null)

function shuffle<T>(arr: T[]): T[] {
  const array = arr.slice(0)
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export const f = {
  run: noop,
}

onMounted(() => {
  const canvas = el.value!
  const canvasSize = 400

  const ctx = canvas.getContext('2d')!

  const dpr = window.devicePixelRatio || 1
  // @ts-expect-error
  const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1

  const dpi = dpr / bsr

  canvas.style.width = `${canvasSize}px`
  canvas.style.height = `${canvasSize}px`
  canvas.width = dpi * canvasSize
  canvas.height = dpi * canvasSize
  ctx.scale(dpi, dpi)

  const drawHex = (x: number, y: number, size: number) => {
    const points: [number, number][] = new Array(6)
      .fill(0)
      .map((_, i) => [
        x + size * Math.cos(i % 6 * 2 * Math.PI / 6),
        y + size * Math.sin(i * 2 * Math.PI / 6),
      ])
    const midPoints: [number, number][] = points.map((_, i) => {
      const [x1, y1] = points[i]
      const [x2, y2] = points[(i + 1) % 6]
      return [(x1 + x2) / 2, (y1 + y2) / 2]
    })

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1

    ctx.beginPath()
    ctx.moveTo(...points[0])
    points.forEach(([x, y]) => ctx.lineTo(x, y))
    ctx.stroke()

    const shuffled = shuffle(midPoints)

    for (let i = 0; i < 3; i++) {
      const a = shuffled[i * 2]
      const b = shuffled[i * 2 + 1]
      ctx.beginPath()
      ctx.moveTo(...a)
      ctx.lineTo(...b)
      ctx.stroke()
    }
    // ctx.beginPath()
    // ctx.moveTo(...midPoints[0])
    // midPoints.forEach(([x, y]) => ctx.lineTo(x, y))

    ctx.stroke()

    // const color = Math.round(Math.random() * 16).toString(16)
    // ctx.fillStyle = `#${color}${color}${color}`
    // ctx.fill()
  }

  f.run = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const size = 30
    const SQRT_3 = Math.sqrt(3)
    const initX = 0
    const initY = 18 - size * SQRT_3

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 20; y++) {
        const xOffset = (y % 2) ? size * 1.5 : 0
        drawHex(
          initX + x * size * 3 + xOffset,
          initY + y * size * SQRT_3 * 0.5,
          size,
        )
      }
    }
  }

  f.run()
})
</script>

<style lang='stylus' scoped>

</style>
