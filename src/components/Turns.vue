<template lang='pug'>
.turns(:class='{active: modelValue}' @click='toggle') {{modelValue}}
</template>

<script setup lang='ts'>
import { defineEmit, defineProps } from 'vue'
import type { PropType } from 'vue'
import { get } from '../utils'

const emit = defineEmit(['update:modelValue'])
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

const toggle = () => {
  const index = props.options.indexOf(props.modelValue) || 0
  emit('update:modelValue', get(props.options, index + 1))
}
</script>

<style lang='stylus' scoped>
.turns
  opacity 0.5
  &:hover
    text-decoration underline
</style>
