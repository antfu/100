<script setup lang='ts'>
import { useTitle } from '@vueuse/core'
import { works } from '../works'
import { stringify } from '../utils/stringify'

const avaliable_works = works.filter(i => !i.draft)

useTitle('100 days')
</script>

<template lang='pug'>
.paper
  .centered
    h1.font-mono.mb-2.text-lg 100 days
    pre
      span.text-gray-400 [
      router-link.ml-4.link.block(v-for='work of avaliable_works' :key='work.no' :to='`/${work.no}`') {{ stringify({ name: work.name, no: work.no }) }},
      span.text-gray-400 ]
    h1.font-mono.mb-2.text-gray-300.mt-8 // by
      a.ml-2.link(href='https://antfu.me' target='_blank') Anthony Fu
      br
      span // from Nov. 6th, 2020
      br
      span // updates on <a href='https://twitter.com/antfu7/status/1325977074813739009' target='_blank' class='link'>twitter</a>
      span // source on <a href='https://github.com/antfu/100' target='_blank' class='link'>github</a>
</template>
