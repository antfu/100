<template lang='pug'>
paper
  .box.centered.overflow-hidden
    canvas(ref='el' width='400' height='400')

note
  p Will I get my PS5?
</template>

<script setup lang='ts'>
import { timestamp, useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { onMounted, ref } from 'vue'
import { initCanvas, SQRT_3, Vector, r360, range, r30, r60, r120 } from '../utils'

export const el = ref<HTMLCanvasElement | null>(null)

export const shot = useRouteQuery('shot')

onMounted(() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)
  const { width, height } = canvas

  const s = 30
  const hs = s / 2
  const r3s = s * SQRT_3 / 2

  function draw(vec: Vector[]) {
    ctx.beginPath()

    ctx.moveTo(...vec[0])
    vec.slice(1).forEach(v => ctx.lineTo(...v))
    ctx.lineTo(...vec[0])

    ctx.stroke()
  }

  function rotate(vec: Vector[], rad = 0): Vector[] {
    const sin = Math.sin(rad)
    const cos = Math.cos(rad)
    return vec.map(([x, y]) => [x * cos - y * sin, y * cos + x * sin])
  }

  function zoom(vec: Vector[], m = 1): Vector[] {
    return vec.map(([x, y]) => [x * m, y * m])
  }

  function move(vec: Vector[], dx = 0, dy = 0): Vector[] {
    return vec.map(([x, y]) => [x + dx, y + dy])
  }

  const ts = timestamp()

  const _triangle: Vector[] = [
    [0, -r3s / 2 * 1.15],
    [hs * 1.15, +r3s / 2 * 1.15],
    [-hs * 1.15, +r3s / 2 * 1.15],
  ]
  const _square: Vector[] = [
    [-hs, -hs],
    [-hs, hs],
    [hs, hs],
    [hs, -hs],
  ]
  const _crossA: Vector[] = [
    [-hs, -hs],
    [hs, hs],
  ]
  const _crossB: Vector[] = [
    [-hs, hs],
    [hs, -hs],
  ]

  function triange(dx: number, dy: number, rad = 0, scale = 1) {
    draw(move(zoom(rotate(_triangle, rad), scale), dx, dy))
  }

  function square(dx: number, dy: number, rad = 0, scale = 1) {
    draw(move(zoom(rotate(_square, rad), scale), dx, dy))
  }

  function cross(dx: number, dy: number, rad = 0, scale = 1) {
    draw(move(zoom(rotate(_crossA, rad), scale), dx, dy))
    draw(move(zoom(rotate(_crossB, rad), scale), dx, dy))
  }

  function circle(dx: number, dy: number, rad = 0, scale = 1) {
    ctx.beginPath()
    ctx.arc(dx, dy, hs * scale, 0, r360)
    ctx.stroke()
  }

  function mulberry32(a: number) {
    let t = a += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }

  const _rotationCache: Record<number, Record<number, number>> = {}
  function rotation(x = 0, y = 0) {
    if (!_rotationCache[x])
      _rotationCache[x] = {}
    if (_rotationCache[x][y] == null)
      _rotationCache[x][y] = Math.sin(mulberry32(x) * mulberry32(y)) * 2 % r120 - r60

    return _rotationCache[x][y]
  }

  const ranges = range(20)

  const frame = () => {
    const t = Math.max(timestamp() - ts, 0)

    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = '#777'

    function iteration(t: number) {
      const duration = 10000
      // const r = t / duration
      const scale = 1 - Math.sin(t % duration / duration)

      const d = s * 3.5 * scale
      const hd = d / 2

      for (const x of ranges) {
        for (const y of ranges) {
          square(x * d, y * d, rotation(x, 2 * y), scale)
          cross(x * d + hd, y * d, rotation(2 * x, y - 1), scale)
          triange(x * d, y * d + hd, rotation(x + 5, y - 4), scale)
          circle(x * d + hd, y * d + hd, 0, scale)
        }
      }
    }

    iteration(t)
  }

  ctx.lineWidth = 1

  const controls = useRafFn(frame)

  controls.start()
})
</script>

<style lang='stylus' scoped>

</style>
