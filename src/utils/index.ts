export * from './load'
export * from './stringify'
export * from './vector'
export * from './canvas'

export function shuffle<T>(arr: T[]): T[] {
  const array = arr.slice(0)
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function range(to: number) {
  return new Array(to).fill(0).map((_, i) => i)
}
