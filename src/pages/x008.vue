<template lang='pug'>
paper
  .box.centered.overflow-hidden
    canvas(ref='el' width='400' height='400' @click='f.run()')
  .box-description.py-1
    toggle.inline-block.mr-2(v-model='wireframe') wireframe
    turns.inline-block.mr-2(v-model='speedLevel' :options='speeds')
</template>

<script setup lang='ts'>
import { useRafFn } from '@vueuse/core'
import { noop, timestamp } from '@vueuse/shared'
import { computed, onMounted, ref } from 'vue'
import { initCanvas, SQRT_3, Vector, r90, range, r30, r60 } from '../utils'

export const el = ref<HTMLCanvasElement | null>(null)

export const f = {
  run: noop,
}

export const wireframe = ref(false)

export const speeds = ['x0.5', 'x1', 'x2']

export const speedLevel = ref('x1')

const speed = computed(() => {
  if (speedLevel.value === 'x0.5')
    return 3000
  else if (speedLevel.value === 'x2')
    return 750
  return 1500
})

onMounted(() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)
  const { width, height } = canvas

  const s = 35
  const hs = s / 2
  const r3s = s * SQRT_3 / 2
  const d = s / 2 + r3s
  const amount = Math.ceil(width / d)
  const offset = -hs

  function draw(vec: Vector[]) {
    ctx.beginPath()

    ctx.moveTo(...vec[0])
    vec.slice(1).forEach(v => ctx.lineTo(...v))
    ctx.lineTo(...vec[0])

    if (wireframe.value)
      ctx.stroke()
    else
      ctx.fill()
  }

  function rotate(vec: Vector[], rad = 0): Vector[] {
    const sin = Math.sin(rad)
    const cos = Math.cos(rad)
    return vec.map(([x, y]) => [x * cos - y * sin, y * cos + x * sin])
  }

  function move(vec: Vector[], dx = 0, dy = 0): Vector[] {
    return vec.map(([x, y]) => [x + dx, y + dy])
  }

  const ts = timestamp()

  const diamond: Vector[] = [
    [-hs, 0],
    [0, -r3s],
    [hs, 0],
    [0, r3s],
  ]
  const square: Vector[] = [
    [-hs, -hs],
    [-hs, hs],
    [hs, hs],
    [hs, -hs],
  ]

  const frame = () => {
    const t = timestamp() - ts

    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1

    const duration = speed.value

    const turn = Math.trunc(t / duration) % 2
    const cycle = Math.trunc(t / duration) % 4
    let r = t / duration * r90

    let h: Vector[] = []
    let v: Vector[] = []

    // diamonds
    if (turn) {
      if (!wireframe.value) {
        ctx.rect(0, 0, width, height)
        ctx.fillStyle = 'black'
        ctx.fill()
        ctx.fillStyle = 'white'
      }

      if (cycle === 1)
        r += r90

      // ctx.strokeStyle = 'blue'
      h = rotate(diamond, r)
      v = rotate(diamond, r + r90)

      for (const x of range(amount)) {
        for (const y of range(amount)) {
          draw(
            move(
              (x + y) % 2 ? h : v,
              x * d + offset,
              y * d + offset,
            ),
          )
        }
      }
    }

    // squares
    else {
      if (!wireframe.value) {
        ctx.rect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.fill()
        ctx.fillStyle = 'black'
      }

      if (cycle === 2) {
        h = rotate(square, r + r60)
        v = rotate(square, r - r60)
      }
      else {
        h = rotate(square, r + r30)
        v = rotate(square, r - r30)
      }

      for (const x of range(amount)) {
        for (const y of range(amount)) {
          draw(
            move(
              (x + y) % 2 ? h : v,
              (x - 0.5) * d + offset,
              (y - 0.5) * d + offset,
            ),
          )
        }
      }
    }
  }

  const controls = useRafFn(frame)

  controls.start()
})
</script>

<style lang='stylus' scoped>

</style>
