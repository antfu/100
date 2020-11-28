<template lang='pug'>
paper
  .large.box.borderless.centered.overflow-hidden(ref='el')
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { timestamp, useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import * as THREE from 'three'
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { r90 } from '../utils'

const el = ref<HTMLElement | null>(null)

const debug = useRouteQuery('debug')

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

  function createTripod(size = 10) {
    // https://threejsfundamentals.org/threejs/lessons/threejs-custom-geometry.html

    const h = size / 2
    const geometry = new THREE.Geometry()
    geometry.vertices.push(
      new THREE.Vector3(-h, -h, h), // 0
      new THREE.Vector3(h, -h, h), // h
      new THREE.Vector3(-h, h, h), // 2
      new THREE.Vector3(h, h, h), // 3
      new THREE.Vector3(-h, -h, -h), // 4
      new THREE.Vector3(h, -h, -h), // 5
    )

    /*
       6----7
      /|   /|
     2----3 |
     | |  | |
     | 4--|-5
     |/   |/
     0----1
    */

    geometry.faces.push(
      // front
      new THREE.Face3(0, 3, 2),
      new THREE.Face3(0, 1, 3),
      // bottom
      new THREE.Face3(4, 1, 0),
      new THREE.Face3(4, 5, 1),
      // top
      new THREE.Face3(2, 5, 4),
      new THREE.Face3(2, 3, 5),

      // side
      new THREE.Face3(3, 1, 5),
      new THREE.Face3(0, 2, 4),
    )

    geometry.computeFaceNormals()

    return geometry
  }

  const scene = new THREE.Scene()
  const width = 800
  const height = 800

  // CAMERA
  const aspect = 1
  const d = 10
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000)
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

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.update()

  const box = createMesh(new THREE.BoxGeometry(10, 10, 10), false)
  const cylinder = createMesh(new THREE.CylinderGeometry(5, 5, 10, 1000))
  const tri = createMesh(createTripod(10), false)
  scene.add(box)
  scene.add(cylinder)
  scene.add(tri)

  const effect = new OutlineEffect(renderer, {
    defaultThickness: 0.001,
    defaultColor: [0, 0, 0],
    defaultAlpha: 1,
    defaultKeepAlive: true,
  })

  const duration = 3000
  const animation = 2000
  const ts = timestamp() - (duration * 2 + animation)

  useRafFn(() => {
    const t = timestamp() - ts

    const r = Math.min(t % duration / animation, 1) * r90
    const turn = Math.floor(t % (duration * 3) / duration)

    if (turn === 0) {
      cylinder.visible = false
      tri.visible = false
      box.rotation.x = r
      box.rotation.z = r
      box.visible = true
    }
    else if (turn === 2) {
      cylinder.visible = false
      box.visible = false
      tri.rotation.x = r90 - r
      tri.rotation.z = r
      tri.visible = true
    }
    else {
      box.visible = false
      tri.visible = false
      cylinder.rotation.x = r
      cylinder.rotation.z = -r
      cylinder.visible = true
    }

    effect.render(scene, camera)
  })
})

</script>

<style lang='stylus' scoped>

</style>
