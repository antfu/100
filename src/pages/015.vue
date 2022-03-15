<template lang='pug'>
paper
  .box.overflow-hidden(@click='f.start' style='border-color: #592A2A')
    canvas(ref='el' width='400' height='400')
</template>

<script setup='props' lang='ts'>
import { useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { onMounted, ref } from 'vue'
import { sampleSize } from 'lodash-es'
import { colorInterpration, hexToRgb, inbound, initCanvas, random, range } from '../utils'
import type { Vector } from '../utils'

const shot = useRouteQuery('shot')
const el = ref<HTMLCanvasElement | null>(null)

const { trunc } = Math

const f = {
  start: () => {},
}

const tick = ref(0)
const maxTicks = 5000
const iterations = 3

const pattele = [
  '#ffffff',
  '#f7ebbe',
  '#F2D399',
  '#F2AC57',
  '#F27F3D',
  '#8C4130',
  '#592A2A',
].map(hexToRgb)

function randomVectors(n = 5): Vector[] {
  return range(n).map(i => [trunc(random(400)), trunc(random(400))])
}

onMounted(async() => {
  const canvas = el.value!
  const width = 400
  const height = 400
  const { ctx } = initCanvas(canvas, width, height, 1)

  const data = ctx.createImageData(width, height)

  let rustness = range(width).map(i => new Array(height).fill(0))

  function clear() {
    rustness = rustness.map(col => col.map(i => 0))
    updateCanvas()
  }

  function updateCanvas() {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const rust = rustness[x][y]
        const [r, g, b] = colorInterpration(pattele, rust)

        const pixelindex = (y * width + x) * 4
        data.data[pixelindex] = r
        data.data[pixelindex + 1] = g
        data.data[pixelindex + 2] = b
        data.data[pixelindex + 3] = 255
      }
    }

    ctx.putImageData(data, 0, 0)
  }

  class Stain {
    constructor(
      public activePoints: Vector[],
      public iteractions = 5,
    ) {}

    next() {
      if (!this.iteractions)
        return
      this.iteractions -= 1

      const newPoints: Vector[] = []

      this.activePoints.forEach((point) => {
        const [x, y] = point

        rustness[x][y] += random(0.1, 0)

        const points: Vector[] = [
          [x, y],
          [x, y + 1],
          [x + 1, y],
          [x, y - 1],
          [x - 1, y],
          [x + 1, y + 1],
          [x + 1, y - 1],
          [x - 1, y + 1],
          [x - 1, y - 1],
        ]

        newPoints.push(
          ...points
            .filter(v => !newPoints.some(n => n[0] === v[0] && n[1] === v[1]))
            .filter(v => inbound(v))
            .filter(([x, y]) => {
              if (rustness[x][y] === 0)
                return true
              if (rustness[x][y] >= 1)
                return false
              if (rustness[x][y] > 0.8)
                return random() > 0.5
              else
                return random() > 0.2
            },
            ),
        )
      })

      this.activePoints = sampleSize(newPoints, 200)
    }
  }

  let stains: Stain[] = []

  const controls = useRafFn(frame, { immediate: false })

  function frame() {
    tick.value += 1
    for (let i = 0; i < iterations; i++) {
      stains.forEach((s) => {
        s.next()
        s.next()
        s.next()
        s.next()
      })
    }

    updateCanvas()

    if (tick.value >= maxTicks)
      controls.pause()
  }

  f.start = () => {
    tick.value = 0
    controls.pause()
    clear()
    stains = [
      new Stain([
        [0, trunc(random(400))],
        [trunc(random(400)), 0],
        [399, trunc(random(400))],
        [trunc(random(400)), 399],
      ], maxTicks * iterations),
      new Stain(randomVectors(40), maxTicks * iterations / 2),
      new Stain(randomVectors(3), maxTicks * iterations / 1.5),
    ]
    controls.resume()
  }

  f.start()
})
</script>
