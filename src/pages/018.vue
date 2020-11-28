<template lang='pug'>
paper
  .box.centered.overflow-hidden(@click='roll' ref='el')
    canvas.absolute.left-0.top-0.opacity-25(ref='canvas' width='400' height='400')
  .box-description(v-if='false')
    .flex.flex-col.mt-2
      p.text-gray-400 (t,x,y) =>
      .flex
        .mr-2.text-gray-400 x =
        input.flex-auto.outline-none(
          v-model='expX'
          maxlength='32'
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

<script setup lang='ts'>
import { noop, useIntervalFn, useThrottle } from '@vueuse/shared'
import { ref, onMounted, watch } from 'vue'
import Matter from 'matter-js'
import { useRouteQuery } from '@vueuse/router'
import { initCanvas, random, range } from '../utils'

const { Engine, Render, World, Bodies, Body } = Matter

const el = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const runner = ref<HTMLIFrameElement | null>(null)

const debug = useRouteQuery('debug')
const showArrows = debug

let presetIndex = 0
const presets = [
  ['sin(x / 10) / 2', 'sin(y / 10) / 2'],
  ['sin(x / 15) / 1.5', 'sin(y / 15) / 1.5'],
]

const expX = ref('sin(x / 10) / 2')
const expY = ref('sin(y / 10) / 2')

const thorrtledX = useThrottle(expX, 500)
const thorrtledY = useThrottle(expY, 500)

const MathContext = `const {${Object.getOwnPropertyNames(Math).join(',')}}=Math`

const cx = 200
const cy = 200

let fnX = (t: number, x: number, y: number) => 0
let fnY = (t: number, x: number, y: number) => 0

const field = (_x = 0, _y = 0) => {
  const x = cx - _x
  const y = cy - _y
  return [
    fnX(0, x, y),
    fnY(0, x, y),
  ]
}

const f = {
  reset: noop,
}

function roll() {
  presetIndex = (presetIndex + 1) % presets.length
  const [a, b] = presets[presetIndex]
  expX.value = a
  expY.value = b
}

onMounted(async() => {
  const { ctx } = initCanvas(canvas.value!)

  const arrow = (fromx = 0, fromy = 0, tox = 0, toy = 0) => {
    const headlen = 2 // length of head in pixels
    const dx = tox - fromx
    const dy = toy - fromy
    const angle = Math.atan2(dy, dx)
    ctx.strokeStyle = '#ff505050'
    ctx.lineWidth = 0.3
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(tox, toy)
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }

  const fieldArrow = () => {
    ctx.clearRect(0, 0, 400, 400)

    if (showArrows.value) {
      for (let x = 5; x <= 400; x += 10) {
        for (let y = 5; y <= 400; y += 10) {
          const [dx, dy] = field(x, y)
          arrow(x, y, x + dx * 10, y + dy * 10)
        }
      }
    }
  }

  const engine = Engine.create()
  const render = Render.create({
    element: el.value!,
    engine,
    options: {
      width: 400,
      height: 400,
      background: 'transparent',
      wireframes: false,
      // @ts-expect-error untyped
      pixelRatio: 'auto',
      // showVelocity: true,
      // showAngleIndicator: true,
    },
  })
  engine.world.gravity.y = 0

  const dot = (x = 0, y = 0) => {
    return Bodies.circle(x, y, 0.5, {
      frictionAir: 0,
      friction: 0,
      render: {
        fillStyle: 'transparent',
        strokeStyle: 'black',
        lineWidth: 1,
      },
    })
  }

  const dots = range(1000).map(i => dot(random(400), random(400)))

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
        // f.reset()
        fieldArrow()
      }
      catch (e) {
        console.log(expX, expY, e.message)
      }
    },
    { immediate: true },
  )

  f.reset = () => {
    dots.forEach((dot) => {
      Body.setPosition(dot, { x: random(400), y: random(400) })
    })
  }

  World.add(engine.world, dots)

  useIntervalFn(() => {
    for (const dot of dots) {
      const [fx, fy] = field(dot.position.x, dot.position.y)
      Body.setVelocity(dot, { x: fx, y: fy })
    }
  }, 1000, true)

  useIntervalFn(() => {
    roll()
  }, 10000)

  Engine.run(engine)
  Render.run(render)
})
</script>
