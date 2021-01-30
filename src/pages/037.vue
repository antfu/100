<template lang='pug'>
paper
  .box.borderless.centered(ref='box' :style='style')
    img.select-none(src='/037.svg')
    img.fixed.top-0.left-0(
      src='/037.svg' ref='el'
      style='opacity: 0.9; transform: matrix(0.998506, -0.0546418, 0.0546418, 0.998506, 0, 0) rotate(1.50557deg); left: -2px; top: 1px;'
    )

note
  p Reproduce of an art device in the <a href="https://www.area-arch.it/en/audio-architecture" target="_blank">AUDIO ARCHITECTURE</a> exhibition.
</template>

<script setup lang='ts'>
import { useMouse } from '@vueuse/core'
import { ref, onMounted, computed } from 'vue'
import Moveable from 'moveable'

const el = ref<HTMLDivElement | null>(null)
const box = ref<HTMLDivElement | null>(null)

const { sourceType } = useMouse()

const style = computed(() => ({ '--rotation-show': sourceType.value === 'mouse' ? 'block' : 'none' }))

onMounted(() => {
  const target = el.value!
  const moveable = new Moveable(box.value!, {
    target,
    container: document.body,
    draggable: true,
    rotatable: true,
    pinchable: true,
    origin: false,
    rotationPosition: 'right',
    keepRatio: true,
  })

  /* draggable */
  moveable
    .on('drag', ({ target, left, top }) => {
      target!.style.left = `${left}px`
      target!.style.top = `${top}px`
    })

  /* rotatable */
  moveable.on('rotate', ({ target, transform }) => {
    target!.style.transform = transform
  })
})
</script>

<style lang='stylus' scoped>
img {
  height: 400px;
  width: 400px;
}
</style>

<style>
.moveable-control-box {
  --moveable-color: #444 !important;
}

.moveable-line {
  width: 0 !important;
}

.moveable-rotation-control {
  cursor: grab !important;
  background: transparent !important;
  display: var(--rotation-show) !important;
}
</style>
