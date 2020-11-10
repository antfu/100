<template lang='pug'>
paper
  .box(ref='box')
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'

export const box = ref<HTMLDivElement | null>(null)

onMounted(async() => {
  box.value!.textContent = 'Hello'
})
</script>

<style lang='stylus' scoped>

</style>
