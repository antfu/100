<template lang='pug'>
paper
  .box.centered.overflow-hidden(ref='box')
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { clamp, useMouse, useRafFn } from '@vueuse/core'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { r180, r90, random, range } from '../utils'

export const box = ref<HTMLElement | null>(null)
const { round } = Math

// Lights
const light_am_color = 0xCCCCCC
const light_spot_color = 0xFFFFFF
const light_spot_intensity = 0.5
const light_spot_position = { x: 10, y: -50, z: 80 }
const light_spot_camera_near = 1

// Plane Properties
const plane_width = 50
const plane_height = 50
const plane_color = 0xFFFFFF

onMounted(async() => {
  const renderer = new THREE.WebGLRenderer()
  box.value!.appendChild(renderer.domElement)
  renderer.physicallyCorrectLights = true
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(400, 400)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const d = 20
  const camera = new THREE.OrthographicCamera(-d, d, d, -d, 1, 1000)
  camera.position.set(0, 0, 40)
  // camera.useQuaternion = true
  camera.lookAt(0, 0, 0)

  // Create the scene
  const scene = new THREE.Scene()

  const loader = new SVGLoader()

  {
    // Add abbient light
    const am_light = new THREE.AmbientLight(light_am_color) // soft white light
    scene.add(am_light)
  }

  {
  // Add directional light
    const light = new THREE.SpotLight(light_spot_color, light_spot_intensity)
    light.position.set(light_spot_position.x, light_spot_position.y, light_spot_position.z)
    light.target = scene
    light.castShadow = true
    light.receiveShadow = true
    light.shadow.camera.near = light_spot_camera_near
    light.shadow.bias = -0.0001
    light.shadow.mapSize.width = 1024 * 4
    light.shadow.mapSize.height = 1024 * 4
    // light.shadow.radius = 10
    scene.add(light)
  }

  {
    // Add the ground plane
    const plane_geometry = new THREE.PlaneGeometry(plane_width, plane_height)
    const plane_material = new THREE.MeshLambertMaterial({ color: plane_color, side: THREE.DoubleSide })
    const plane_mesh = new THREE.Mesh(plane_geometry, plane_material)
    plane_mesh.receiveShadow = true
    scene.add(plane_mesh)
  }

  const trees: THREE.Group[] = []
  const material = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  loader.load('/019-tree.svg', (data) => {
    range(30).forEach(() => {
      const paths = data.paths
      const group = new THREE.Group()
      group.scale.multiplyScalar(0.03 * random(1.1, 0.9))
      group.position.set(random(15, -15), random(15, -15), 0)
      group.rotation.x = -r90

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]

        const shapes = path.toShapes(true)

        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j]
          const geometry = new THREE.ShapeBufferGeometry(shape)
          const mesh = new THREE.Mesh(geometry, material)
          mesh.castShadow = true
          mesh.receiveShadow = true
          mesh.position.y = -150
          group.add(mesh)
        }
      }

      trees.push(group)
      scene.add(group)
    })
  })

  const controls = new OrbitControls(camera, renderer.domElement)

  controls.update()

  const { y } = useMouse()

  // Render loop
  useRafFn(() => {
    const i = clamp((y.value - (window.innerHeight - 400) / 2) / 400, 0, 1)
    const r = r180 + i * r90
    const c = 255 - round(i * 100)
    material.color = new THREE.Color((c << 16) + (c << 8) + c)

    trees.forEach(i => i.rotation.x = r)

    controls.update()

    renderer.render(scene, camera)
  })
})

</script>

<style lang='stylus' scoped>

</style>
