import type {Color} from '@deck.gl/core';

export function deckColorToGl(color: Color): [number, number, number, number] {
  return [color[0] / 255, color[1] / 255, color[2] / 255, (color[3] ?? 255) / 255];
}

export function paletteColorToGl(color: [number, number, number, number]): [number, number, number, number] {
  return [color[0], color[1], color[2], color[3] * 255];
}

/**
 * Parses an `rgb(r, g, b)` or `rgba(r, g, b, a)` CSS string into a
 * `[r, g, b, a]` tuple with all channels in the 0–255 range (deck.gl format).
 * Alpha in the input is expected in 0–1 and is scaled to 0–255. Returns null
 * for inputs that cannot be parsed.
 */
export function rgbaStringToArray(input: unknown): [number, number, number, number] | null {
  if (typeof input !== 'string') {
    return null
  }
  const match = input.match(/^\s*rgba?\s*\(\s*([^)]+)\)\s*$/i)
  if (!match) {
    return null
  }
  const parts = match[1].split(',').map((p) => p.trim())
  if (parts.length < 3 || parts.length > 4) {
    return null
  }
  const r = parseInt(parts[0], 10)
  const g = parseInt(parts[1], 10)
  const b = parseInt(parts[2], 10)
  const a = parts.length === 4 ? Math.round(parseFloat(parts[3]) * 255) : 255
  if ([r, g, b, a].some((n) => Number.isNaN(n))) {
    return null
  }
  return [r, g, b, a]
}