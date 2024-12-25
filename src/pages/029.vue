<script setup lang="ts">
import type { Ref } from 'vue'
import { noop, useMouse, useMousePressed, useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { computed, onMounted, reactive, ref, unref as v } from 'vue'
import { useRouter } from 'vue-router'
import { initCanvas, random } from '../utils'

const el = ref<HTMLCanvasElement | null>(null)

const mouse = reactive(useMouse())
const { pressed } = useMousePressed({ target: el })

const { sin, cos } = Math

function useToNumber(r: Ref<string>) {
  return computed({
    get() {
      return +r.value
    },
    set(v: number) {
      r.value = v.toString()
    },
  })
}

const router = useRouter()
const shot = useRouteQuery('shot')
const isRandom = useRouteQuery('random')

const a = useToNumber(useRouteQuery('a', '3.05'))
const b = useToNumber(useRouteQuery('b', '2.46'))
const c = useToNumber(useRouteQuery('c', '-2.5'))
const d = useToNumber(useRouteQuery('d', '2.96'))

const fn = {
  clear: noop,
}

function rand() {
  return +(random() * 10 - 5).toFixed(2)
}

function roll(n: number) {
  [a, b, c, d][n].value = rand()
  fn.clear()
}

async function shuffle() {
  router.replace({ query: { a: rand(), b: rand(), c: rand(), d: rand() } })
  fn.clear()
}

if (isRandom.value || shot.value)
  shuffle()

onMounted(() => {
  const canvas = el.value!
  const { ctx } = initCanvas(canvas)
  const size = 400

  const fill = 0.15

  let x = 0
  let y = 0
  let t = 0
  x = y = 0

  fn.clear = () => {
    x = y = t = 0
    ctx.clearRect(0, 0, canvas.width, canvas.width)
  }

  function draw() {
    t += 1
    if (t > 30)
      return
    const _a = v(a)
    const _b = v(b)
    const _c = v(c)
    const _d = v(d)
    const s = size / 5
    const center = size / 2
    for (let j = 50; j--;) {
      for (let i = 1e3; i--;) {
        ctx.fillRect(x * s + center, y * s + center, fill, fill)
        const xn = sin(_a * y) - cos(_b * x)
        const yn = sin(_c * x) - cos(_d * y)
        x = xn
        y = yn
      }
    }
  }

  useRafFn(draw)
})
</script>

<template lang='pug'>
paper
  .box.overflow-hidden.borderless(@click='shuffle')
    canvas(ref="el")
  .box-description.py-4.flex.justify-center(v-if='!shot')
    .mx-4.text-right.text-gray-500(@click='roll(0)') a {{a<0?'':'+'}}{{a.toFixed(2)}}
    .mx-4.text-right.text-gray-500(@click='roll(1)') b {{b<0?'':'+'}}{{b.toFixed(2)}}
    .mx-4.text-right.text-gray-500(@click='roll(2)') c {{c<0?'':'+'}}{{c.toFixed(2)}}
    .mx-4.text-right.text-gray-500(@click='roll(3)') d {{d<0?'':'+'}}{{d.toFixed(2)}}
note
  p <b>Peter de Jong Attractor</b>
  br
  p Day 4 of <a href='https://codecember.netlify.app/2020/4' class="link" target='_blank'>#Codecember</a>
</template>
