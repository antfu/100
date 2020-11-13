<template lang='pug'>
.paper(:class='{shot}')
  .bottom-nav.font-mono.flex(v-if='work')
    .nav-links
      router-link.prev.link(v-if='prev' :to='`/${prev.no}`')
        span {{prev.name}}
        span.mx-1.opacity-25 {{prev.no}}
      .current
        span.font-bold {{work.name}}
        span.mx-1.opacity-50 {{work.no}}
      router-link.next.link(v-if='next' :to='`/${next.no}`')
        span {{next.name}}
        span.mx-1.opacity-25 {{next.no}}
    .flex-auto
    .flex.flex-col
      .flex-auto
      span.text-gray-300 {{work.date}}
  .nav.font-mono(v-if='!shot')
    router-link.link.text-xl.block.pt-1(to='/')
      icon(icon='carbon:chevron-left')

  slot(:work='work')
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useEventListener, useFullscreen, useTitle } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { works } from '../works'

export const fullscreen = useFullscreen(ref(document.querySelector('html')))

useEventListener('keydown', (e) => {
  if (document.activeElement === document.body) {
    if (e.key === 'f') {
      if (fullscreen.isFullscreen.value)
        fullscreen.exitFullscreen()
      else
        fullscreen.enterFullscreen()
    }
  }
})

const route = useRoute()
let no = route.path.slice(1)
if (no.startsWith('x'))
  no = no.slice(1)

export const shot = Boolean(route.query.shot)
export const index = works.findIndex(i => i.no === no)

export const work = works[index]
export const prev = works[index - 1]
export const next = works[index + 1]

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

.nav-links
  .next, .prev
    opacity 0
    transition .3s all ease-in-out
    margin-top -1.5em
    display block

.nav-links:hover
  .next, .prev
    opacity 1
    margin-top 0
</style>
