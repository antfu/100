<template lang='pug'>
.canvas
  div
    h1.font-mono.mb-2.text-lg 100d.
    pre
      span.text-gray-400 [
      br
      router-link.ml-4.link(v-for='work of works' :key='work.no' :to='`/${work.no}`') {{ str(work) }},
      br
      span.text-gray-400 ]
</template>

<script setup lang='ts'>
export { works } from '../works'

export function str(obj: any) {
  return JSON.stringify(obj)
    .replace(/"/g, '\'')
    .replace(/:/g, ': ')
    .replace(/{/g, '{ ')
    .replace(/}/g, ' }')
    .replace(/,/g, ', ')
    .replace(/'(\w+?)':/g, '$1:')
    .replace(/'(\d+?)'/g, '$1')
}
</script>
