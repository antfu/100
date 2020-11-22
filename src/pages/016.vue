<template lang='pug'>
paper
  .box.overflow-hidden
    canvas(ref='el' width='400' height='400')
</template>

<script setup='props' lang='ts'>
import { timestamp, useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { onMounted, ref } from 'vue'
import { distance, initCanvas, random, toHex } from '../utils'

export const shot = useRouteQuery('shot')
export const el = ref<HTMLCanvasElement | null>(null)

const { round, max } = Math

const timeout = 2000
const D = 100

onMounted(async() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)
  const { width, height } = canvas

  let points: [number, number, number][] = []

  function getFade(t = 0, ts = 0) {
    return 1 - (ts - t) / timeout
  }

  function updateCanvas() {
    const ts = timestamp()

    points.push([
      random(500, -100),
      random(500, -100),
      ts,
    ])

    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = 0.2
    points = points.filter(([x, y, t], idx) => {
      const fade = getFade(t, ts)
      if (fade < 0)
        return false

      if (idx !== 0) {
        for (let ni = 1; ni < idx; ni++) {
          const [x1, y1, t2] = points[ni - 1]
          if (distance([x1, y1], [x, y]) < D) {
            const fade2 = getFade(t2, ts)
            const color = max(0, round(fade * fade2 * 255))
            ctx.strokeStyle = `#000000${toHex(color)}`
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x, y)
            ctx.stroke()
          }
        }
      }

      return true
    })
  }

  useRafFn(updateCanvas)
})
</script>
