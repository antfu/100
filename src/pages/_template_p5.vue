<template lang='pug'>
paper
  .box.overflow-hidden.borderless(ref='el')

note
  p <b>Unknown Pleasures</b>
  br
  p Day 3 of <a href='https://codecember.netlify.app/2020/3' class="link" target='_blank'>#Codecember</a>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect, withCtx } from 'vue'
import { p5i } from 'p5i'
import type { P5I } from 'p5i'

const { sqrt, PI, pow, random, trunc, E } = Math
const size = 400
const el = ref<HTMLElement | null>(null)

function setup({ createCanvas }: P5I) {
  createCanvas(size, size)
}

function draw({ background, line, beginShape, endShape, vertex, quadraticVertex, noLoop, deltaTime }: P5I) {
  background('white')
}

const { mount, unmount } = p5i({ setup, draw })
onMounted(() => mount(el.value!))
onUnmounted(() => unmount())
</script>
