<template lang='pug'>
paper
  .box.overflow-hidden(ref="el" @click='start')

note
  p Day 11 of <a href='https://codecember.netlify.app/2020/11' class="link" target='_blank'>#Codecember</a>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch, watchEffect, withCtx } from 'vue'
import { p5i } from 'p5i'
import type { P5I } from 'p5i'
import { useMouse } from '@vueuse/core'

const size = 400
const spacing = 30
const el = ref<HTMLElement | null>(null)

const {
  mount, unmount, noiseSeed, background, stroke, TAU, CLOSE, cos, sin,
  beginShape, endShape, vertex, push, pop,
  noStroke, fill, createVector, map, random,
  sqrt, abs, min, pow, rect, lerp,
} = p5i()

type Vector3D = [number, number, number]
let vertexes: Vector3D[] = []
let edges: [number, number, number, number][] = []
const count = 500
const depth = 500
const c = 10
const f = 10

function createBox(x = 0, y = 0, z = 0, h = 0, w = 0) {
  const i = vertexes.length

  const h2 = h / 2
  const w2 = w / 2

  const points: Vector3D[] = [
    [-w2, -h2, 0],
    [w2, -h2, 0],
    [w2, h2, 0],
    [-w2, h2, 0],
  ]

  rotate3D(2.5 * random(-1, 1), -0.5 * random(-1, 1), -0.3 * random(-1, 1), points)
  points.forEach((p) => {
    p[0] += x
    p[1] += y
    p[2] += z
  })
  vertexes.push(...points)
  pushEdge(i, i + 1)
  pushEdge(i + 1, i + 2)
  pushEdge(i + 2, i + 3)
  pushEdge(i + 3, i)
}

function pushEdge(i: number, j: number) {
  const a = vertexes[i]
  const b = vertexes[j]
  const d = distance(a, b) * 15

  edges.push([i, j, d, 0])
}

function rotate3D(pitch: number, roll: number, yaw: number, points: Vector3D[]) {
  const cosa = Math.cos(yaw)
  const sina = Math.sin(yaw)

  const cosb = Math.cos(pitch)
  const sinb = Math.sin(pitch)

  const cosc = Math.cos(roll)
  const sinc = Math.sin(roll)

  const Axx = cosa * cosb
  const Axy = cosa * sinb * sinc - sina * cosc
  const Axz = cosa * sinb * cosc + sina * sinc

  const Ayx = sina * cosb
  const Ayy = sina * sinb * sinc + cosa * cosc
  const Ayz = sina * sinb * cosc - cosa * sinc

  const Azx = -sinb
  const Azy = cosb * sinc
  const Azz = cosb * cosc

  for (const point of points) {
    const px = point[0]
    const py = point[1]
    const pz = point[2]

    point[0] = Axx * px + Axy * py + Axz * pz
    point[1] = Ayx * px + Ayy * py + Ayz * pz
    point[2] = Azx * px + Azy * py + Azz * pz
  }
}

function setup({ createCanvas }: P5I) {
  createCanvas(400, 400)
  background(0)
  stroke(255, 255, 255, 10)

  vertexes = []
  edges = []
  for (let j = 0; j < 30; j += 1) {
    const bx = random(-10, 300)
    const by = random(-10, 300)
    const bz = random(-50, -10)
    const min = random(5, 10)
    const max = random(min + 10, 60)
    const aspect = random(0.2, 2)
    const sx = random(-20, 30)
    const sy = random(-20, 30)
    for (let i = 0; i < 15; i += 1) {
      const w = random(min, max)
      createBox(bx + i * sx, by + i * sy, bz + i * 5, w, w * aspect * cos(i / 10))
    }
  }
}

function draw({ noLoop, frameCount }: P5I) {
  plot()
}

function distance(a: Vector3D, b: Vector3D) {
  return sqrt(pow(a[0] - b[0], 2) + pow(a[1] - b[1], 2) + pow(a[2] - b[2], 2))
}

function lerp3D(a: Vector3D, b: Vector3D, t: number) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ]
}

function randomSphere(r: number) {
  const rad = random(TAU)
  const l = random(r)

  return [cos(rad) * l, sin(rad) * l]
}

function plot() {
  for (const edge of edges) {
    const [ia, ib, dis, i] = edge
    if (i > dis)
      continue

    edge[3] += 1

    const a = vertexes[ia]
    const b = vertexes[ib]

    const n = lerp3D(a, b, random())
    const d = abs(n[2] - c)
    stroke(255, 255, 255, (1 - min(d / depth * 8, 0.95)) * 20)
    const r = 0.3 * pow(abs(f - d), 0.9)
    const [x, y] = randomSphere(r)
    rect(x + n[0], y + n[1], 0.01, 0.01)
  }
}

function start() {
  mount(el.value!, { setup, draw })
}

onMounted(start)
onUnmounted(() => unmount())
</script>
