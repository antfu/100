<template lang='pug'>
paper
  .box.centered.overflow-hidden
    canvas(ref='el' width='400' height='400' @click='f.next()')
  .box-description.py-2.flex(v-if='!shot')
    .flex(@click='edges = (edges -1) % 14 + 2')
      .text-gray-400 edges
      .text-gray-500.bold.px-2 {{edges}}
    .flex-auto
    .link(@click='f.reset()') reset

note
</template>

<script setup lang='ts'>
import { useRouteQuery } from '@vueuse/router'
import { noop, timestamp } from '@vueuse/shared'
import { onMounted, ref, watch } from 'vue'
import { useMouseInElement, useRafFn } from '@vueuse/core'
import { distance, hslToRgb, initCanvas, r180, r360, r90, random, range } from '../utils'
import type { Vector, ColorVector } from '../utils'

const el = ref<HTMLCanvasElement | null>(null)

const shot = useRouteQuery('shot')
const debug = useRouteQuery('debug')

const f = {
  next: noop,
  reset: noop,
}

const edges = ref(8)
const width = 1
let hue = random()

const { elementX: ex, elementY: ey } = useMouseInElement(el)

const { tan, PI, round, atan2, cos, sin } = Math

let points: Vector[] = []
let lines: [Vector, Vector, string][] = []

let pts = timestamp()

function getColor() {
  return `rgb(${hslToRgb(hue, 0.7, 0.5).join(',')})`
}

function getLines() {
  const c: Vector = [ex.value, ey.value]
  const p = points[0]
  const rad = atan2(c[1] - p[1], c[0] - p[0])
  const len = distance(c, p)
  const d = r360 / edges.value

  return points.map((p, i): [Vector, Vector] => {
    const np: Vector = [
      p[0] + cos(rad + d * i) * len,
      p[1] + sin(rad + d * i) * len,
    ]
    return [np, p]
  })
}

onMounted(() => {
  const canvas = el.value!
  const { ctx, dpi } = initCanvas(canvas)

  function line(a: Vector, b: Vector) {
    ctx.beginPath()
    ctx.moveTo(...a)
    ctx.lineTo(...b)
    ctx.stroke()
  }

  f.reset = () => {
    points = range(edges.value).map(i => [200, 200])
    lines = []
  }

  f.next = () => {
    const l = getLines()
    const c = getColor()
    lines.push(...l.map(([a, b]) => [a, b, c] as [Vector, Vector, string]))
    points = l.map(i => i[0])
    hue = (hue + 0.05) % 1
  }

  f.reset()
  watch(edges, () => f.reset())

  useRafFn(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const ts = timestamp()
    const dt = ts - pts
    pts = ts

    lines.forEach(([a, b, c]) => {
      ctx.strokeStyle = c
      line(a, b)
    })

    ctx.strokeStyle = getColor()
    getLines().map(p => line(...p))
  })
})
</script>
