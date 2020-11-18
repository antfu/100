<template lang='pug'>
paper
  .box.overflow-hidden(@click='f.start')
    canvas(ref='el' width='400' height='400')
  .box-description.py-2.flex(v-if='!shot')
    .flex(@click='init = init % 8 + 1')
      .text-gray-400 init
      .text-gray-500.bold.px-2 {{init}}
    .flex.ml-3(@click='len = len % 8 + 1')
      .text-gray-400 len
      .text-gray-500.bold.px-2 {{len}}
    .flex-auto
    .text-gray-400(v-if='!stopped') *

note
  .p for each node, there is 50% chance for growing a new branch for its two branches.
  br
  .p <b>init</b> - the initial iterations that guaranteed having 100% to grow.
  .p <b>len</b> - max length for each branch.
</template>

<script setup='props' lang='ts'>
import { useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { onMounted, ref, watch } from 'vue'
import { initCanvas, r15, r180, r90 } from '../utils'

export const shot = useRouteQuery('shot')
export const el = ref<HTMLCanvasElement | null>(null)

const { cos, sin, random } = Math

export const f = {
  start: () => {},
}

export const init = ref(5)
export const len = ref(5)
export const stopped = ref(false)

watch([init, len], () => f.start())

onMounted(async() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)
  const { width, height } = canvas

  let steps: Function[] = []
  let prevSteps: Function[] = []

  function polar2cart(x = 0, y = 0, r = 0, theta = 0) {
    const dx = r * cos(theta)
    const dy = r * sin(theta)
    return [x + dx, y + dy]
  }

  let iterations = 0

  const step = (x: number, y: number, rad: number) => {
    const length = random() * len.value

    const [nx, ny] = polar2cart(x, y, length, rad)

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(nx, ny)
    ctx.stroke()

    const rad1 = rad + random() * r15
    const rad2 = rad - random() * r15

    if (nx < -100 || nx > 500 || ny < -100 || ny > 500)
      return

    if (iterations <= init.value || random() > 0.5)
      steps.push(() => step(nx, ny, rad1))
    if (iterations <= init.value || random() > 0.5)
      steps.push(() => step(nx, ny, rad2))
  }

  const frame = () => {
    iterations += 1
    prevSteps = steps
    steps = []

    if (!prevSteps.length) {
      controls.pause()
      stopped.value = true
    }
    prevSteps.forEach(i => i())
  }

  const controls = useRafFn(frame, { immediate: false })

  f.start = () => {
    controls.pause()
    iterations = 0
    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = 1
    ctx.strokeStyle = '#00000040'
    prevSteps = []
    steps = random() < 0.5 ? [
      () => step(0, random() * 400, 0),
      () => step(400, random() * 400, r180),
    ] : [
      () => step(random() * 400, 0, r90),
      () => step(random() * 400, 400, -r90),
    ]
    controls.resume()
    stopped.value = false
  }

  f.start()
})
</script>
