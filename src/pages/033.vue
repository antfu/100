<template lang='pug'>
paper
  .box.overflow-hidden(ref="el" @click='toggle')

note
  p Day 8 of <a href='https://codecember.netlify.app/2020/8' class="link" target='_blank'>#Codecember</a>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { p5i } from 'p5i'
import type { P5I } from 'p5i'
import { useMouse } from '@vueuse/core'
import type { Vector } from '../utils'

const size = 400
const spacing = 30
const el = ref<HTMLElement | null>(null)

let lines: Vector[][] = []

const { mount, unmount, noiseSeed, background, stroke } = p5i()

const mouse = reactive(useMouse())
let black = true

function setup({ createCanvas, random, stroke }: P5I) {
  createCanvas(size, size)

  reset()
  background('white')
  stroke(0, 0, 0, 5)
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

function draw({ background, line, noLoop, random, noise, millis }: P5I) {
  lines.forEach((line, j) => line.forEach((l, i) => {
    l[0] += noise(l[0] / 5, l[1] / 5, mouse.x) - 0.5
    l[1] += noise(l[1] / 5, l[0] / 5, mouse.y) - 0.5
  }))

  for (let ix = 1; ix < lines.length - 1; ix += 1) {
    const points = lines[ix]
    for (let iy = 1; iy < points.length - 1; iy += 1) {
      line(...lines[ix][iy], ...lines[ix - 1][iy])
      line(...lines[ix][iy], ...lines[ix][iy - 1])
      line(...lines[ix][iy], ...lines[ix + 1][iy])
      line(...lines[ix][iy], ...lines[ix][iy + 1])
    }
  }
}

function toggle() {
  black = !black
  if (black)
    stroke(0, 0, 0, 5)
  else
    stroke(255, 255, 255, 5)
}

onMounted(() => mount(el.value!, { setup, draw }))
onUnmounted(() => unmount())
</script>
