export const info = [
  {
    name: 'Mass',
    date: '2020/11/06',
    draft: false,
  },
  {
    name: 'Hex',
    date: '2020/11/07',
  },
  {
    name: 'Three',
    date: '2020/11/08',
  },
  {
    name: 'Scope',
    date: '2020/11/09',
  },
  {
    name: 'Polar',
    date: '2020/11/10',
  },
  {
    name: 'M & M',
    date: '2020/11/11',
  },
  {
    name: 'Ship',
    date: '2020/11/12',
  },
  {
    name: 'Negative',
    date: '2020/11/13',
  },
  {
    name: 'Unreproducible',
    date: '2020/11/14',
  },
  {
    name: '方圓',
    date: '2020/11/15',
  },
  {
    name: 'Box',
    date: '2020/11/16',
  },
  {
    name: 'Displace',
    date: '2020/11/17',
  },
  {
    name: 'Plum',
    date: '2020/11/18',
  },
  {
    name: 'Orbit',
    date: '2020/11/19',
  },
  {
    name: 'Rust',
    date: '2020/11/20',
  },
  {
    name: 'Connect',
    date: '2020/11/21',
  },
  {
    name: 'Gravity',
    date: '2020/11/22',
  },
  {
    name: 'Field 1',
    date: '2020/11/23',
  },
  {
    name: 'Fractal 1',
    date: '2020/11/24',
  },
  {
    name: 'Clone',
    date: '2020/11/25',
  },
  {
    name: 'Cross',
    date: '2020/11/26',
  },
  {
    name: 'ㄇㄈㄩコロ',
    date: '2020/11/27',
  },
  {
    name: 'Knitting',
    date: '2020/11/28',
  },
  {
    name: 'Cast',
    date: '2020/11/30',
  },
  {
    name: 'Kaleidoscope',
    date: '2020/12/01',
  },
  {
    name: 'Lines',
    date: '2020/12/02',
  },
  {
    name: 'Flat',
    date: '2020/12/03',
  },
  {
    name: 'Joy',
    date: '2020/12/04',
  },
  {
    name: 'Attractor',
    date: '2020/12/05',
  },
  {
    name: 'River',
    date: '2020/12/06',
  },
  {
    name: 'Arc',
    date: '2020/12/07',
  },
  {
    name: 'z = tixy',
    date: '2020/12/08',
  },
  {
    name: 'Glass',
    date: '2020/12/15',
  },
  {
    name: 'Moiré',
    date: '2020/12/15',
  },
  {
    name: 'Window',
    date: '2020/12/15',
  },
  {
    name: 'Arch 1',
    date: '2021/01/30',
  },
  {
    name: 'Arch 2',
    date: '2021/01/30',
  },
  {
    name: 'Boxes',
    date: '2020/12/06',
  },
  {
    name: 'Dots',
    date: '2020/12/06',
  },
]

export const works = info.map((info, idx) => {
  return {
    ...info,
    no: `${idx + 1}`.padStart(3, '0'),
  }
})
