export function stringify(obj: any) {
  return JSON.stringify(obj)
    .replace(/"/g, '\'')
    .replace(/:/g, ': ')
    .replace(/{/g, '{ ')
    .replace(/}/g, ' }')
    .replace(/,/g, ', ')
    .replace(/'(\w+?)':/g, '$1:')
    .replace(/'(\d+?)'/g, '$1')
}
