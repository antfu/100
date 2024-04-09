<template lang='pug'>
paper
  .box.borderless.z-10(@click='next')
  #day32(ref='el')
  .box-description(v-show='!shot')
    .flex.mt-6
      p.text-gray-400 (t,i,x,y) =>
      input.flex-auto.outline-none.ml-2.bg-transparent(
        v-model='expression'
        maxlength='32'
        autocomplete='false'
        spellcheck='false'
      )
    p.text-gray-400(:class='{"opacity-0": !author}') by <a :href='`https://twitter.com/${author}`' target='_blank'>@{{author}}</a>
    iframe.none.h-0(ref='runner' sandbox='allow-same-origin')

note
  p <b>z = tixy</b>
  br
  p Day 7 of <a href='https://codecember.netlify.app/2020/7' class="link" target='_blank'>#Codecember</a>
  br
  p another port from <a href='https://tixy.land/' target='_blank'>tixy.land</a>
  br
  p <b>t</b>&nbsp;&nbsp;&nbsp;&nbsp; time passed in seconds
  p <b>i</b>&nbsp;&nbsp;&nbsp;&nbsp; 1 -> 144
  p <b>x, y</b> &nbsp;1 -> 12
  br
  p return value -> <b>z axis</b> of the boxes
  p null and error will make box invisiable
  br
  p <del>Math.</del> can be omitted
  p <b>2 * t</b> can be written as <b>2t</b>
  p link is sharable
  br
  p 👇🏼 add your formulas!
</template>

<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { noop, timestamp, useRafFn, useThrottle } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import * as THREE from 'three'
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { get, r90, range, shuffle } from '../utils'

const presets = shuffle([
  { code: 'sin(t + x + y)', by: '' },
  { code: 'sin(t) * 0.75x' },
  { code: 'random() * 2 - 1' },
  { code: 'x * y * sin(t)' },
  { code: 'tan(t+x)' },
  { code: 'tan(t+x)*y' },
  { code: '((x-6.5)**2+(y-6.5)**2)*sin(t)' },
  { code: 'tan(x)*tan(y)*sin(t)' },

  // community
  // { code: '', by: 'twitter_id' },
])

const author = computed(() =>
  presets.find(i => i.code === expression.value)?.by,
)

const el = ref<HTMLElement | null>(null)

const debug = useRouteQuery('debug')
const shot = useRouteQuery('shot')

const expression = useRouteQuery<string>('q', '')

const MathContext = `const {${Object.getOwnPropertyNames(Math).join(',')}}=Math`

const thorrtled = useThrottle(expression, 500)

const runner = ref<HTMLIFrameElement | null>(null)

const { sin, sqrt } = Math

let fn = (t: number, i: number, x: number, y: number) => 1

const f = {
  reset: noop,
}

let expressionIndex = -1
const next = () => {
  expressionIndex += 1
  const { code } = get(presets, expressionIndex)
  expression.value = code
}

if (!expression.value)
  next()

onMounted(async() => {
  function createMesh(geometry: THREE.Geometry, solid = true) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      polygonOffset: true,
      polygonOffsetFactor: 1, // positive value pushes polygon further away
      polygonOffsetUnits: 1,
    })
    const mesh = new THREE.Mesh(geometry, material)

    const wireframeGeometry = new THREE.EdgesGeometry(geometry)
    // material
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 1,
    })
    // mesh
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
    mesh.add(wireframe)

    if (solid)
      return mesh
    else
      return wireframe
  }

  const scene = new THREE.Scene()
  const width = 1200
  const height = 1200

  // CAMERA
  const aspect = 1
  const d = 18
  const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000)
  if (debug.value)
    camera.position.set(d, d, d)
  else
    camera.position.set(0, 0, d)

  camera.lookAt(scene.position)

  const renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  el.value!.appendChild(renderer.domElement)
  renderer.setClearColor(0x000000, 0)

  // const controls = new OrbitControls(camera, renderer.domElement)
  // controls.update()

  const size = 0.4
  const edges = 12
  const boxes = range(edges)
    .map(y =>
      range(edges)
        .map((x) => {
          const box = createMesh(new THREE.BoxGeometry(size, size, size))
          scene.add(box)

          box.position.x = size * (x - (edges - 1) / 2)
          box.position.y = size * (y - (edges - 1) / 2)

          return box
        }),
    )

  let ts = timestamp()

  f.reset = () => {
    ts = timestamp()
  }

  useRafFn(() => {
    const t = (timestamp() - ts) / 1000

    range(edges)
      .forEach(y =>
        range(edges)
          .forEach((x) => {
            const box = boxes[y][x]
            let v = NaN
            try {
              v = +fn(t, y * edges + x + 1, x + 1, y + 1)
            }
            catch (e) {}
            if (isNaN(v)) {
              box.visible = false
            }
            else {
              box.visible = true
              box.position.z = v
            }
          }))

    renderer.render(scene, camera)
  })

  watch(
    thorrtled,
    (exp, prev) => {
      // stop()
      fn = () => 0

      try {
        // eslint-disable-next-line no-eval
        // @ts-ignore
        fn = runner.value!.contentWindow!.eval(`()=>{
          ${MathContext};
          return (t,i,x,y) => {
            return ${exp.replace(/(\d+)([a-zA-Z]+)/g, (_, n, x) => `${n} * ${x}`)}
          }
        }`)()
        f.reset()
      }
      catch (e) {
      }
    },
    { immediate: true },
  )
})
</script>

<style lang='stylus'>
#day32 canvas
  position fixed
  top 50%
  left 50%
  transform translate(-50%, -50%)
</style>
