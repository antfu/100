<template lang='pug'>
.note(:class='{active}')
  .handle.fixed.border.border-gray-200.text-center.p-2.text-gray-400(@click='active=true') ?
  .modal-bg.bg-black.fixed.top-0.left-0.right-0.bottom-0(@click='active=false')
  .content.border.border-gray-200.p-8.fixed.bottom-0.bg-white.shadow
    slot Hello
</template>

<script setup lang='ts'>
import { ref } from 'vue'

export const active = ref(false)
</script>

<style lang='stylus' scoped>
.note
  .handle
    left calc(50% - 20px)
    width 40px
    height 40px
    bottom -2px

  .content
    pointer-events none
    left calc(50% - 250px)
    width 500px
    min-height 300px
    transform translateY(110%)
    transition 0.3s all ease-in-out

  .modal-bg
    pointer-events none
    opacity 0
    transition 0.2s opacity ease-in-out

.note.active
  .content
    display block
    transform none
    pointer-events auto
  .modal-bg
    opacity 0.2
    pointer-events auto
</style>
