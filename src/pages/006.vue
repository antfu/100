<template lang='pug'>
paper
  .fixed.top-0.bottom-0.left-0.right-0(ref='el')

note
  p drag them, or shake your phone
  br
  a.link(@click='toggleShape') toggle shape
</template>

<script setup lang='ts'>
import { useEventListener, useWindowSize } from '@vueuse/core'
import { ref, onMounted, reactive, computed, watch } from 'vue'
import type Matter from 'matter-js'
import { useRoute } from 'vue-router'
import { load, range, useShake } from '../utils'

const route = useRoute()

export const el = ref(null)
export const sphere = ref(!route.query.square)
export const debug = ref(!!route.query.debug)

const size = 50
const rows = 8

const viewport = reactive(useWindowSize())

const offest = reactive({
  x: computed(() => (viewport.width - size * rows) / 2),
  y: computed(() => (viewport.height - size * rows) / 2),
})

export const toggleShape = () => {
  sphere.value = !sphere.value
}

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

  const engine = Engine.create()
  const render = Render.create({
    element: el.value!,
    engine,
    options: {
      width: viewport.width,
      height: viewport.height,
      background: 'transparent',
      wireframes: false,
      // @ts-ignore untyped
      showVelocity: debug.value,
      // @ts-ignore untyped
      pixelRatio: 'auto',
    },
  })

  watch(viewport, () => {
    render.canvas.width = viewport.width
    render.canvas.height = viewport.height
    render.canvas.style.height = `${viewport.height}px`
    render.canvas.style.width = `${viewport.width}px`
  })

  engine.world.gravity.y = 0

  const r8 = range(rows)

  const blocks = r8.flatMap(ix => r8.map((iy) => {
    let body: Matter.Body = undefined!

    const pos = reactive({
      x: computed(() => offest.x + ix * size + size * 0.5),
      y: computed(() => offest.y + iy * size + size * 0.5),
    })

    const options = {
      frictionAir: 0.1,
      friction: 0,
      render: {
        fillStyle: `rgb(${30 + ix * 26},${80 + iy * 22},${90 + (9 - ix) * (8 - iy)})`,
        strokeStyle: 'black',
        lineWidth: 0,
      },
    }

    const restore = (factor = 0.05) => {
      Body.setVelocity(
        body,
        {
          x: factor * (pos.x - body.position.x),
          y: factor * (pos.y - body.position.y),
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
      Body.setPosition(body, { x: pos.x, y: pos.y })
    }

    const getDistance = () => {
      return Math.sqrt((pos.x - body.position.x) ** 2 + (pos.y - body.position.y) ** 2)
    }

    const init = () => {
      if (body)
        World.remove(engine.world, body)

      body = sphere.value
        ? Bodies.circle(pos.x, pos.y, size / 2, options)
        : Bodies.rectangle(pos.x, pos.y, size, size, options)

      World.add(engine.world, [body])
    }

    const shake = (mutiplier = 30) => {
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 2)
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 2 * mutiplier, y: (Math.random() - 0.5) * 2 * mutiplier })
    }

    watch([sphere, viewport], init, { immediate: true })

    return {
      getDistance,
      restore,
      reset,
      shake,
    }
  }))

  const mouse = Mouse.create(render.canvas)
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    // @ts-ignore
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  })
  World.add(engine.world, mouseConstraint)

  let restoreCount = 0
  let timer: ReturnType<typeof setInterval> | undefined
  let timeout: ReturnType<typeof setTimeout> | undefined

  const restoreAll = () => {
    blocks.map(i => ({ ...i, distance: i.getDistance() }))
      .sort((a, b) => b.distance - a.distance)
      .forEach((i, idx) => i.restore(idx < 3 ? 0.2 : 0.05))
  }

  const start = () => {
    if (restoreCount) {
      restoreCount = 60
      return
    }
    stop()
    restoreCount = 60
    timeout = setTimeout(() => {
      timer = setInterval(() => {
        restoreCount -= 1
        restoreAll()
        if (restoreCount <= 0)
          stop()
      }, 100)
    }, 2000)
  }
  const stop = () => {
    if (timer)
      clearInterval(timer)
    if (timeout)
      clearInterval(timeout)

    restoreCount = 0
  }
  const reset = () => {
    stop()
    blocks.forEach(i => i.reset())
  }
  const shake = () => {
    stop()
    blocks.forEach(i => i.shake())
    start()
  }

  // @ts-ignore
  render.mouse = mouse

  useEventListener('keydown', (e) => {
    if (e.key === 'r')
      reset()
  })

  useEventListener('mouseup', start)
  useEventListener('touchend', start)

  useEventListener('mousedown', stop)
  useEventListener('touchstart', stop)

  useShake(shake)

  // @ts-ignore
  render.element.style.zIndex = -1

  Engine.run(engine)
  Render.run(render)

  if (route.query.shake) {
    setTimeout(shake, 500)
    setTimeout(shake, 1000)
  }
})
</script>

<style lang="stylus" scoped>

</style>