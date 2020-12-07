import { clamp } from '@vueuse/core'

export type ColorVector = [number, number, number]

export function hexToRgb(hex: string): ColorVector {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ]
}

export function toHex(c: number) {
  return c.toString(16).padStart(2, '0')
}

export function rgbToHex(r = 0, g = 0, b = 0) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * @param vectors
 * @param num 0~1
 */
export function colorInterpration(vectors: ColorVector[], n: number) {
  if (n >= 1)
    return vectors[vectors.length - 1]

  const normalized = clamp(n, 0, 1) * (vectors.length - 1)
  const integer = Math.trunc(normalized)
  const frac = normalized - integer
  const nfrac = 1 - frac

  const [a1, a2, a3] = vectors[integer]
  const [b1, b2, b3] = vectors[integer + 1]

  return [
    a1 * nfrac + b1 * frac,
    a2 * nfrac + b2 * frac,
    a3 * nfrac + b3 * frac,
  ]
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  }
  else {
    const hue2rgb = function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}
