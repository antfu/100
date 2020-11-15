<template lang='pug'>
paper
  .box.borderless.centered
    canvas(ref='el' width='400' height='400')

note
  p 方 - Square
  p 圓 - Circle
</template>

<script setup lang='ts'>
import { useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { timestamp } from '@vueuse/shared'
import { onMounted, ref } from 'vue'
import { initCanvas, r180, r90, range, SQRT_2 } from '../utils'

export const el = ref<HTMLCanvasElement | null>(null)

export const shot = useRouteQuery('shot')

onMounted(() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)
  const { width, height } = canvas

  const cx = 200
  const cy = 200

  function roundRect(size = 0, r = 0) {
    const x = cx - size / 2
    const y = cy - size / 2
    r = Math.min(r, size / 2)
    ctx.beginPath()
    // top
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + size - r, y)
    ctx.arc(x + size - r, y + r, r, -r90, 0)
    // right
    ctx.lineTo(x + size, y + size - r)
    ctx.arc(x + size - r, y + size - r, r, 0, r90)
    // bottom
    ctx.lineTo(x + r, y + size)
    ctx.arc(x + r, y + size - r, r, r90, r180)
    // left
    ctx.lineTo(x, y + r)
    ctx.arc(x + r, y + r, r, r180, -r90)
    ctx.closePath()
    ctx.stroke()
  }

  function rectRound(size = 0, d = 0) {
    const hs = size / 2

    const h = hs + d
    const rad = Math.atan2(hs, h)
    const r = h / Math.cos(rad)

    ctx.beginPath()

    ctx.arc(cx, cy + d, r, -r90 - rad, -r90 + rad)
    ctx.arc(cx - d, cy, r, -rad, +rad)
    ctx.arc(cx, cy - d, r, r90 - rad, r90 + rad)
    ctx.arc(cx + d, cy, r, r180 - rad, r180 + rad)

    ctx.stroke()
  }

  let ts = timestamp()
  const duration = 1500

  const frame = () => {
    const t = timestamp() - ts

    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = 'black'
    ctx.lineWidth = 0.5

    for (const i of range(30))
      iterations(t - duration * 3 * i)
  }

  const iterations = (t: number) => {
    if (t < 0)
      return

    const turn = t % (duration * 2) >= duration
    const rt = t % duration
    const rounds = Math.floor(t / (duration * 2))

    const size = 398 / Math.pow(SQRT_2, rounds)

    if (rounds > 20)
      return

    if (turn)
      roundRect(size, size * Math.pow(rt / 550, 2))
    else
      rectRound(size, Math.pow(rt / 60, 4))
  }

  if (shot.value) {
    ts = timestamp() - duration * 4
    frame()
    return
  }

  const controls = useRafFn(frame)

  controls.start()
})
</script>

<style lang='stylus' scoped>

</style>
