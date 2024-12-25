<script setup lang='ts'>
import type { ColorVector, Vector } from '../utils'
import { useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { noop, timestamp } from '@vueuse/shared'
import { onMounted, ref } from 'vue'
import { initCanvas, r180, r360, random, range } from '../utils'

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

class Line {
  tail: Vector
  isActive: boolean
  length: number
  ignored: Line[]

  constructor(public head: Vector, public rad: number, public color: ColorVector, public speed = 5) {
    this.tail = head
    this.length = 0
    this.isActive = true
    this.ignored = []
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = `rgb(${this.color.join(',')})`
    ctx.moveTo(...this.head)
    ctx.lineTo(...this.tail)
    ctx.stroke()
  }

  grow(t: number, lines: Line[]) {
    if (!this.isActive)
      return
    this.length += t * this.speed
    const x = this.head[0] + Math.cos(this.rad) * this.length
    const y = this.head[1] + Math.sin(this.rad) * this.length
    this.tail = [x, y]

    if (x < 0 || x > 400) {
      this.isActive = false
      const n = new Line(this.tail, r180 - this.rad, this.color, this.speed)
      n.ignored.push(this)
      lines.push(n)
    }
    else if (y < 0 || y > 400) {
      this.isActive = false
      const n = new Line(this.tail, -this.rad, this.color, this.speed)
      n.ignored.push(this)
      lines.push(n)
    }
    else { this.check_insertions(lines) }
  }

  has_insertion(line: Line): Vector | undefined {
    const from1 = this.head; const to1 = this.tail; const from2 = line.head; const to2 = line.tail

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

  check_insertions(lines: Line[]) {
    for (const line of lines) {
      if (line === this || this.ignored.includes(line))
        continue
      const insert = this.has_insertion(line)
      if (insert) {
        this.tail = insert
        this.isActive = false

        const reflex = new Line(
          insert,
          -(-r180 + (line.rad - this.rad) + line.rad),
          mergeColor(this.color, line.color),
          (this.speed + line.speed) / 2,
        )
        reflex.ignored.push(this)
        reflex.ignored.push(line)

        line.ignored.push(this)
        line.ignored.push(reflex)

        lines.push(reflex)
        return
      }
    }
  }
}

const { tan, PI, round } = Math

window.addEventListener('keydown', (e) => {
  if (e.key === 'r')
    f.reset()
})

function isTruthy<T>(x: T | undefined): x is T {
  return Boolean(x)
}

function randomLine() {
  return new Line(
    [random(400), random(400)],
    random() * r360,
    [round(random(256)), round(random(256)), round(random(256))],
    random(10, 3),
  )
}

let pts = timestamp()

onMounted(() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)

  let lines: Line[] = []

  f.reset = () => {
    lines = range(60).map(randomLine)
  }

  f.reset()

  useRafFn(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const ts = timestamp()
    const dt = ts - pts
    pts = ts

    lines.forEach((l) => {
      l.grow(dt / 100, lines)
      l.draw(ctx)
    })
  })
})
</script>

<template lang='pug'>
paper
  .box.centered.overflow-hidden
    canvas(ref='el' width='400' height='400' @click='f.reset()')
</template>
