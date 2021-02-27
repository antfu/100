<template lang='pug'>
div
  .box.overflow-hidden
    .canvas-wrapper
      canvas(ref='el')
  .box-description(v-show='controls')
    .flex.flex-col.mt-2
      p.text-gray-400 (t,x,y) =>
      .flex
        .mr-2.text-gray-400 x =
        input.flex-auto.outline-none(
          v-model='expX'
          :maxlength='32'
          autocomplete='false'
          spellcheck='false'
        )
      .flex
        .mr-2.text-gray-400 y =
        input.flex-auto.outline-none(
          v-model='expY'
          maxlength='32'
          autocomplete='false'
          spellcheck='false'
        )
    iframe.none.h-0(ref='runner' sandbox='allow-same-origin')
</template>

<script setup='props' lang='ts'>
import { useEventListener, useRafFn, useThrottle, noop, useVModel } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { onMounted, ref, watch, defineProps } from 'vue'
import { initCanvas, load, range } from '../utils'

const props = defineProps({
  x: {
    type: String,
    required: true,
  },
  y: {
    type: String,
    required: true,
  },
  controls: {
    type: Boolean,
  },
  iterations: {
    type: Number,
    required: true,
  },
})

const el = ref<HTMLCanvasElement | null>(null)
const runner = ref<HTMLIFrameElement | null>(null)
const input = ref<HTMLInputElement | null>(null)

const expX = useVModel(props, 'x')
const expY = useVModel(props, 'y')
const fps = useRouteQuery('fps')

const thorrtledX = useThrottle(expX, 500)
const thorrtledY = useThrottle(expY, 500)

const MathContext = `const {${Object.getOwnPropertyNames(Math).join(',')}}=Math`

const f = {
  start: noop,
  stop: noop,
}

useEventListener('keydown', (e) => {
  if (document.body !== document.activeElement)
    return

  if (e.key === 'r')
    f.start()
})

onMounted(async() => {
  await load('https://cdn.jsdelivr.net/npm/stats.js@0.17.0/build/stats.min.js')

  // @ts-ignore
  const stats = new window.Stats()
  if (fps.value) {
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)
  }

  const canvas = el.value!
  const width = 400
  const height = 400
  const { ctx } = initCanvas(canvas, width, height, 1)

  let stopped = true

  const cx = width / 2
  const cy = height / 2

  let fnX = (t: number, x: number, y: number) => 0
  let fnY = (t: number, x: number, y: number) => 0

  const data = ctx.createImageData(width, height)

  const drawPixel = (data: ImageData, x: number, y: number, r: number, g: number, b: number) => {
    x = x % width
    y = y % height
    if (x < 0)
      x += width
    if (y < 0)
      y += width
    const pixelindex = (y * width + x) * 4
    data.data[pixelindex] = r
    data.data[pixelindex + 1] = g
    data.data[pixelindex + 2] = b
    data.data[pixelindex + 3] = 255
  }

  const clear = () => {
    for (const x of range(width)) {
      for (const y of range(height))
        drawPixel(data, x, y, 255, 255, 255)
    }
  }

  let ix = cx
  let iy = cy

  const iteration = () => {
    try {
      t += 1
      const nx = +fnX(t, ix, iy)
      const ny = +fnY(t, ix, iy)

      const tx = Math.round(cx + nx)
      const ty = Math.round(cy - ny)

      drawPixel(data, tx, ty, 0, 0, 0)

      ix = nx
      iy = ny
    }
    catch (e) {
      console.log(e)
      stop()
    }
  }

  const frame = () => {
    try {
      range(props.iterations || 2).forEach(() => {
        iteration()
      })

      ctx.putImageData(data, 0, 0)
    }
    catch (e) {
      console.log(e)
      stop()
    }
  }

  let t = 0

  const rafControl = useRafFn(() => {
    stats.begin()
    if (!stopped)
      frame()

    stats.end()
  })

  f.stop = () => {
    stopped = true
    rafControl.stop()
  }

  f.start = () => {
    t = 0
    ix = 0
    iy = 0
    clear()
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    stopped = false
    rafControl.start()
  }

  watch(
    [thorrtledX, thorrtledY],
    ([expX, expY]) => {
      stop()
      fnX = () => 0
      fnY = () => 0

      try {
        // eslint-disable-next-line no-eval
        // @ts-ignore
        fnX = runner.value!.contentWindow!.eval(`()=>{
          ${MathContext};
          return (t,x,y) => {
            return ${expX}
          }
        }`)()
        // @ts-ignore
        fnY = runner.value!.contentWindow!.eval(`()=>{
          ${MathContext};
          return (t,x,y) => {
            return ${expY}
          }
        }`)()

        console.log(expX, expY, 'ok')
        f.start()
      }
      catch (e) {
        console.log(expX, expY, e.message)
      }
    },
    { immediate: true },
  )
})
</script>

<style lang='stylus' scoped>
</style>
