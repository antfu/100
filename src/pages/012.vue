<template lang='pug'>
paper
  .box.overflow-hidden(@click='roll')
    canvas(ref='el' width='400' height='400' :style='filterStyle')
  .box-description.py-4(v-if='!shot')
    tempate(v-for='c,idx in coeff')
      .inline-block.w-12.mx-2.text-right(:class='[c < 0 ? "text-gray-300" : "text-gray-500"]') {{ c.toFixed(2) }}
      br(v-if='idx % 6 === 5')
</template>

<script setup='props' lang='ts'>
import { timestamp, useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { computed, onMounted, ref } from 'vue'
import { initCanvas } from '../utils'

type Color = {r?: number; g?: number; b?: number}

export const shot = useRouteQuery('shot')
export const el = ref<HTMLCanvasElement | null>(null)
export const runner = ref<HTMLIFrameElement | null>(null)
export const input = ref<HTMLInputElement | null>(null)

const { cos, sin, abs, random, max, round } = Math

export const coeff = ref([
  1, 4.3, 4, 2, 6, 4,
  2, 3, 2, 2, 6, -2,
  8, 2, 1, 2, -5.3, 3,
])

export const roll = () => {
  coeff.value = new Array(coeff.value.length).fill(0).map((_, i) => {
    if (i % 2)
      return (random() - 0.5) * 12
    else
      return (random() - 0.5) * 20
  })
}

export const hue = ref(0)

export const filterStyle = computed(() => ({
  filter: `hue-rotate(${hue.value}rad) invert(1)`,
}))

if (shot.value)
  roll()

onMounted(async() => {
  const canvas = el.value!
  const { ctx, dpi } = initCanvas(canvas)
  const { width, height } = canvas

  const data = ctx.createImageData(width, height)

  const drawPixel = (data: ImageData, x: number, y: number, { r, g, b }: Color, alpha = 1) => {
    if (x < 0 || x >= width || y < 0 || y >= width)
      return
    const pixelindex = (y * width + x) * 4
    if (r != null)
      data.data[pixelindex] = data.data[pixelindex] * (1 - alpha) + r * alpha
    if (g != null)
      data.data[pixelindex + 1] = data.data[pixelindex + 1] * (1 - alpha) + g * alpha
    if (b != null)
      data.data[pixelindex + 2] = data.data[pixelindex + 2] * (1 - alpha) + b * alpha
  }

  const clear = () => {
    const length = data.data.length * 4
    for (let i = 0; i < length; i += 1)
      data.data[i] = i % 4 === 3 ? 255 : 0
  }

  // anti-aliasing
  const aa = 0.25

  // https://www.maa.org/external_archive/joma/Volume8/Kalman/General.html
  const ellipse = (cx: number, cy: number, a: number, b: number, rad: number, color: Color) => {
    const cosRad = cos(rad)
    const sinRad = sin(rad)
    const a2 = a ** 2 || 1
    const b2 = b ** 2 || 1

    const box = round(max(abs(a), abs(b)) * 2)

    for (let x = -box; x < box; x++) {
      for (let y = -box; y < box; y++) {
        const distance = (x * cosRad + y * sinRad) ** 2 / a2 + (x * sinRad - y * cosRad) ** 2 / b2 - 1
        if (distance < aa)
          drawPixel(data, x + cx, y + cy, color, 1 - max(0, distance) / aa)
      }
    }
  }

  const ts = timestamp()
  const distance = dpi * 40
  const amount = width / distance
  const offset = 18 * dpi

  const frame = () => {
    const t = timestamp() - ts
    clear()

    const C = coeff.value
    const rad = t / 2000

    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        ellipse(offset + x * distance, offset + y * distance, (C[0] + x) * C[1], (C[2] + y) * C[3], (C[4] + rad) * C[5], { r: 255 })
        ellipse(offset + x * distance - 4, offset + y * distance, (C[6] + x) * C[7], (C[8] + y) * C[9], (C[10] + rad) * C[11], { g: 255 })
        ellipse(offset + x * distance, offset + y * distance - 4, (C[12] + x) * C[13], (C[14] + y) * C[15], (C[16] + rad) * C[17], { b: 255 })
      }
    }

    hue.value = sin(t / 1000) * Math.PI

    ctx.putImageData(data, 0, 0)
  }

  useRafFn(frame)
})
</script>
