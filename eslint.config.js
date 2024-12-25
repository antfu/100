import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  unocss: true,
  vue: true,
})
  .removeRules(
    'unused-imports/no-unused-vars',
  )
