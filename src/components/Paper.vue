<template lang='pug'>
.canvas(:class='{shot}')
  .bottom-nav.font-mono.flex(v-if='work')
    div
      span.font-bold {{work.name}}
      span.text-gray-300.ml-1 {{work.no}}
      br
      span.text-gray-400 {{work.desc}}
    .flex-auto
    .flex.flex-col
      .flex-auto
      span.text-gray-300 {{work.date}}
  .nav.font-mono(v-if='!shot')
    router-link.link(to='/') back

  slot(:work='work')
</template>

<script setup lang='ts'>
import { useTitle } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { works } from '../works'

const route = useRoute()
const no = route.path.slice(1)
export const shot = Boolean(route.query.shot)
export const work = works.find(i => i.no === no)

useTitle(work ? `${no}. ${work.name}` : '404')
</script>

<style lang='stylus' scoped>
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

.shot .nav
  padding 24px

.shot .bottom-nav
  padding 20px 24px
</style>
