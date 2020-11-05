<template lang='pug'>
.canvas
  .paper(v-bind='$attrs')
    slot
</template>

<script>
export default {
  inheritAttrs: false,
}
</script>

<style lang='stylus' scoped>
.canvas
  width 100vw
  height 100vh
  display grid
  place-items center

  .paper
    width 400px
    height 400px
    border 1px solid black
</style>
