<template lang='pug'>
paper
  .box.centered.overflow-hidden
    canvas(ref='el' width='400' height='400' @click='f.reset()')
</template>

<script setup lang='ts'>
import { useRouteQuery } from '@vueuse/router'
import { noop } from '@vueuse/shared'
import { onMounted, ref } from 'vue'
import { distance, initCanvas, random, range, Vector } from '../utils'

export const el = ref<HTMLCanvasElement | null>(null)

export const shot = useRouteQuery('shot')
export const debug = useRouteQuery('debug')
export const f = {
  next: noop,
  reset: noop,
}

const w = 400
const h = 400

const MAX_LINES = 3000

let pattern = 0

type Line = [number, number, number]
type LineSegment = {line: Line; left: Vector; right: Vector}

const { tan, PI } = Math

window.addEventListener('keydown', (e) => {
  if (e.key === 'r') {
    pattern = (pattern + 1) % 4
    f.reset()
  }
})

function isTruthy<T>(x: T | undefined): x is T {
  return Boolean(x)
}

onMounted(() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)

  // ax + by + c = 0
  let lines: LineSegment[] = []

  const line = (a: Vector, b: Vector) => {
    ctx.beginPath()
    ctx.moveTo(...a)
    ctx.lineTo(...b)
    ctx.stroke()
  }
  const dot = ([x, y]: Vector, color = 'red') => {
    if (!debug.value)
      return
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x, y, 2, 0, PI * 2)
    ctx.fill()
  }

  const solve = ([a, b, c]: Line, x: number): Vector => {
    // ax + by + c = 0
    // by = -c -ax
    // b = 1
    const y = -(c + a * x) / b

    return [x, y]
  }

  const cross = ([a1, b1, c1]: Line, { line: [a2, b2, c2], left, right }: LineSegment): Vector | undefined => {
    // a1x + b1y + c1 = 0
    // a2x + b2y + c2 = 0
    // (a1 - a2)x + c1 - c2 = 0
    // b = 1
    const x = -(c1 - c2) / (a1 - a2)
    if (x < left[0] || x > right[0])
      return
    const [, y] = solve([a1, b1, c1], x)
    return [x, y]
  }

  // function randn_bm() {
  //   let u = 0; let v = 0
  //   while (u === 0) u = Math.random() // Converting [0,1) to (0,1)
  //   while (v === 0) v = Math.random()
  //   return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  // }

  f.reset = () => {
    lines = []
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const randomPoint = (s = 0): Vector => {
    // around
    if (s === 1) {
      let cx = random() > 0.5 ? w - 1 : 1
      let cy = random() * h
      if (random() > 0.5)
        [cx, cy] = [cy, cx]
      return [cx, cy]
    }
    // center
    else if (s === 2) {
      return [200 + random(1, -1) * 50, 200 + random(1, -1) * 50]
    }
    // cross center
    else if (s === 3) {
      if (random() > 0.5)
        return [200, random() * h]
      else
        return [random() * w, 200]
    }
    // even
    else {
      return [random() * w, random() * h]
    }
  }

  const randomRad = (s = 0): number => {
    return random(1, -1) * PI
  }

  f.next = () => {
    const cp = randomPoint(pattern) // change this to have different gen points
    const [cx, cy] = cp

    const rad = randomRad(pattern)
    // a / b = tan(rad)
    // a * cx + b * cy + c = 0
    // b = 1
    // a = tan(rad) / cx
    // c = - (cy + a * cx)

    const a = tan(rad)
    const b = 1
    const c = -(cy + a * cx)

    dot(cp)

    const l: Line = [a, b, c]

    const points = lines.map(l2 => cross(l, l2)).filter(isTruthy)

    const { p: left } = [...points.filter(([x, y]) => x <= cx), solve(l, 0)]
      .map(p => ({ p, d: distance(cp, p) }))
      .sort((a, b) => a.d - b.d)[0]
    const { p: right } = [...points.filter(([x, y]) => x >= cx), solve(l, w)]
      .map(p => ({ p, d: distance(cp, p) }))
      .sort((a, b) => a.d - b.d)[0]

    dot(left, 'green')
    dot(right, 'orange')

    line(left, right)

    lines.push({ line: l, left, right })
  }

  setInterval(() => {
    if (lines.length >= MAX_LINES)
      f.reset()
    f.next()
    f.next()
  }, 50)

  if (shot.value)
    range(500).forEach(f.next)
})
</script>
