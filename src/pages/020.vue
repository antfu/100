<template lang='pug'>
paper
  .box.overflow-hidden(ref='el')

note
  p drag them, or shake your phone
  br
  a.link(@click='toggleShape') toggle shape
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import Matter from 'matter-js'
import { timestamp } from '@vueuse/core'
// @ts-ignore
import MatterAttractors from 'matter-attractors'
import { useRouteQuery } from '@vueuse/router'
import { hslToRgb, pick, random, range } from '../utils'

const { Engine, Mouse, MouseConstraint, Render, World, Bodies, Events } = Matter
Matter.use(MatterAttractors)

const { sin, cos } = Math

export const el = ref(null)
export const shot = useRouteQuery('shot')
export const debug = useRouteQuery('debug')

interface Ball {hue: number; size: number; body: Matter.Body}

onMounted(async() => {
  const engine = Engine.create()
  const render = Render.create({
    element: el.value!,
    engine,
    options: {
      width: 400,
      height: 400,
      background: 'transparent',
      wireframes: false,
      // @ts-ignore untyped
      showVelocity: debug.value,
      // @ts-ignore untyped
      pixelRatio: 'auto',
    },
  })
  engine.world.gravity.y = 0
  const world = engine.world

  let balls: Ball[] = []

  const createBall = (hue: number, size: number, x = 200, y = 200) => {
    const body = Bodies.circle(x, y, size, {
      frictionAir: 0.1,
      friction: 0,
      render: {
        fillStyle: `rgb(${hslToRgb(hue, 0.6, 0.6).join(',')})`,
        strokeStyle: 'black',
        lineWidth: 0,
      },
    })

    const ball = { body, hue, size }
    balls.push(ball)
    World.add(world, body)

    return ball
  }

  const clone = (ball: Ball) => {
    const r = random(1, -1)
    const hue = ball.hue + random(0.1, -0.1)
    const size = ball.size * random(1.2, 0.8)
    const offset = (ball.size + size) * 0.9
    return createBall(hue, size, ball.body.position.x + offset * sin(r), ball.body.position.y + offset * cos(r))
  }

  const gravity = 5e-6
  World.add(world, Matter.Bodies.circle(200, 200, 0, {
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
  }))

  clone(clone(createBall(random(0.2, 0.6), random(30, 20))))

  if (shot.value) {
    range(100)
      .forEach(() =>
        clone(pick(balls)),
      )
  }

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

  let start = 0
  Events.on(mouseConstraint, 'startdrag', (e) => {
    start = timestamp()
  })

  Events.on(mouseConstraint, 'enddrag', (e) => {
    if (timestamp() - start > 300)
      return
    const body = e.body
    const ball = balls.find(i => i.body === body)
    if (ball) {
      clone(ball)
      cleanup()
    }
  })

  const cleanup = () => {
    balls = balls.filter((b) => {
      const { x, y } = b.body.position
      if (x > -100 && x < 500 && y > -100 && y < 500)
        return true

      World.remove(world, b.body)
      return false
    })
  }

  World.add(world, mouseConstraint)

  // @ts-ignore
  render.mouse = mouse

  // @ts-ignore
  render.element.style.zIndex = -1

  Engine.run(engine)
  Render.run(render)
})
</script>

<style lang="stylus" scoped>

</style>
