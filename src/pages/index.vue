<script setup lang='ts'>
import { useTitle } from '@vueuse/core'
import { works } from '../works'
import { stringify } from '../utils/stringify'
import { useRoute } from 'vue-router'
import { isDark, toggleDark } from '../utils/dark'

const avaliable_works = works.filter(i => !i.draft)

useTitle('100 days')
</script>

<template lang='pug'>
.paper
  .centered.index-page
    h1.font-mono.mb-2.text-lg.font-bold.mb-4 100 days
    pre.grid.gap-x-4.gap-y-1(class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")
      router-link.link.block.mr-4(v-for='work of avaliable_works' :key='work.no' :to='`/${work.no}`')
        span.mr-2.opacity-50 {{ work.no }}
        b {{ work.name }}
    h1.font-mono.mb-2.mt-8
      a.link(href='https://antfu.me' target='_blank') @antfu
      span.mx-1.op75 .
      a.link(href='https://twitter.com/antfu7/status/1325977074813739009' target='_blank') twitter
      span.mx-1.op75 .
      a.link(href='https://github.com/antfu/100' target='_blank') github
      span.mx-1.op75 .
      a.link(href='https://codecember.netlify.app' target='_blank') codecember
      span.mx-1.op75 .
      button.link(@click="toggleDark()") {{ isDark ? 'dark' : 'light' }}
      br
      span.text-gray-300 from 2020/11/06
</template>
