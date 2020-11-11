<template lang='pug'>
paper
  .box.overflow-hidden(ref='box' @click='next')
    .canvas-wrapper
      canvas(ref='el')
  .box-description
    .flex.flex-col.mt-2
      p.text-gray-400 (t,x,y) =>
      input.flex-auto.outline-none(
        v-model='expX'
        maxlength='32'
        autocomplete='false'
        spellcheck='false'
      )
      input.flex-auto.outline-none(
        v-model='expY'
        maxlength='32'
        autocomplete='false'
        spellcheck='false'
      )
    iframe.none.h-0(ref='runner' sandbox='allow-same-origin')

note
  p Hello
</template>

<script setup lang='ts'>
import { useEventListener, useRafFn, useThrottle, noop } from '@vueuse/core'
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initCanvas, load, range } from '../utils'

export const el = ref<HTMLCanvasElement | null>(null)
export const runner = ref<HTMLIFrameElement | null>(null)
export const input = ref<HTMLInputElement | null>(null)

function useRouteQuery(name: string, defaultValue?: string, { mode = 'replace', route = useRoute(), router = useRouter() } = {}): Ref<string> {
  return computed<any>({
    get() {
      const data = route.query[name]
      if (data == null)
        return defaultValue ?? null

      if (Array.isArray(data))
        return data.filter(Boolean)
      return data
    },
    set(v) {
      // @ts-ignore
      router.replace({ query: { ...route.query, [name]: v } })
    },
  })
}

export const expX = useRouteQuery('x', 'x + 1')
export const expY = useRouteQuery('y', 'y + 1')
export const fps = useRouteQuery('fps')

const thorrtledX = useThrottle(expX, 500)
const thorrtledY = useThrottle(expY, 500)

const MathContext = `const {${Object.getOwnPropertyNames(Math).join(',')}}=Math`

export const f = {
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

  const frame = (t: number) => {
    try {
      const nx = +fnX(t, ix, iy)
      const ny = +fnY(t, ix, iy)

      const tx = Math.round((cx + nx)) % width
      const ty = Math.round((cy - ny)) % height

      drawPixel(data, tx, ty, 0, 0, 0)

      ix = nx
      iy = ny

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
    if (!stopped) {
      t += 1
      frame(t)
    }

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
            return ${expX.replace(/(\d+)(\w)/, (_, n, x) => `${n} * ${x}`)}
          }
        }`)()
        // @ts-ignore
        fnY = runner.value!.contentWindow!.eval(`()=>{
          ${MathContext};
          return (t,x,y) => {
            return ${expY.replace(/(\d+)(\w)/, (_, n, x) => `${n} * ${x}`)}
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
