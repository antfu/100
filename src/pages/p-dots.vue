<template lang='pug'>
paper
  .fixed.left-0.right-0.bottom-0.top-0(ref='el' style='z-index:-1')
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

const w = window.innerWidth
const h = window.innerHeight

const SCALE = 200
const LENGTH = 10
const SPACING = 15
const AMOUNT = 2000

function getForceOnPoint(x: number, y: number, z: number) {
  // https://p5js.org/reference/#/p5/noise
  return (noise(x / SCALE, y / SCALE, z) - 0.5) * 2 * TWO_PI
}

let points: {x: number; y: number }[] = []

function setup() {
  createCanvas(w, h)
  background('#fff')
  stroke('#999')
  noFill()

  noiseSeed(+new Date())

  points = []

  for (let x = SPACING / 2; x < w; x += SPACING) {
    for (let y = SPACING / 2; y < h; y += SPACING)
      points.push({ x, y })
  }
}

function draw({ frameCount, mouseX, mouseY, millis, circle }: P5I) {
  background('white')
  const t = +new Date() / 10000

  for (const p of points) {
    const { x, y } = p
    const rad = getForceOnPoint(x, y, t)
    const length = (noise(x / SCALE, y / SCALE, t * 2) + 0.5) * LENGTH
    const nx = x + cos(rad) * length
    const ny = y + sin(rad) * length
    circle(nx, ny, 1)
  }
}

function restart() {
  if (el.value)
    mount(el.value, { setup, draw })
}

onMounted(restart)
onUnmounted(() => unmount())
</script>
