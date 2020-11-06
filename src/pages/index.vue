<script setup lang='ts'>
export { works } from '../works'
export { stringify } from '../utils/stringify'
</script>

<template lang='pug'>
.canvas
  div
    h1.font-mono.mb-2.text-lg 100d.
    pre
      span.text-gray-400 [
      br
      router-link.ml-4.link(v-for='work of works' :key='work.no' :to='`/${work.no}`') {{ stringify({ name: work.name, no: work.no }) }},
      br
      span.text-gray-400 ]
</template>
