<template lang='pug'>
.canvas
  .bottom-nav.font-mono
    span {{work.name}}
    span.text-gray-400.ml-1 {{work.no}}
  .nav.font-mono
    router-link.link(to='/') back

  .paper(v-bind='$attrs')
    slot(:work='work')
</template>

<script setup lang='ts'>
import { useRoute } from 'vue-router'
import { works } from '../works'

const route = useRoute()
export const no = route.path.slice(1)
export const work = works.find(i => i.no === no)

export default {
  inheritAttrs: false,
}
</script>

<style lang='stylus' scoped>
.paper
  width 400px
  height 400px
  border 1px solid black
.nav
  position fixed
  top 0
  left 0
  right 0
  padding 12px
.bottom-nav
  position fixed
  bottom 0
  left 0
  right 0
  padding 8px 12px
</style>
