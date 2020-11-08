<script setup lang='ts'>
import { useTitle } from '@vueuse/core'
export { works } from '../works'
export { stringify } from '../utils/stringify'

useTitle('100 days')
</script>

<template lang='pug'>
.canvas
  div
    h1.font-mono.mb-2.text-lg 100 days
    pre
      span.text-gray-400 [
      router-link.ml-4.link.block(v-for='work of works' :key='work.no' :to='`/${work.no}`') {{ stringify({ name: work.name, no: work.no }) }},
      span.text-gray-400 ]
    h1.font-mono.mb-2.text-lg.text-gray-300.mt-8 by
      a.ml-2.link(href='https://antfu.me' target='_blank') Anthony Fu
</template>
