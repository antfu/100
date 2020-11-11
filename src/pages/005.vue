<template lang='pug'>
paper
  .flex.flex-col
    iframe.none.h-2.mb-4(ref='runner' sandbox='allow-same-origin')
    .box.overflow-hidden(ref='box' @click='next' :class='{"rounded-full": rounded}')
      .canvas-wrapper
        canvas(ref='el')
    .flex.mt-2
      p.text-gray-500 (t,r,th) =>
      input.flex-auto.outline-none.ml-3(v-model='expression' ref='input' maxlength='32' autocomplete='false' spellcheck='false')
    p.text-gray-400(:class='{"opacity-0": !author}') by <a :href='`https://twitter.com/${author}`' target='_blank'>@{{author}}</a>

note
  p.font-bold.mb-1 polar = (t,r,th)
  p inspired by <a href='https://tixy.land/' target='_blank'>tixy.land</a> but in polar coordinates
  br
  pre <b>t</b>  - seconds passed
  pre <b>r</b>  - radial    (-1 ~ 1)
  pre <b>th</b> - angular θ (-1 ~ 1)
  br
  p return value should be in -1 to 1
  p 0 -> black / 1 -> A / -1 -> B
  p color A & B will be picked randomly
  br
  p `Math.` can be omitted
  p `2 * t` can be written as `2t`
  p link is sharable
  br
  p(@click='recolor') <b>c</b> - change colors
  p(@click='f.start') <b>r</b> - reset `t`
  p(@click='toggleShape') <b>s</b> - canvas shape
</template>

<script setup lang='ts'>
import { useEventListener, useRafFn, useThrottle, noop } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, initCanvas, load, pick, range, shuffle } from '../utils'

const presets = shuffle([
  { code: 'th - sin(r) * cos(t)' },
  { code: 'abs(sin(r - 3t))' },
  { code: 't % r' },
  { code: 'random() * 2 - 1' },
  { code: 'tan(th * 12t)' },
  { code: 'tan(th) / r / sin(t)' },
  { code: 'r * cos(th) < sin(t)' },
  { code: 'round(20r*cos(th+t))%3' },
  { code: 'ceil(20r*cos(t%th))%4' },

  // community
  { code: 'abs(tan(r*t/th)|r)', by: 'inky' },
  { code: 'sin(3 * t)/r', by: 'rudygt' },
  { code: 'sin(t%r)*r/th*cos(random()-r)', by: 'line_o' },
  { code: 'cos(t%th)/1-tan(r-random()*.091)', by: 'line_o' },
  { code: 'abs(th+t)*4%2>1&&r', by: 'matths' },
  { code: 'tan(t*cos(2*th))*cos(t*r)', by: 'patak_js' },
  { code: 'cos(t*r*2)**2-sin(t*th)**2', by: 'patak_js' },
  { code: 'abs(th+sin(t*r))', by: 'cartocalypse' },
  { code: 'sin(th+t+r*tan(t))', by: 'erinbeess' },
  { code: '.5r*sin(th)+.5/.5*sin(t*5)', by: 'matths' },
  { code: '(cos(2t*r)-sin(t+th))*0.5', by: 'patak_js' },
  { code: '(cos(2t*(r-1))-sin(t+5*th))/2', by: 'patak_js' },
])

export const el = ref<HTMLCanvasElement | null>(null)
export const runner = ref<HTMLIFrameElement | null>(null)
export const input = ref<HTMLInputElement | null>(null)

const route = useRoute()
const router = useRouter()
let expressionIndex = -1

export const rounded = ref(false)

export const author = computed(() =>
  presets.find(i => i.code === expression.value)?.by,
)

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ]
}

const colors = shuffle([
  '#30896C',
  '#3A8FB7',
  '#58B2DC',
  '#9B90C2',
  '#A8D8B9',
  '#BEC23F',
  '#D05A6E',
  '#D75455',
  '#F05E1C',
  '#F19483',
  '#F6C555',
]).map(i => hexToRgb(i))

let colorA = [0, 0, 0]
let colorB = [0, 0, 0]

export const expression = ref<string>(route.query?.q?.toString()?.trimEnd() || '')
export const fps = Boolean(route.query?.fps)

const thorrtled = useThrottle(expression, 500)

const MathContext = `const {${Object.getOwnPropertyNames(Math).join(',')}}=Math`

export const toggleShape = () => rounded.value = !rounded.value

export const next = () => {
  expressionIndex += 1
  const { code } = get(presets, expressionIndex)
  expression.value = code
  recolor()
}

export const recolor = () => {
  colorA = pick(colors)
  colorB = pick(colors, colorA)
}

export const f = {
  start: noop,
  stop: noop,
}

recolor()
if (!expression.value)
  next()

useEventListener('keydown', (e) => {
  if (input.value === document.activeElement)
    return

  if (e.key === 'c') {
    recolor()
  }
  else if (e.key === 'r') {
    f.start()
  }
  else if (e.key === 's') {
    toggleShape()
  }
  else if (e.key === 'm') {
    colorA = [255, 255, 255]
    colorB = [255, 255, 255]
  }
})

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
      const [r, g, b] = it < 0 ? colorA : colorB
      const abs = Math.abs(it)
      drawPixel(data, x, y, r * abs, g * abs, b * abs)
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

  f.stop = () => {
    stopped = true
    rafControl.stop()
    ctx.clearRect(0, 0, width, height)
  }

  f.start = () => {
    ts = +new Date()
    stopped = false
    rafControl.start()
  }

  watch(
    thorrtled,
    (exp, prev) => {
      stop()
      fn = () => 0
      if (prev)
        router.replace({ query: { q: `${exp} ` } })

      try {
        // eslint-disable-next-line no-eval
        // @ts-ignore
        fn = runner.value!.contentWindow!.eval(`()=>{
          ${MathContext};
          return (t,r,th) => {
            return ${exp.replace(/(\d+)(\w)/, (_, n, x) => `${n} * ${x}`)}
          }
        }`)()
        f.start()
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
  margin-top: -2px;
  margin-left: -2px;
  perspective: 1px;
}
</style>
