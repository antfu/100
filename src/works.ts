export const info = [
  {
    name: 'Mass',
    date: '11/06',
    draft: false,
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
  },
  {
    name: 'Ship',
    date: '11/12',
  },
  {
    name: 'Negative',
    date: '11/13',
  },
  {
    name: 'Unreproducible',
    date: '11/14',
  },
  {
    name: '方圓',
    date: '11/15',
  },
  {
    name: 'Box',
    date: '11/16',
  },
  {
    name: 'Displace',
    date: '11/17',
  },
  {
    name: 'Plum',
    date: '11/18',
  },
  {
    name: 'Orbit',
    date: '11/19',
  },
  {
    name: 'Rust',
    date: '11/20',
  },
  {
    name: 'Connect',
    date: '11/21',
  },
]

export const works = info.map((info, idx) => {
  return {
    ...info,
    no: `${idx + 1}`.padStart(3, '0'),
  }
})
