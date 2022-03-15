<template lang='pug'>
paper
  .box.overflow-hidden(ref='el')

note
  template(v-if='!seenEgg')
    p it's not always perfect to make clones.
  template(v-else)
    p <b>Congrats!</b>
    p It's our pet goldfish drew by my girlfriend <a href="https://twitter.com/iiiiiiines_____" target='_blank'>Inès</a>. Hope you had fun with this little game and you can definitely show off a bit on Twitter :)
    p.text-gray-400 (let me know by pinning @antfu7)
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import Matter from 'matter-js'
import { clamp, timestamp } from '@vueuse/core'
// @ts-expect-error missing types
import MatterAttractors from 'matter-attractors'
import { useRouteQuery } from '@vueuse/router'
import { hslToRgb, pick, random, range } from '../utils'

const { Engine, Mouse, MouseConstraint, Render, World, Bodies, Events, Runner } = Matter
Matter.use(MatterAttractors)

const { sin, cos, max, round } = Math

const el = ref(null)
const shot = useRouteQuery('shot')
const debug = useRouteQuery('debug')

interface Ball {
  hue: number
  size: number
  body: Matter.Body
  roundness: number
  edges: number
  isEgg?: boolean
}

const seenEgg = ref(false)

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
      // @ts-expect-error untyped
      showVelocity: debug.value,
      // @ts-expect-error untyped
      pixelRatio: 'auto',
    },
  })
  engine.world.gravity.y = 0
  const world = engine.world

  let balls: Ball[] = []

  const createBall = (hue: number, size: number, roundness = 0.1, edges = 5, x = 200, y = 200, isEgg = false) => {
    isEgg = isEgg || ((hue <= 0.02 || hue >= 0.99) && roundness > 0.7)

    const options: any = {
      frictionAir: 0.1,
      friction: 0,
      render: {
        fillStyle: `rgb(${hslToRgb(hue, 0.6, 0.6).join(',')})`,
        strokeStyle: 'white',
        lineWidth: 2,
      },
    }

    if (isEgg) {
      options.render.sprite = {
        texture: '/020-goldfish.png',
        xScale: (size / 200) * 0.9,
        yScale: (size / 200) * 0.9,
      }
    }

    const body = (roundness >= 0.7 || isEgg)
      ? Bodies.circle(x, y, size, options)
      : Bodies.polygon(x, y, edges, size, {
        chamfer: { radius: range(edges).map(i => roundness * size) },
        ...options,
      })

    const ball = { body, hue, size, roundness, edges, isEgg }
    balls.push(ball)
    World.add(world, body)

    if (!seenEgg.value && isEgg) {
      setTimeout(() => {
        alert('Congarts on finding the easter egg! 🎉 \nThanks for playing!')
      }, 800)
      seenEgg.value = true
    }

    return ball
  }

  const clone = (ball: Ball) => {
    const r = random(1, -1)
    let hue = ball.hue + random(0.07, -0.07)
    if (hue < 0)
      hue += 1
    if (hue > 1)
      hue -= 1

    const size = ball.size <= 20 ? ball.size * random(1.2, 1) : max(ball.size * random(1.2, 0.8), 20)
    const offset = (ball.size + size) * 0.9
    const roundness = clamp(ball.roundness + random(0.2, -0.2), 0, 0.75)
    let edges = ball.edges
    if (roundness >= 0.75)
      edges = clamp(round(edges * random(2, -2)), 3, 7)

    return createBall(
      hue,
      size,
      roundness,
      edges,
      ball.body.position.x + offset * sin(r),
      ball.body.position.y + offset * cos(r),
      ball.isEgg,
    )
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
    // @ts-expect-error anyway
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

  function cleanup() {
    balls = balls.filter((b) => {
      const { x, y } = b.body.position
      if (x > -100 && x < 500 && y > -100 && y < 500)
        return true

      World.remove(world, b.body)
      return false
    })
  }

  World.add(world, mouseConstraint)

  render.mouse = mouse
  render.element.style.zIndex = '-1'

  Runner.run(engine)
  Render.run(render)
})
</script>

<style lang="stylus" scoped>

</style>
