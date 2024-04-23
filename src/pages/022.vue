<template lang='pug'>
paper
  .fixed.top-0.bottom-0.left-0.right-0(ref='el' style='filter:invert(1) brightness(1.5);')
  //- .box
</template>

<script setup lang='ts'>
import { useEventListener, useWindowSize } from '@vueuse/core'
import { onMounted, reactive, ref } from 'vue'
import Matter from 'matter-js'
// @ts-expect-error untyped
import MatterAttractors from 'matter-attractors'
import { useRoute } from 'vue-router'
import { addVec, load, range, vec2mat } from '../utils'
import type { Vector } from '../utils'

Matter.use(MatterAttractors)

const { Engine, Mouse, MouseConstraint, Render, World, Bodies, Runner } = Matter
const route = useRoute()

const el = ref(null)
const debug = ref(!!route.query.debug)

const viewport = reactive(useWindowSize())

onMounted(async() => {
  await Promise.all([
    load('https://cdn.jsdelivr.net/gh/schteppe/poly-decomp.js@master/build/decomp.min.js'),
    // load('https://cdn.jsdelivr.net/gh/progers/pathseg@master/pathseg.js'),
  ])

  const engine = Engine.create()
  const render = Render.create({
    element: el.value!,
    engine,
    options: {
      width: viewport.width,
      height: viewport.height,
      background: 'transparent',
      wireframes: true,
      showVelocity: debug.value,
      // @ts-expect-error untyped
      pixelRatio: 'auto',
    },
  })

  const mouse = Mouse.create(render.canvas)
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  })
  render.mouse = mouse
  render.element.style.zIndex = '-1'
  engine.world.gravity.y = 0

  World.add(engine.world, mouseConstraint)

  const gravity = 5e-5
  World.add(engine.world, Matter.Bodies.circle(
    viewport.width / 2,
    viewport.height / 2,
    0,
    {
      isStatic: true,
      plugin: {
        attractors: [
          (bodyA: Matter.Body, bodyB: Matter.Body) => {
            return {
              x: (bodyA.position.x - bodyB.position.x) * gravity,
              y: (bodyA.position.y - bodyB.position.y) * gravity,
            }
          },
        ],
      },
    },
  ))

  let bodies: Matter.Body[] = []

  const s = 18
  let points: Vector[] = []

  function shift<T>(arr: T[], offset = 0): T[] {
    const l = arr.length
    return arr.map((_, idx) => arr[(idx + offset) % l])
  }

  const getU = (d = 0) => {
    const diffs: Vector[][] = [
      [[-s, 0], [-s, -s], [s, -s], [s, 0]],
      [[0, s], [0, -s], [s, -s], [s, s]],
      [[-s, s], [-s, 0], [s, 0], [s, s]],
      [[-s, s], [-s, -s], [0, -s], [0, s]],
    ]
    const diff = diffs[d]
    const newPoints = points.map((v, i) => addVec(v, diff[i]))
    const outer = shift(newPoints, d).map(([x, y]): Vector => [x - 0.3, y - 0.3])
    const inner = shift(points, d).reverse().map(([x, y]): Vector => [x + 0.3, y + 0.3])
    const u = [...outer, ...inner].map(vec2mat)
    points = newPoints
    return u
  }

  // const centreOfObject = (vertices: {x: number; y: number}[]) => {
  //   let xMin = Infinity
  //   let xMax = -Infinity
  //   let yMin = Infinity
  //   let yMax = -Infinity

  //   for (let i = 0; i < vertices.length; i++) {
  //     xMin = Math.min(xMin, vertices[i].x)
  //     xMax = Math.max(xMax, vertices[i].x)
  //     yMin = Math.min(yMin, vertices[i].y)
  //     yMax = Math.max(yMax, vertices[i].y)
  //   }

  //   return {
  //     x: (xMax - xMin) / 2 + xMin,
  //     y: (yMax - yMin) / 2 + yMin,
  //   }
  // }

  const reset = () => {
    const ds = s / 2
    points = [
      [-ds, ds],
      [-ds, -ds],
      [ds, -ds],
      [ds, ds],
    ]

    bodies.forEach((b) => {
      World.remove(engine.world, b)
    })
    bodies = []
    const cx = viewport.width / 2
    const cy = viewport.height / 2
    const render = {
      fillStyle: 'transparent',
      strokeStyle: '#444',
      lineWidth: 0.5,
    }

    addBody(Bodies.rectangle(cx, cy, s, s, {
      render,
      isStatic: true,
    }))

    range(14).forEach((_, idx) => {
      const u = getU((idx + 1) % 4)
      const body = Bodies.fromVertices(
        cx - idx * 2, cy - idx * 2,
        [u],
        {
          frictionAir: 0.1,
          friction: 0,
          // isStatic: true,
          render,
        },
        true,
      )
      addBody(body)
    })
  }

  function addBody(body: Matter.Body) {
    bodies.push(body)

    World.add(engine.world, body)
  }

  reset()

  useEventListener('keydown', (e) => {
    if (e.key === 'r')
      reset()
  })

  Runner.run(engine)
  Render.run(render)
})
</script>

<style lang="stylus" scoped>

</style>
