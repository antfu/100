<template lang='pug'>
paper
  playground-x(ref='playground' v-model:x='expX' v-model:y='expY' :iterations='speed')
  .box-description.py-1(v-if='!shot')
    turns.inline-block.mr-2(v-model='speedLevel' :options='speeds')

note
  p x = x + (random() - 0.5) * 8
  p y = y + (random() - 0.5) * 8
  br
  a.link(@click='playground.f.start()') restart
</template>

<script setup='props' lang='ts'>
import { useRouteQuery } from '@vueuse/router'
import { computed, ref } from 'vue'

const playground = ref(null)

const expX = 'x + (random() - 0.5) * 8'
const expY = 'y + (random() - 0.5) * 8'

const shot = useRouteQuery('shot')

const speeds = ['x0.5', 'x1', 'x5', 'x10']
const speedLevel = ref(shot.value ? 'x5' : 'x1')

const speed = computed(() => {
  if (speedLevel.value === 'x0.5')
    return 4
  else if (speedLevel.value === 'x5')
    return 50
  else if (speedLevel.value === 'x10')
    return 100
  return 10
})
</script>
