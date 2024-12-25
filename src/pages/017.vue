<script setup='props' lang='ts'>
import { timestamp, useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { onMounted, ref } from 'vue'
import { initCanvas, pick } from '../utils'

const shot = useRouteQuery('shot')
const el = ref<HTMLCanvasElement | null>(null)

const { pow, sqrt } = Math

const palette = [
  ['#B1B479', '#A35E47', '#B1B479', '#A35E47'],
  ['#CB1B45', '#A5A051', '#F9BF45', '#006284'],
  ['#F17C67', '#F17C67', '#F7D94C', '#F7D94C'],
  ['#69B0AC', '#90B44B', '#69B0AC', '#90B44B'],
  ['#222222', '#999999', '#222222', '#999999'],
]
let colors = palette[0]
let ts = timestamp()
let pattern = 0x1111

function reset() {
  ts = timestamp()
  pattern = pick([
    0x0101,
    0x0011,
    0x1111,
    0x1010,
    0x1100,
  ])
  colors = pick(palette)
}

onMounted(async () => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)
  const width = 400
  const height = 400

  const ratio = 30
  const G = height / ratio

  function down(offset = 0) {
    ctx.beginPath()
    ctx.moveTo(0, offset)
    ctx.lineTo(width, offset)
    ctx.stroke()
  }

  function right(offset = 0) {
    ctx.beginPath()
    ctx.moveTo(offset, 0)
    ctx.lineTo(offset, height)
    ctx.stroke()
  }

  function up(offset = 0) {
    ctx.beginPath()
    ctx.moveTo(0, height - offset)
    ctx.lineTo(width, height - offset)
    ctx.stroke()
  }

  function left(offset = 0) {
    ctx.beginPath()
    ctx.moveTo(width - offset, 0)
    ctx.lineTo(width - offset, height)
    ctx.stroke()
  }

  const cycle = sqrt(ratio * 2)
  const amount = 25
  const interval = cycle / amount

  function updateCanvas() {
    const t = timestamp() - ts
    ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < amount; i++) {
      const it = (t / 1000 - i * interval) % cycle
      if (it < 0)
        continue
      const offset = G * it ** 2 / 2

      if (pattern & 0x0001) {
        ctx.strokeStyle = colors[0]
        down(offset)
      }
      if (pattern & 0x0010) {
        ctx.strokeStyle = colors[1]
        up(offset)
      }
      if (pattern & 0x0100) {
        ctx.strokeStyle = colors[2]
        right(offset)
      }
      if (pattern & 0x1000) {
        ctx.strokeStyle = colors[3]
        left(offset)
      }
    }
  }

  useRafFn(updateCanvas)
})
</script>

<template lang='pug'>
paper
  .box.borderless(@click='reset')
    canvas(ref='el' width='400' height='400')
</template>
