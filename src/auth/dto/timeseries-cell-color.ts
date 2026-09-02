export const TIMESERIES_CELL_COLOR_FALLBACK = {
  background: 'transparent',
  text: '#111111',
} as const

export type TimeseriesCellColor = {
  background: string
  text: string
}

function parseRgb(color: string): [number, number, number] | null {
  const rgba = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgba) {
    return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])]
  }

  const hex = color.trim().replace('#', '')
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ]
  }
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return [
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
    ]
  }

  return null
}

function textColorFromRgb(r: number, g: number, b: number): string {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1f2933' : '#ffffff'
}

type PaletteStop = {
  value: number
  color: string
}

/**
 * Maps a scalar onto a maps-layer palette (`colors` + `values` databounds).
 * Uses the last stop whose bound is <= value (step / lower-bound).
 */
export function colorForValue(
  value: number | null,
  colors: readonly string[],
  values: readonly (number | null)[],
): TimeseriesCellColor {
  if (value == null || !Number.isFinite(value) || colors.length === 0) {
    return TIMESERIES_CELL_COLOR_FALLBACK
  }

  const stops: PaletteStop[] = []
  const length = Math.min(colors.length, values.length)
  for (let index = 0; index < length; index++) {
    const bound = values[index]
    const color = colors[index]
    if (bound == null || !Number.isFinite(bound) || !color) {
      continue
    }
    stops.push({ value: bound, color })
  }

  if (stops.length === 0) {
    return TIMESERIES_CELL_COLOR_FALLBACK
  }

  let match = stops[0]
  for (const stop of stops) {
    if (stop.value <= value) {
      match = stop
    } else {
      break
    }
  }

  const rgb = parseRgb(match.color)
  return {
    background: match.color,
    text: rgb
      ? textColorFromRgb(...rgb)
      : TIMESERIES_CELL_COLOR_FALLBACK.text,
  }
}
