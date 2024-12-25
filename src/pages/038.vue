<script setup lang="ts">
import type { P5I } from 'p5i'
import { p5i } from 'p5i'
import { onMounted, onUnmounted, ref } from 'vue'

const el = ref<HTMLCanvasElement | null>(null)

const {
  mount,
  unmount,
  createCanvas,
  background,
  color,
  rotateX,
  rotateY,
  rotateZ,
  box,
  abs,
  push,
  pop,
  translate,
  millis,
} = p5i()

const w = 400
const h = 400
function setup({ WEBGL, ortho, strokeWeight }: P5I) {
  createCanvas(w, h, WEBGL)
  ortho(-w / 2, w / 2, h / 2, -h / 2, 0, 500)
  strokeWeight(2)
}

function draw() {
  background('black')

  const t = millis() / 1000

  for (let x = -5; x < 6; x++) {
    for (let y = -5; y < 6; y++)
      cube(x * 30, y * 30, t + (abs(x) + abs(y)) / 10)
  }
}

function cube(x = 0, y = 0, t = 0) {
  push()

  translate(x, y)
  rotateX(t)
  rotateY(t)
  rotateZ(t)

  box(15)

  pop()
}

function restart() {
  if (el.value)
    mount(el.value, { setup, draw })
}

onMounted(restart)
onUnmounted(() => unmount())
</script>

<template lang='pug'>
paper
  .box.overflow-hidden(ref='el')
</template>
