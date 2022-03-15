<template lang='pug'>
.toggle(:class='{active: modelValue}' @click='toggle')
  slot
</template>

<script setup lang='ts'>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: Boolean,
})

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style lang='stylus' scoped>
.toggle
  cursor pointer
  opacity 0.2
  &:hover
    text-decoration underline
  &.active
    opacity 1
</style>
