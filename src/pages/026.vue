<template lang='pug'>
paper
  .box.borderless.centered.overflow-hidden(ref='el')

note
  p Day 1 of <a href='https://codecember.ink/2020/1' class="link" target='_blank'>#Codecember</a>
</template>

<script setup lang="ts">
import P5 from 'p5'
import { onMounted, ref } from 'vue'
import { distance, r60, SQRT_3 } from '../utils'

const el = ref<HTMLCanvasElement | null>(null)

const { abs, atan2, round, max, min } = Math

const w = 400
const h = 400

const len = 9
const margin = 10
const strokeWidth = 2

const columns = 30
const rows = 30
const n = 10

const cx = w / 2
const cy = h / 2

function fuckP5(p5: P5): P5 {
  const fucked = {} as P5

  // eslint-disable-next-line
  for (const k in p5) {
    const v = p5[k]
    if (!k.startsWith('_') && typeof v === 'function')
      fucked[k] = v.bind(p5)
    else
      fucked[k] = v
  }
  return fucked
}

onMounted(() => {
  new P5((p5: P5) => {
    const { createCanvas, background, strokeWeight, stroke, push, translate, pop, line, rotate, fill, noStroke } = fuckP5(p5)

    p5.setup = () => {
      createCanvas(w, h)
    }

    p5.draw = () => {
      background('transparent')

      for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < columns - 1; j++) {
          const q = i - rows / 2
          const r = j - columns / 2
          const s = -q - r

          if (abs(q) > n || abs(r) > n || abs(s) > n)
            continue

          // https://www.redblobgames.com/grids/hexagons/#hex-to-pixel-axial
          const currentOffset = {
            x: cx + margin * (q * SQRT_3 + r * SQRT_3 / 2),
            y: cx + margin * (r * 3 / 2),
          }

          const d = distance([currentOffset.x, currentOffset.y], [p5.mouseX, p5.mouseY])
          const gravity = 1 - min(d / 400, 1)

          const length = len * gravity
          const delta = {
            x: currentOffset.x + length / 2 - margin / 2 - p5.mouseX,
            y: currentOffset.y - p5.mouseY,
          }

          let theta = atan2(delta.y, delta.x)
          const deltaThreshold = 40

          theta += r60 * gravity

          strokeWeight(strokeWidth)
          stroke(100)

          if (abs(delta.x) < deltaThreshold && abs(delta.y) < deltaThreshold) {
            const amt = (abs(delta.x) + abs(delta.y)) / 2
            const amtMapped = p5.map(amt, 0, deltaThreshold, -50, 255)
            stroke(100, amtMapped)
          }

          push()
          translate(currentOffset.x, currentOffset.y)
          rotate(theta)

          line(0, 0, length, 0)
          pop()

          fill(250, 150, 0)
          noStroke()
        }
      }
    }
  }, el.value!)
})
</script>
