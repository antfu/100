<template lang='pug'>
paper
  .box.centered.overflow-hidden(ref='el')
</template>

<script setup lang='ts'>
// https://github.com/danmarshall/google-font-to-svg-path/blob/master/index.ts
import { noop } from '@vueuse/shared'
import { onMounted, ref } from 'vue'
import Matter from 'matter-js'
import { useRouteQuery } from '@vueuse/router'
import maker from 'makerjs'
import { load } from '../utils'

const { Engine, Render, Svg, Vertices, Bodies, World, Runner } = Matter

const el = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const runner = ref<HTMLIFrameElement | null>(null)

const debug = useRouteQuery('debug')

const f = {
  reset: noop,
}

onMounted(async() => {
  await Promise.all([
    load('https://cdn.jsdelivr.net/gh/schteppe/poly-decomp.js@master/build/decomp.min.js'),
    load('https://cdn.jsdelivr.net/gh/progers/pathseg@master/pathseg.js'),
    load('https://cdn.jsdelivr.net/npm/opentype.js/dist/opentype.min.js'),
  ])

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
  const world = engine.world

  window.opentype.load('http://fonts.gstatic.com/s/firacode/v9/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_ONrFVfxN87gsj0.ttf',
    (err, font) => {
      if (err || !font) {
        console.error(err)
        return
      }

      // generate the text using a font
      const textModel = new maker.models.Text(font, 'I', 5, true, false, undefined, { kerning: false })

      const svg = maker.exporter.toSVG(textModel)

      const dom = document.createElement('div')
      dom.innerHTML = svg
      const paths = Array.from(dom.querySelectorAll('path'))

      // console.log(paths)

      for (const path of paths) {
        const points = Svg.pathToVertices(path, 30)
        const vertexSets = [Vertices.scale(points, 2, 2, { x: 0, y: 0 })]
        // console.log(vertexSets)
        const body = Bodies.fromVertices(100, 200, vertexSets, {
          render: {
            fillStyle: '#fff',
            strokeStyle: '#000',
            lineWidth: 1,
          },
        }, true)
        World.add(world, body)
      }
    },
  )

  engine.gravity.y = 0

  Runner.run(engine)
  Render.run(render)
})
</script>
