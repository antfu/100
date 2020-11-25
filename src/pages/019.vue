<template lang='pug'>
paper
  .box.centered.overflow-hidden
    canvas(:class='{shake}' ref='el' width='400' height='400' @click='f.next()')
  .box-description.py-1(v-if='!shot')
    p.text-gray-400 click
</template>

<script setup lang='ts'>
import { useRouteQuery } from '@vueuse/router'
import { noop, useTimeoutFn } from '@vueuse/shared'
import { onMounted, ref } from 'vue'
import { initCanvas, r30, SQRT_3, Vector } from '../utils'

export const el = ref<HTMLCanvasElement | null>(null)

export const shot = useRouteQuery('shot')
export const f = {
  next: noop,
}

const cx = 200
const cy = 200

/**
 *
 * TL /\  TR
 * L |\/| R  CL CR
 * BL \/ BR CB
 */

const TL = 1
const TR = 1 << 1
const L = 1 << 2
const CL = 1 << 3
const CR = 1 << 4
const R = 1 << 5
const BL = 1 << 6
const CB = 1 << 7
const BR = 1 << 8

const C = CL | CR | CB
const T = TL | TR
// const RR = R | TR | BR
// const LL = L | TL | BL
const B = BR | BL

export const shake = ref(false)

onMounted(() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)

  const line = (a: Vector, b: Vector) => {
    ctx.beginPath()
    ctx.moveTo(...a)
    ctx.lineTo(...b)
    ctx.stroke()
  }

  const drawBox = (x: number, y: number, size: number, lines = 0b111111111) => {
    const c: Vector = [x, y]
    const points: Vector[] = new Array(6)
      .fill(0)
      .map((_, i) => [
        x + size * Math.cos(i % 6 * 2 * Math.PI / 6 + r30),
        y + size * Math.sin(i * 2 * Math.PI / 6 + r30),
      ])

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1

    if (lines & TL)
      line(points[3], points[4])
    if (lines & TR)
      line(points[4], points[5])
    if (lines & L)
      line(points[2], points[3])
    if (lines & CL)
      line(c, points[3])
    if (lines & CR)
      line(c, points[5])
    if (lines & R)
      line(points[5], points[0])
    if (lines & BL)
      line(points[1], points[2])
    if (lines & CB)
      line(c, points[1])
    if (lines & BR)
      line(points[0], points[1])
  }

  let t = shot.value ? 2 : 0
  let size = 150
  const SQRT_3_2 = SQRT_3 / 2
  let centers: Vector[] = [[cx, cy]]

  const reset = () => {
    t = 0
    size = 150
    centers = [[cx, cy]]
  }

  const controlA = useTimeoutFn(() => shake.value = false, 200, false)
  const controlB = useTimeoutFn(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const new_centers: Vector[] = []

    const i = t % 4

    if (i === 1)
      size = size / 2

    for (const [cx, cy] of centers) {
      if (i === 0) {
        drawBox(cx, cy, size)
      }
      else if (i === 1) {
        // down
        drawBox(cx, cy + size, size, C | B)
        // right top
        drawBox(cx + size * SQRT_3_2, cy - size / 2, size, C | TR | R | BL)
        // left top
        drawBox(cx - size * SQRT_3_2, cy - size / 2, size, C | TL | L | BR | R)
        drawBox(cx + size * SQRT_3_2, cy + size / 2, size, BR | R)
        drawBox(cx - size * SQRT_3_2, cy + size / 2, size, BL | L)
        drawBox(cx, cy - size, size, T)
      }
      else if (i === 2) {
        // down
        drawBox(cx, cy + size, size, C | B)
        // right top
        drawBox(cx + size * SQRT_3_2, cy - size / 2, size, C | TR | R | BL)
        drawBox(cx + size * SQRT_3_2, cy + size / 2, size, BR | R)
        drawBox(cx - size * SQRT_3_2, cy + size / 2, size, BL | CL | TL | L)
        drawBox(cx, cy - size, size, T | L | BL | CL)
      }
      else if (i === 3) {
        drawBox(cx, cy + size, size, C | B)
        drawBox(cx + size * SQRT_3_2, cy + size / 2, size, BR | CR | TR | R)
        drawBox(cx - size * SQRT_3_2, cy + size / 2, size, BL | CL | TL | L)
        drawBox(cx, cy - size, size)

        new_centers.push(
          [cx + size * SQRT_3_2, cy + size / 2],
          [cx - size * SQRT_3_2, cy + size / 2],
          [cx, cy - size],
        )
      }
    }

    if (new_centers.length)
      centers = new_centers

    t += 1
    if (t >= 30)
      reset()
  }, 100, false)

  f.next = () => {
    shake.value = true

    controlA.start()
    controlB.start()
  }

  f.next()
})
</script>

<style lang='stylus' scoped>
.shake {
  animation: 0.3s shake ease infinite;
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
</style>
