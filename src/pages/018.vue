<template lang='pug'>
paper
  .box.centered.overflow-hidden(@click='f.reset' ref='canvas')
  .box-description
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
import { random, range } from '../utils'

const { Engine, Render, World, Bodies, Body } = Matter

export const canvas = ref(null)
export const runner = ref<HTMLIFrameElement | null>(null)
export const expX = ref('sin(x / 10) / 2')
export const expY = ref('sin(y / 10) / 2')

const thorrtledX = useThrottle(expX, 500)
const thorrtledY = useThrottle(expY, 500)

const MathContext = `const {${Object.getOwnPropertyNames(Math).join(',')}}=Math`

export const f = {
  reset: noop,
}

onMounted(async() => {
  const engine = Engine.create()
  const render = Render.create({
    element: canvas.value!,
    engine,
    options: {
      width: 400,
      height: 400,
      background: '#ffffff',
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

  let fnX = (t: number, x: number, y: number) => 0
  let fnY = (t: number, x: number, y: number) => 0

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
        f.reset()
      }
      catch (e) {
        console.log(expX, expY, e.message)
      }
    },
    { immediate: true },
  )

  const cx = 200
  const cy = 200
  const field = (_x = 0, _y = 0) => {
    const x = cx - _x
    const y = cy - _y
    return [
      fnX(0, x, y),
      fnY(0, x, y),
    ]

    // sin((cx - x) / 10) / 2, sin((cy - y) / 10) / 2]
  }

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
  }, 300, true)

  Engine.run(engine)
  Render.run(render)
})
</script>
