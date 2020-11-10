export const info = [
  {
    name: 'Mass',
    date: '11/06',
  },
  {
    name: 'Hex',
    date: '11/07',
  },
  {
    name: 'Three',
    date: '11/08',
  },
  {
    name: 'Scope',
    date: '11/09',
  },
  {
    name: 'Polar',
    date: '11/10',
  },
  {
    name: 'M & M',
    date: '11/11',
    draft: true,
  },
]

export const works = info.map((info, idx) => {
  return {
    ...info,
    no: `${idx + 1}`.padStart(3, '0'),
  }
})
