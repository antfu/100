<template lang='pug'>
paper
  .box.overflow-hidden(ref='el')

note
  p <b>Tonhalle – Beethoven</b>
  br
  p Day 6 of <a href='https://codecember.ink/2020/6' class="link" target='_blank'>#Codecember</a>
</template>

<script setup lang="ts">
import { p5i } from 'p5i'
import type { P5I } from 'p5i'
import { onMounted, onUnmounted, ref } from 'vue'
import { useMouseInElement } from '@vueuse/core'
import { hslToRgb } from '../utils'

const el = ref<HTMLCanvasElement | null>(null)

const {
  mount,
  unmount,
  createCanvas,
  background,
  noFill,
  stroke,
  strokeCap,
  strokeWeight,
  arc,
  push,
  pop,
  vertex,
  sin,
  cos,
  lerp,
  pow,
  millis,
  PI,
  TWO_PI,
  BEVEL,
  CLOSE,
  SQUARE,
} = p5i()

interface Ring {
  i: number
  spinSpeed: number
  diameter: number
  arcLength: number
  arcAngle: number
  weight: number
  color: number
  opacity: number
}

const rings: Ring[] = []
const count = 50
const { elementX, elementY } = useMouseInElement(el)

function setup({ windowWidth, windowHeight, random, floor }: P5I) {
  createCanvas(400, 400)

  for (let i = 0; i < count; i++) {
    const diameter = (i + 5) / count * 2
    const arcLength = random(PI * 0.1, PI)
    const arcAngle = random(-PI * 2, PI * 2)
    const spinSpeed = random(-1, 1)
    rings.push({
      i,
      spinSpeed,
      diameter,
      arcLength,
      arcAngle,
      weight: random(5, 30),
      color: random(255),
      opacity: random(100, 255),
    })
  }
}

function draw({ width, height, arc, translate }: P5I) {
  background('#fff')

  const minDim = Math.min(width, height)

  noFill()
  strokeCap(SQUARE)

  let d = minDim
  d -= d * 0.25

  const t = millis() / 500

  const x = elementX.value - 200
  const y = elementY.value - 200

  for (const { i, diameter, arcLength, arcAngle, spinSpeed, color, weight, opacity } of rings) {
    push()
    const spin = t * spinSpeed
    translate(x * i / count / 2, y * i / count / 2)
    strokeWeight(weight)
    stroke(color, color, color, opacity)

    arc(
      width / 2,
      height / 2,
      diameter * d,
      diameter * d,
      spin + arcAngle,
      spin + arcAngle + Math.PI * arcLength,
    )
    pop()
  }
}

onMounted(() => mount(el.value!, { setup, draw }))
onUnmounted(() => unmount())
</script>
