<template lang='pug'>
paper
  .box.overflow-hidden(@click='f.add' ref='canvas')

note
  p hands-on <a href='https://brm.io/matter-js' target='_blank'>Matter.js</a>
</template>

<script setup lang='ts'>
import { noop } from '@vueuse/shared'
import { ref, onMounted } from 'vue'
import { load } from '../utils'

export const canvas = ref(null)

export const f = {
  add: noop,
}

onMounted(async() => {
  await load('https://cdn.jsdelivr.net/npm/matter-js@0.14.2/build/matter.min.js')
  const Matter = window.Matter
  const Engine = Matter.Engine
  const Render = Matter.Render
  const World = Matter.World
  const Bodies = Matter.Bodies

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
    },
  })

  const wireframe = {
    fillStyle: 'transparent',
    strokeStyle: 'black',
    lineWidth: 1,
  }
  const ground = Bodies.rectangle(400, 200, 410, 50, {
    isStatic: true,
    render: wireframe,
  })

  World.add(engine.world, [ground])

  f.add = () => {
    const boxA = Bodies.rectangle(180, -40, 80, 80, { render: wireframe })
    World.add(engine.world, [boxA])
  }

  f.add()

  Engine.run(engine)
  Render.run(render)
})
</script>

<style lang="stylus" scoped>

</style>
