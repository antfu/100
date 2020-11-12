<template lang='pug'>
paper(:style='transformStyle')
  .box.rounded-full(ref='box')
    .anchor.overflow-visable.w-0.h-0.fixed
      .text
        p.pt-12 A ship in harbor is safe,<br>but that is not what ships<br>are built for.
        br
        em.text-gray-400 — John A. Shedd

  .box-description.py-3
    .text-gray-400.text-center.tip(v-if='!mobile && !shot') use phone to visit
    .div.p-4(v-if='debug')
      p Gamma {{ gamma }}
      p Beta {{ beta }}
      p Theta {{ theta }}
      p Alpha {{ alpha }}
</template>

<script setup lang='ts'>
import { clamp, useDeviceOrientation } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

export const debug = !!route.query.debug
export const shot = !!route.query.shot
export const { gamma, beta, alpha } = useDeviceOrientation()

export const mobile = computed(() => gamma.value != null && beta.value != null && (gamma.value !== 0 || beta.value !== 0 || alpha.value !== 0))
export const theta = computed(() => {
  if (shot)
    return Math.PI / 2 * 4.55

  if (gamma.value == null || beta.value == null)
    return 0

  const x = clamp(beta.value, -90, 90) / 90
  const y = clamp(-gamma.value, -90, 90) / 90

  return Math.atan2(y, x)
})

export const transformStyle = computed(() => {
  return {
    transform: `rotate(${theta.value}rad)`,
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
