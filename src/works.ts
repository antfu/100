export const info = [
  {
    name: 'Mess',
    desc: 'Hands on Matter.js',
    date: '2020-11-06',
  },
]

export const works = info.map((info, idx) => {
  return {
    ...info,
    no: `${idx + 1}`.padStart(3, '0'),
  }
})
