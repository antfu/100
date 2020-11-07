<template lang='pug'>
.turns(:class='{active: modelValue}' @click='toggle') {{modelValue}}
</template>

<script setup='props, {emit}' lang='ts'>
import { get } from '../utils'

declare const props: {
  modelValue: string
  options: string[]
}

declare const emit: (key: string, v: any) => {}

export const toggle = () => {
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
