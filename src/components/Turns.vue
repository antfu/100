<script setup lang='ts'>
import type { PropType } from 'vue'
import { get } from '../utils'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue'])
function toggle() {
  const index = props.options.indexOf(props.modelValue) || 0
  emit('update:modelValue', get(props.options, index + 1))
}
</script>

<template lang='pug'>
.turns(:class='{active: modelValue}' @click='toggle') {{modelValue}}
</template>

<style lang='stylus' scoped>
.turns
  opacity 0.5
  &:hover
    text-decoration underline
</style>
