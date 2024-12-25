<script setup lang="ts">
import type { P5I } from 'p5i'
import type { Vector } from '../utils'
import { useMouse } from '@vueuse/core'
import { p5i } from 'p5i'
import { createNoise4D } from 'simplex-noise'
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const { PI } = Math
const size = 400
const spacing = 30
const el = ref<HTMLElement | null>(null)

let lines: Vector[][] = []

const {
  mount,
  unmount,
  noiseSeed,
  background,
  stroke,
  TAU,
  CLOSE,
  cos,
  sin,
  beginShape,
  endShape,
  vertex,
  push,
  pop,
  noStroke,
  fill,
  createVector,
  map,
} = p5i()

const mouse = reactive(useMouse())
let t = 0
const simplex = createNoise4D()

function setup({ createCanvas }: P5I) {
  createCanvas(size, size)

  reset()
  background('white')
  stroke(0, 0, 0, 5)
  noiseSeed(+new Date())
}

function reset() {
  noiseSeed(+new Date())

  lines = []
  for (let x = -spacing / 2; x < size + spacing * 2; x += spacing) {
    const line: Vector[] = []
    for (let y = -spacing / 2; y < size + spacing * 2; y += spacing)
      line.push([x, y])
    lines.push(line)
  }

  background('white')
}

function fromAngle(theta: number, r = 1) {
  return createVector(r * cos(theta), r * sin(theta))
}

function cast(t: number) {
  const cosT = cos(t * TAU / 2) * 0.15
  const sinT = sin(t * TAU / 2) * 0.15

  push()
  noStroke()
  const N = 80
  for (let i = 0; i < N; i++) {
    const y = map(i, 0, N - 1, -100, size + 100)
    const points = []
    for (let x = -100; x <= size + 100; x += 2) {
      const angle = simplex(x / 800, y / 800, cosT, sinT) * TAU
      points.push(createVector(x, y).add(fromAngle(angle).setMag(40)))
    }

    beginShape()
    points.forEach(pt => vertex(pt.x, pt.y))
    points.reverse().forEach((pt) => {
      pt.add(fromAngle(-PI / 4).setMag(5))
      vertex(pt.x, pt.y)
    })
    endShape(CLOSE)
  }
  pop()
}

function draw({ height, width, BURN }: P5I) {
  t += 0.01

  background(0)
  fill(255, 255, 255, 200)
  cast(t)
  cast(t + 0.5)
}

onMounted(() => mount(el.value!, { setup, draw }))
onUnmounted(() => unmount())
</script>

<template lang='pug'>
paper
  .box.overflow-hidden(ref="el" @click='toggle')

note
  p Day 10 of <a href='https://codecember.netlify.app/2020/10' class="link" target='_blank'>#Codecember</a>
</template>
