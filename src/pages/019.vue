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
import { r90, random, range } from '../utils'

export const box = ref<HTMLElement | null>(null)

const camera_focal = 50
const camera_near = 0.1
const camera_far = 50

// Lights
const light_am_color = 0xCCCCCC
const light_spot_color = 0xFFFFFF
const light_spot_intensity = 10
const light_spot_position = { x: 0, y: 20, z: 8 }
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

  const camera = new THREE.PerspectiveCamera(camera_focal, 1, camera_near, camera_far)
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
    const spot_light = new THREE.SpotLight(light_spot_color, light_spot_intensity)
    spot_light.position.set(light_spot_position.x, light_spot_position.y, light_spot_position.z)
    spot_light.target = scene
    spot_light.castShadow = true
    spot_light.receiveShadow = true
    spot_light.shadowCameraNear = light_spot_camera_near
    scene.add(spot_light)
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

  loader.load('/019-tree.svg', (data) => {
    range(30).forEach(() => {
      const paths = data.paths
      const group = new THREE.Group()
      group.scale.multiplyScalar(0.03)
      group.position.set(random(15, -15), random(15, -15), 0)
      group.rotation.x = -r90

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]

        const material = new THREE.MeshLambertMaterial({
          color: 0xFFFFFF,
          side: THREE.DoubleSide,
          depthWrite: false,
        })

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
    const r = clamp((y.value - (window.innerHeight - 400) / 2) / 400, 0, 1.5) * -r90

    trees.forEach(i => i.rotation.x = r)

    controls.update()

    renderer.render(scene, camera)
  })
})

</script>

<style lang='stylus' scoped>

</style>
