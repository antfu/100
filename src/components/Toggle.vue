<script setup lang='ts'>
const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue'])
function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template lang='pug'>
.toggle(:class='{active: modelValue}' @click='toggle')
  slot
</template>

<style lang='stylus' scoped>
.toggle
  cursor pointer
  opacity 0.2
  &:hover
    text-decoration underline
  &.active
    opacity 1
</style>
