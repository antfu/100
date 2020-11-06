export const names = [
  'Hello',
]

export const works = names.map((name, idx) => {
  return {
    name,
    no: `${idx + 1}`.padStart(3, '0'),
  }
})
