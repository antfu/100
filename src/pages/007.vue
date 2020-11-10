<template lang='pug'>
paper
  .box(ref='box')
    .anchor.overflow-visable.w-0.h-0.fixed
      .text(:style='transformStyle') A ship in harbor is safe,<br>but that is not what ships are built for

    p {{theta}} {{transformStyle}} {{ gamma }} {{ beta }}
</template>

<script setup lang='ts'>
import { clamp, useDeviceOrientation } from '@vueuse/core'
import { computed } from 'vue'

export const { gamma, beta } = useDeviceOrientation()

export const theta = computed(() => {
  if (gamma.value == null || beta.value == null)
    return 0

  const orientation = window.orientation
  let x = 0
  let y = 0

  if (orientation === 180) {
    x = clamp(gamma.value, -90, 90) / 90
    y = clamp(-beta.value, -90, 90) / 90
  }
  else if (orientation === 90) {
    x = clamp(beta.value, -90, 90) / 90
    y = clamp(-gamma.value, -90, 90) / 90
  }
  else if (orientation === -90) {
    x = clamp(-beta.value, -90, 90) / 90
    y = clamp(gamma.value, -90, 90) / 90
  }
  else {
    x = clamp(gamma.value, -90, 90) / 90
    y = clamp(beta.value, -90, 90) / 90
  }

  return Math.atan2(y, x)
})

export const transformStyle = computed(() => {
  return {
    transform: `translate(-50%, -50%) rotate(${theta.value}rad)`,
  }
})
</script>

<style lang='stylus' scoped>
.anchor
  left 50%
  top 50%
.text
  width 500px
  text-align center
  transform translate(-50%, -50%)
</style>
