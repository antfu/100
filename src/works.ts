export const info = [
  {
    name: 'Mess',
    desc: '',
    date: '11/06',
  },
  {
    name: 'Hex',
    desc: '',
    date: '11/07',
  },
]

export const works = info.map((info, idx) => {
  return {
    ...info,
    no: `${idx + 1}`.padStart(3, '0'),
  }
})
