<script setup lang="ts">
import { p5i } from 'p5i'
import type { P5I } from 'p5i'
import { onMounted, onUnmounted, ref } from 'vue'

const el = ref<HTMLCanvasElement | null>(null)

const {
  mount,
  unmount,
  createCanvas,
  background,
  noFill,
  stroke,
  noise,
  noiseSeed,
  resizeCanvas,
  cos,
  sin,
  TWO_PI,
} = p5i()

let w = window.innerWidth
let h = window.innerHeight
let offsetY = window.scrollY

const SCALE = 200
const LENGTH = 10
const SPACING = 15

function getForceOnPoint(x: number, y: number, z: number) {
  // https://p5js.org/reference/#/p5/noise
  return (noise(x / SCALE, y / SCALE, z) - 0.5) * 2 * TWO_PI
}

const existingPoints = new Set<string>()
const points: { id: string, x: number, y: number }[] = []

function addPoints() {
  for (let x = -SPACING / 2; x < w + SPACING; x += SPACING) {
    for (let y = -SPACING / 2; y < h + offsetY + SPACING; y += SPACING) {
      const id = `${x}-${y}`
      if (existingPoints.has(id))
        continue
      existingPoints.add(id)
      points.push({ id, x, y })
    }
  }
}

function setup() {
  createCanvas(w, h)
  background('#fff')
  stroke('#999')
  noFill()

  noiseSeed(+new Date())

  addPoints()
}

function draw({ circle }: P5I) {
  background('white')
  const t = +new Date() / 10000

  for (const p of points) {
    const { x, y } = p
    const rad = getForceOnPoint(x, y, t)
    const length = (noise(x / SCALE, y / SCALE, t * 2) + 0.5) * LENGTH
    const nx = x + cos(rad) * length
    const ny = y + sin(rad) * length
    circle(nx, ny - offsetY, 1)
  }
}

function restart() {
  if (el.value)
    mount(el.value, { setup, draw })
}

onMounted(() => {
  restart()

  useEventListener('resize', () => {
    w = window.innerWidth
    h = window.innerHeight
    resizeCanvas(w, h)
    addPoints()
  })

  useEventListener('scroll', () => {
    offsetY = window.scrollY
    addPoints()
  }, { passive: true })
})
onUnmounted(() => unmount())
</script>

<template lang='pug'>
paper
  .fixed.left-0.right-0.bottom-0.top-0(ref='el' style='z-index:-1')
</template>
