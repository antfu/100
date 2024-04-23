<script setup lang='ts'>
// https://ncase.me/sight-and-light/
import { useRouteQuery } from '@vueuse/router'
import { noop, timestamp } from '@vueuse/shared'
import { onMounted, ref } from 'vue'
import { useMouseInElement, useRafFn } from '@vueuse/core'
import { distance, initCanvas, r180, r360, r90, random, range } from '../utils'
import type { ColorVector, Vector } from '../utils'

const el = ref<HTMLCanvasElement | null>(null)

const shot = useRouteQuery('shot')
const debug = useRouteQuery('debug')
const f = {
  next: noop,
  reset: noop,
}

const w = 400
const h = 400

const pattern = 0
const lineWidth = 1

function mergeColor([a, b, c]: ColorVector, [a2, b2, c2]: ColorVector): ColorVector {
  return [
    (a + a2) / 2,
    (b + b2) / 2,
    (c + c2) / 2,
  ]
}

const { elementX: ex, elementY: ey } = useMouseInElement(el)

function seg_insertion(from1: Vector, to1: Vector, from2: Vector, to2: Vector): Vector | undefined {
  const dX: number = to1[0] - from1[0]
  const dY: number = to1[1] - from1[1]

  const determinant: number = dX * (to2[1] - from2[1]) - (to2[0] - from2[0]) * dY
  if (determinant === 0)
    return undefined // parallel lines

  const lambda: number = ((to2[1] - from2[1]) * (to2[0] - from1[0]) + (from2[0] - to2[0]) * (to2[1] - from1[1])) / determinant
  const gamma: number = ((from1[1] - to1[1]) * (to2[0] - from1[0]) + dX * (to2[1] - from1[1])) / determinant

  // check if there is an intersection
  if (!(lambda >= 0 && lambda <= 1) || !(gamma >= 0 && gamma <= 1))
    return undefined

  return [
    from1[0] + lambda * dX,
    from1[1] + lambda * dY,
  ]
}

const { tan, PI, round } = Math

let lines: Vector[][] = []
let points: Vector[] = []

function get_insertion(c: Vector, to: Vector) {
  let far = to
  let d = distance(c, to)
  lines.forEach((l) => {
    const insert = seg_insertion(c, to, l[0], l[1])
    if (!insert)
      return
    const id = distance(c, insert)
    if (id < d) {
      far = insert
      d = id
    }
  })

  return far
}

let pts = timestamp()

onMounted(() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)

  function line(a: Vector, b: Vector) {
    ctx.beginPath()
    ctx.moveTo(...a)
    ctx.lineTo(...b)
    ctx.stroke()
  }

  function shape(points: Vector[]) {
    ctx.beginPath()
    ctx.moveTo(...points[points.length - 1])
    points.forEach(p => ctx.lineTo(...p))
    ctx.stroke()
  }

  f.reset = () => {
    lines = [
      [[-1, -1], [-1, 401], [401, 401], [401, -1]],
      ...range(20).map((i): Vector[] => [[random(400), random(400)], [random(400), random(400)]]),
    ]
    points = lines.flatMap(i => i)
  }

  f.reset()

  useRafFn(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const ts = timestamp()
    const dt = ts - pts
    pts = ts

    ctx.strokeStyle = 'black'
    lines.map(shape)

    const c: Vector = [ex.value, ey.value]

    ctx.strokeStyle = '#4dd1c8'
    const inserts = points.map((p) => {
      const insert = get_insertion(c, p)
      line(c, insert)
      return insert
    })
  })
})
</script>

<template lang='pug'>
paper
  .box.centered.overflow-hidden
    canvas(ref='el' width='400' height='400' @click='f.reset()')
</template>
