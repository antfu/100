<script setup lang="ts">
import type { P5I } from 'p5i'
import { clamp, useEventListener, useMouseInElement } from '@vueuse/core'
import { p5i } from 'p5i'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { range } from '../utils'

const { sqrt, PI, pow, random, trunc, E } = Math

const el = ref<HTMLElement | null>(null)

const size = 400
const hsize = size / 2
const step = 8
const steps = size / step
let strength = 130
let speed = 1
const pressed = ref(false)

const { elementY, elementX, isOutside } = useMouseInElement(el)

function press() {
  if (!isOutside.value)
    pressed.value = true
}

useEventListener('mousedown', press, { passive: true })
useEventListener('touchstart', press, { passive: true })

useEventListener('mouseup', () => pressed.value = false, { passive: true })
useEventListener('mouseleave', () => pressed.value = false, { passive: true })
useEventListener('touchend', () => pressed.value = false, { passive: true })
useEventListener('touchcancel', () => pressed.value = false, { passive: true })

watchEffect(() => {
  if (pressed.value) {
    strength = (1 - clamp(elementY.value, 0, size) / size) * 180
    speed = clamp(elementX.value, 0, size) / size * 1.8
  }
})

// See https://www.desmos.com/calculator/rx1syj7svh
const NORMAL_DIST_BASE = 1 / sqrt(2 * PI)
function normalDist(x: number, multipier = 4) {
  return NORMAL_DIST_BASE * E ** (-0.5 * (x ** 2)) * multipier
}

const NOISE_COUNT = 500
const NOISES = Array.from({ length: NOISE_COUNT }).fill(0).map(i => random())

function getNoises(d: number) {
  const start = trunc(d / size) % NOISE_COUNT
  const end = (start + steps + 2) % NOISE_COUNT
  const offset = d % step

  if (start < end)
    return { noises: NOISES.slice(start, end), offset }
  else
    return { noises: [...NOISES.slice(start), ...NOISES.slice(0, end)], offset }
}

function getNoise(idx: number) {
  return NOISES[idx % NOISE_COUNT]
}

function setup({ createCanvas }: P5I) {
  createCanvas(size, size)
}

let LINE_OFFSETS = Array.from({ length: steps }).fill(0).map(i => trunc(random() * step * NOISE_COUNT))
const LINE_SPEEDS = Array.from({ length: steps }).fill(0).map(i => random() * 0.02 + 0.005)
const LINE_DIRECTION = Array.from({ length: steps }).fill(0).map(i => random() > 0.5)
const rangeY = range(steps).slice(8)
const rangeX = range(steps)

function draw({ background, line, beginShape, endShape, vertex, quadraticVertex, noLoop, deltaTime }: P5I) {
  background('white')

  const lines = []

  LINE_OFFSETS = LINE_OFFSETS.map((v, i) => v + deltaTime * LINE_SPEEDS[i] * speed)

  // Create the lines
  for (const iy of rangeY) {
    const line = []
    const y = step * iy
    const d = LINE_OFFSETS[iy]
    const noiseOffset = trunc(d / step)
    const xOffset = d % step

    for (const ix of rangeX) {
      const x = ix * step - xOffset
      const variance = normalDist((x - hsize) / 50, strength)
      const noise = getNoise(ix + noiseOffset)
      const point = { x, y: y - noise * variance }
      line.push(point)
    }
    lines.push(line)
  }

  // Do the drawing
  lines
    .forEach((line, i) => {
      const getX = LINE_DIRECTION[i] ? (x: number) => x : (x: number) => size - x
      beginShape()
      vertex(getX(0), line[0].y)

      for (let j = 0; j < line.length - 1; j++) {
        const xc = (getX(line[j].x) + getX(line[j + 1].x)) / 2
        const yc = (line[j].y + line[j + 1].y) / 2
        quadraticVertex(getX(line[j].x), line[j].y, xc, yc)
      }
      vertex(getX(size), line[0].y)
      endShape()
    })
}

const { mount, unmount } = p5i({ setup, draw })
onMounted(() => mount(el.value!))
onUnmounted(() => unmount())
</script>

<template lang='pug'>
paper
  .box.overflow-hidden.borderless(ref='el')

note
  p <b>Unknown Pleasures</b>
  br
  p Day 3 of <a href='https://codecember.netlify.app/2020/3' class="link" target='_blank'>#Codecember</a>
  br
  p Strength
  p ↑
  p |
  p |
  P +-------> Speed
</template>
