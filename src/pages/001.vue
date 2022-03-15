<template lang='pug'>
paper
  .box.centered.overflow-hidden(@click='f.add' ref='canvas')

note
  p hands-on <a href='https://brm.io/matter-js' target='_blank'>Matter.js</a>
</template>

<script setup lang='ts'>
import { noop } from '@vueuse/shared'
import { onMounted, ref } from 'vue'
import Matter from 'matter-js'

const { Engine, Render, World, Bodies, Runner } = Matter
const canvas = ref(null)

const f = {
  add: noop,
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

  Runner.run(engine)
  Render.run(render)
})
</script>
