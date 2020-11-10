<template lang='pug'>
paper
  .fixed.top-0.bottom-0.left-0.right-0(ref='el')
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { load, range } from '../utils'

export const el = ref(null)

onMounted(async() => {
  await load('https://cdn.jsdelivr.net/npm/matter-js@0.14.2/build/matter.min.js')
  const Matter = window.Matter
  const Engine = Matter.Engine
  const Render = Matter.Render
  const World = Matter.World
  const Bodies = Matter.Bodies
  const Body = Matter.Body
  const Mouse = Matter.Mouse
  const MouseConstraint = Matter.MouseConstraint

  const width = window.innerWidth
  const height = window.innerHeight

  const engine = Engine.create()
  const render = Render.create({
    element: el.value!,
    engine,
    options: {
      width,
      height,
      background: 'transparent',
      wireframes: false,
      // @ts-ignore untyped
      showVelocity: true,
      // @ts-ignore untyped
      pixelRatio: 'auto',
    },
  })

  engine.world.gravity.y = 0

  const r16 = range(8)

  const offsetX = (width - 400) / 2
  const offsetY = (height - 400) / 2

  const size = 50
  const blocks = r16.flatMap(ix => r16.map((iy) => {
    const x = offsetX + ix * size
    const y = offsetY + iy * size
    const body = Bodies.circle(x, y, size / 2, {
      frictionAir: 0.1,
      friction: 0,
      render: {
        fillStyle: `rgb(${30 + ix * 26},${60 + iy * 20},${90 + ix * iy})`,
        strokeStyle: 'black',
        lineWidth: 1,
      },
    })

    const restore = (factor = 0.1) => {
      Body.setVelocity(
        body,
        {
          x: factor * (x - body.position.x),
          y: factor * (y - body.position.y),
        },
      )
      Body.setAngularVelocity(
        body, -body.angle * factor,
      )
    }

    const reset = () => {
      Body.setAngularVelocity(body, 0)
      Body.setInertia(body, 0)
      Body.setVelocity(body, { x: 0, y: 0 })
      Body.setPosition(body, { x, y })
    }

    const getDistance = () => Math.sqrt((x - body.position.x) ** 2 + (y - body.position.y) ** 2)

    return {
      getDistance,
      body,
      restore,
      reset,
    }
  }))

  World.add(
    engine.world,
    blocks.map(i => i.body),
  )

  const mouse = Mouse.create(render.canvas)
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    // @ts-ignore
    constraint: {
      stiffness: 0.2,
      render: {
        visible: true,
      },
    },
  })

  World.add(engine.world, mouseConstraint)

  let restoreCount = 0
  let timer: ReturnType<typeof setInterval> | undefined

  const restoreAll = () => {
    blocks.map(i => ({ ...i, distance: i.getDistance() }))
      .sort((a, b) => b.distance - a.distance)
      .forEach((i, idx) => i.restore(idx < 3 ? 0.2 : 0.1))
  }

  const start = () => {
    if (restoreCount) {
      restoreCount = 10
      return
    }
    restoreCount = 10
    timer = setInterval(() => {
      restoreCount -= 1
      restoreAll()
      if (restoreCount <= 0)
        stop()
    }, 1000)
  }
  const stop = () => {
    if (timer)
      clearInterval(timer)
    restoreCount = 0
  }
  const reset = () => {
    stop()
    blocks.forEach(i => i.reset())
  }
  // @ts-ignore
  render.mouse = mouse

  addEventListener('keydown', (e) => {
    if (e.key === 'r')
      reset()
  })

  addEventListener('mouseup', start)
  addEventListener('touchend', start)

  addEventListener('mousedown', stop)
  addEventListener('touchstart', stop)

  // @ts-ignore
  render.element.style.zIndex = -1

  Engine.run(engine)
  Render.run(render)
})
</script>

<style lang="stylus" scoped>

</style>
