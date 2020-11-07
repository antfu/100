<template lang='pug'>
paper.overflow-hidden
  canvas(ref='canvas' width='400' height='400')
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
export const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const canvasSize = 400

  const ctx = canvas.value!.getContext('2d')!

  const dpr = window.devicePixelRatio || 1
  // @ts-expect-error
  const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1

  const dpi = dpr / bsr

  canvas.value!.style.width = `${canvasSize}px`
  canvas.value!.style.height = `${canvasSize}px`
  canvas.value!.width = dpi * canvasSize
  canvas.value!.height = dpi * canvasSize
  ctx.scale(dpi, dpi)

  const drawHex = (x: number, y: number, size: number) => {
    ctx.beginPath()
    ctx.moveTo(x + size * Math.cos(0), y + size * Math.sin(0))

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1

    for (let side = 0; side < 7; side++) {
      ctx.lineTo(
        x + size * Math.cos(side * 2 * Math.PI / 6),
        y + size * Math.sin(side * 2 * Math.PI / 6),
      )
    }

    ctx.stroke()
    // const color = Math.round(Math.random() * 16).toString(16)
    // ctx.fillStyle = `#${color}${color}${color}`
    // ctx.fill()
  }

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
})
</script>

<style lang='stylus' scoped>

</style>
