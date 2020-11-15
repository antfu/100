<template lang='pug'>
paper
  .large.box.borderless.centered.overflow-hidden(ref='el')
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { timestamp, useRafFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import * as THREE from 'three'

export const el = ref<HTMLElement | null>(null)

export const debug = useRouteQuery('debug')

onMounted(async() => {
  function createMesh(geometry: THREE.Geometry) {
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
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

    return mesh
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

  const renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  el.value!.appendChild(renderer.domElement)
  renderer.setClearColor(0xFFFFFF, 1)

  // const box = createMesh(new THREE.BoxGeometry(10, 10, 10))
  const box = createMesh(new THREE.CylinderGeometry(5, 5, 10, 1000))
  scene.add(box)

  useRafFn(() => {
    const t = timestamp()

    box.rotation.x = t / 1000
    box.rotation.z = t / 1000

    renderer.render(scene, camera)
  })
})

</script>

<style lang='stylus' scoped>

</style>
