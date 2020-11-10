<template lang='pug'>
paper
  .flex.flex-col
    iframe.display-none.h-1(ref='runner' sandbox='allow-same-origin')
    .box.overflow-hidden(ref='box' @click='random')
      .canvas-wrapper
        canvas(ref='el')
    .flex.mt-2
      p.text-gray-500 (t,r,th) =>
      input.flex-auto.outline-none.ml-3(v-model='expression' maxlength='20')

  note.font-normal.font-mono
    p.font-bold.mb-1 polar = (t,r,th)
    p inspired by <a href='https://tixy.land/' target='_blank'>tixy.land</a> but in polar coordinates
    br
    pre <b>t</b>  - seconds passed
    pre <b>r</b>  - radial    (-1 ~ 1)
    pre <b>th</b> - angular θ (-1 ~ 1)
    br
    p `Math.` can be omitted
    p `2 * t` can be written as `2t`
    p urls are sharable
</template>

<script setup lang='ts'>
import { useRafFn, useThrottle } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initCanvas, load, next, pick, range, shuffle } from '../utils'

export const el = ref<HTMLCanvasElement | null>(null)
export const runner = ref<HTMLIFrameElement | null>(null)

const route = useRoute()
const router = useRouter()

const expressions = shuffle([
  'th - sin(r) * cos(t)',
  'cos(t)',
  'abs(sin(r - 3t))',
  't % r',
  'random() * 2 - 1',
  'sin(th)',
  'tan(th * 2t)',
  'tan(th) / r / sin(t)',
])

const colors = [
  [190, 194, 63], // lime
  [178, 143, 206], // purple
  [241, 124, 103], // pink
  [80, 222, 191], // teal
  [239, 187, 36], // yellow
]

let color = pick(colors).map(i => -i)

export const expression = ref<string>(route.query?.q?.toString() || pick(expressions))
export const fps = Boolean(route.query?.fps)

const thorrtled = useThrottle(expression, 500)

const MathContext = `const {${Object.getOwnPropertyNames(Math).join(',')}}=Math`

export const random = () => {
  expression.value = next(expressions, expression.value)
}

onMounted(async() => {
  await load('https://cdn.jsdelivr.net/npm/stats.js@0.17.0/build/stats.min.js')

  // @ts-ignore
  const stats = new window.Stats()
  if (fps) {
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)
  }

  const canvas = el.value!
  const width = 250
  const height = 250
  const { ctx } = initCanvas(canvas, width, height, 1)
  let stopped = true

  const w2 = width / 2
  const h2 = height / 2

  let fn = (t: number, r: number, th: number) => 0

  const pixel = (data: ImageData, x: number, y: number) => {
    const rx = (x - w2) / w2
    const ry = (y - h2) / h2
    const radius = Math.sqrt(rx ** 2 + ry ** 2)
    const th = Math.atan2(ry, rx)

    return (t: number) => {
      const raw = fn(t, radius, th) as any
      const value = +raw
      const it = isNaN(value) ? 0 : value
      const [r, g, b] = it < 0 ? color : [255, 255, 255]
      drawPixel(data, x, y, r * it, g * it, b * it)
    }
  }

  const drawPixel = (data: ImageData, x: number, y: number, r: number, g: number, b: number) => {
    const pixelindex = (y * width + x) * 4
    data.data[pixelindex] = r
    data.data[pixelindex + 1] = g
    data.data[pixelindex + 2] = b
    data.data[pixelindex + 3] = 255
  }

  const data = ctx.createImageData(width, height)

  const pxh = range(height)
  const pxw = range(width)

  const pixels = pxw.flatMap(x => pxh.map(y => pixel(data, x, y)))

  const frame = (t: number) => {
    try {
      pixels.forEach(p => p(t))
      ctx.putImageData(data, 0, 0)
    }
    catch (e) {
      console.log(e)
      stop()
    }
  }

  let ts = 0

  const rafControl = useRafFn(() => {
    stats.begin()
    if (!stopped)
      frame((+new Date() - ts) / 1000)

    stats.end()
  })

  const stop = () => {
    stopped = true
    rafControl.stop()
    ctx.clearRect(0, 0, width, height)
  }

  const start = () => {
    ts = +new Date()
    stopped = false
    rafControl.start()
  }

  watch(
    thorrtled,
    (exp, prev) => {
      stop()
      fn = () => 0
      color = pick(colors).map(i => -i)
      if (prev)
        router.replace({ query: { q: exp } })

      try {
        // eslint-disable-next-line no-eval
        // @ts-ignore
        fn = runner.value!.contentWindow!.eval(`()=>{
          ${MathContext};
          return (t,r,th) => {
            return ${exp.replace(/(\d+)(\w)/, (_, n, x) => `${n} * ${x}`)}
          }
        }`)()
        start()
      }
      catch (e) {
      }
    },
    { immediate: true },
  )
})
</script>

<style lang='stylus' scoped>
.canvas-wrapper {
  transform: scale(1.6);
  transform-origin: 0 0;
  margin-top: -1px;
}
</style>
