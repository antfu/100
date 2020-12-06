<template lang='pug'>
paper
  .box.overflow-hidden(ref='el' @click='restart')

note
  p <b>Perlin Noise</b>
  br
  p Day 5 of <a href='https://codecember.ink/2020/5' class="link" target='_blank'>#Codecember</a>
</template>

<script setup lang="ts">
import { p5i } from 'p5i'
import type { P5I } from 'p5i'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { transform } from 'lodash-es'

const el = ref<HTMLCanvasElement | null>(null)

const { random, trunc, min } = Math
const {
  mount, unmount,
  createCanvas, resizeCanvas, background, noFill,
  stroke, noise, noiseSeed, noLoop, cos, sin, line,
  beginShape, endShape, vertex,
  push, pop, translate,
  TWO_PI,
} = p5i()

const w = 400
const h = 400

const SCALE = 70
const SCALE_Z = w * 1.5
const LENGTH = 4
const SPACING = 10
const AMOUNT = 2000

function getForceOnPoint(x: number, y: number, z: number) {
  // https://p5js.org/reference/#/p5/noise
  return (noise(x / SCALE, y / SCALE, z / SCALE_Z) - 0.5) * 2 * TWO_PI
}

let points: {x: number; y: number; t: number }[] = []

function setup() {
  createCanvas(400, 400)
  background('#fff')
  stroke('#888')
  noFill()

  noiseSeed(+new Date())

  points = []
  for (let i = 0; i < AMOUNT; i++)
    points.push({ x: random() * w, y: random() * h, t: 0 })
}

function draw({ frameCount, mouseX, mouseY }: P5I) {
  background(255, 255, 255, 50)

  points = points
    .filter(({ x, y }) => x > 0 && x < w && y > 0 && y < h)

  const len = points.length
  const n = AMOUNT - points.length

  if (n > 0) {
    for (let i = 0; i < n; i++) {
      const { x, y } = points[trunc(random() * len)]
      points.push({
        x: x + (random() - 0.5) * LENGTH * 50,
        y: y + (random() - 0.5) * LENGTH * 50,
        t: 0,
      })
    }
  }

  for (const p of points) {
    const { x, y, t } = p
    stroke(0, 0, 0, min(t * 10, 200))
    const rad = getForceOnPoint(x, y, mouseX + mouseY + frameCount / 2)
    const nx = x + cos(rad) * LENGTH
    const ny = y + sin(rad) * LENGTH
    line(x, y, nx, ny)
    p.x = nx
    p.y = ny
    p.t += 1
  }
}

function restart() {
  if (el.value)
    mount(el.value, { setup, draw })
}

onMounted(restart)
onUnmounted(() => unmount())
</script>
