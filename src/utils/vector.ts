export type Vector = [number, number]

export const r180 = Math.PI
export const r60 = Math.PI / 3
export const r30 = Math.PI / 6
export const r15 = Math.PI / 12
export const r120 = Math.PI / 3 * 2
export const r360 = Math.PI * 2

export function exclude<T>(arr: T[], v: T) {
  return arr.filter(i => i !== v)
}

export function square(a: number) {
  return a ** 2
}

export function distance([x1, y1]: Vector, [x2, y2]: Vector) {
  return Math.sqrt(square(x1 - x2) + square(y1 - y2))
}

export function get<T>(arr: T[], index: number) {
  return arr[index % arr.length]
}

export function pick<T>(arr: T[], current?: T): T {
  if (current)
    return pick(exclude(arr, current))

  return arr[Math.round(Math.random() * (arr.length - 1))]
}

export function next<T>(arr: T[], current: T): T {
  const index = arr.indexOf(current)
  if (index < 0)
    return pick(arr)
  return get(arr, index + 1)
}
