<template lang='pug'>
paper
  .not-found.box(ref='box')
  .not-found.text Not Found
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'

const box = ref<HTMLDivElement | null>(null)

onMounted(() => {
  let count = 25

  let el = box.value!

  while (count > 0) {
    const newEl = document.createElement('div')
    newEl.classList.add('box')
    el.appendChild(newEl)
    el = newEl
    count--
  }
})
</script>

<style lang='stylus'>
.not-found.box .box
  transform scale(0.85) rotate(-9deg)
  opacity 0.9

.not-found.text
  position fixed
  top 50%
  left 50%
  transform translate(-50%, -50%)
</style>
