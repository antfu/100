<template lang='pug'>
.toggle(:class='{active: modelValue}' @click='toggle')
  slot
</template>

<script setup='props, {emit}' lang='ts'>
declare const props: {
  modelValue: boolean
}

declare const emit: (key: string, v: any) => {}

export const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style lang='stylus' scoped>
.toggle
  opacity 0.2
  &.active
    opacity 1
</style>
