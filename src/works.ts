export const info = [
  {
    name: 'Mass',
    desc: '',
    date: '11/06',
  },
  {
    name: 'Hex',
    desc: '',
    date: '11/07',
  },
  {
    name: 'Three',
    desc: '',
    date: '11/08',
  },
  {
    name: 'Scope',
    desc: '',
    date: '11/09',
  },
  {
    name: 'Polar',
    desc: '',
    date: '11/10',
  },
]

export const works = info.map((info, idx) => {
  return {
    ...info,
    no: `${idx + 1}`.padStart(3, '0'),
  }
})
