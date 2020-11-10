<template lang='pug'>
paper(:style='transformStyle')
  div
    .box.rounded-full(ref='box')
      .anchor.overflow-visable.w-0.h-0.fixed
        .text
          p.pt-12 A ship in harbor is safe,<br>but that is not what ships<br>are built for.
          br
          em.text-gray-400 — John A. Shedd

      .div.p-4(v-if='debug')
        p Gamma {{ gamma }}
        p Beta {{ beta }}
        p Theta {{theta}}
    .text-gray-400.text-center.fixed.tip(v-if='!mobile') use phone to visit
</template>

<script setup lang='ts'>
import { clamp, useDeviceOrientation } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

export const debug = !!route.query.debug
export const { gamma, beta } = useDeviceOrientation()

export const mobile = computed(() => gamma.value != null && beta.value != null && gamma.value !== 0 && beta.value !== 0)
export const theta = computed(() => {
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

.tip
  top calc(50% + 220px)
  left 50%
  transform translate(-50%, -50%)
</style>
