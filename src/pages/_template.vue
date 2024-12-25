<script setup lang='ts'>
import { onMounted, ref } from 'vue'

const box = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  box.value!.textContent = 'Hello'
})
</script>

<template lang='pug'>
paper
  .box.centered(ref='box')
</template>

<style lang='stylus' scoped>

</style>
