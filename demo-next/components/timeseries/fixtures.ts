import {
  DEFAULT_TIMESERIES_ELEMENT_GROUPS,
  type TimeseriesBlock,
  type TimeseriesCell,
  type TimeseriesElementGroup,
  type TimeseriesElementItem,
  type TimeseriesModel,
  type TimeseriesRow,
} from '@infoplaza/platform/timeseries'

const HOURS = 24

function startOfCurrentHourSeconds(): number {
  return Math.floor(Date.now() / 3_600_000) * 3_600
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

function rgb(r: number, g: number, b: number): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

function textColor(r: number, g: number, b: number): string {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1f2933' : '#ffffff'
}

function cellsFromValues(
  values: number[],
  colorFor: (value: number) => { im_color: string; im_textcolor: string },
): TimeseriesCell[] {
  const start = startOfCurrentHourSeconds()
  return values.map((value, index) => {
    const { im_color, im_textcolor } = colorFor(value)
    return {
      timestamp: start + index * 3600,
      value,
      im_color,
      im_textcolor,
    }
  })
}

function temperatureColor(value: number) {
  const t = Math.min(1, Math.max(0, (value + 5) / 35))
  const r = lerp(80, 220, t)
  const g = lerp(160, 70, t)
  const b = lerp(220, 60, t)
  return { im_color: rgb(r, g, b), im_textcolor: textColor(r, g, b) }
}

function windColor(value: number) {
  const t = Math.min(1, Math.max(0, value / 20))
  const r = lerp(230, 40, t)
  const g = lerp(240, 90, t)
  const b = lerp(250, 160, t)
  return { im_color: rgb(r, g, b), im_textcolor: textColor(r, g, b) }
}

function precipColor(value: number) {
  const t = Math.min(1, Math.max(0, value / 4))
  const r = lerp(240, 30, t)
  const g = lerp(248, 90, t)
  const b = lerp(255, 180, t)
  return { im_color: rgb(r, g, b), im_textcolor: textColor(r, g, b) }
}

function percentColor(value: number) {
  const t = Math.min(1, Math.max(0, value / 100))
  const r = lerp(230, 50, t)
  const g = lerp(240, 90, t)
  const b = lerp(250, 140, t)
  return { im_color: rgb(r, g, b), im_textcolor: textColor(r, g, b) }
}

function pressureColor(value: number) {
  const t = Math.min(1, Math.max(0, (value - 990) / 40))
  const r = lerp(80, 180, t)
  const g = lerp(140, 80, t)
  const b = lerp(220, 60, t)
  return { im_color: rgb(r, g, b), im_textcolor: textColor(r, g, b) }
}

function series(base: number, amplitude: number, offset: number): number[] {
  return Array.from({ length: HOURS }, (_, index) => {
    const wave = Math.sin((index + offset) / 3) * amplitude
    return Math.round((base + wave) * 10) / 10
  })
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

const MODEL_OFFSET: Record<string, number> = {
  harmonie: 0,
  ecmwf: 1.5,
  gfs: 3,
}

function offsetFor(model: string): number {
  return MODEL_OFFSET[model] ?? 0
}

export const AMSTERDAM = { lat: 52.3676, lon: 4.9041 }

export const DEMO_LOCATIONS = [
  { label: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { label: 'Rotterdam', lat: 51.9225, lon: 4.4792 },
  { label: 'London', lat: 51.5074, lon: -0.1278 },
  { label: 'Paris', lat: 48.8566, lon: 2.3522 },
  { label: 'Rome', lat: 41.9028, lon: 12.4964 },
] as const

function colorForItem(item: TimeseriesElementItem) {
  const element = item.element ?? ''
  if (item.view === 'ICON') {
    return () => ({ im_color: 'transparent', im_textcolor: '#111' })
  }
  if (
    element.includes('temperature') ||
    element === 'dewpoint' ||
    element === 'uvindex' ||
    element === 'uvindexclearsky'
  ) {
    return temperatureColor
  }
  if (element.includes('direction')) {
    return windColor
  }
  if (
    element.includes('wind') ||
    element === 'currentspeed' ||
    element.includes('waveheight') ||
    element.includes('waveperiod') ||
    element === 'seasurfaceheight'
  ) {
    return windColor
  }
  if (element.includes('precip') || element === 'snowdepth') {
    return precipColor
  }
  if (element.includes('pressure')) {
    return pressureColor
  }
  if (
    item.unit === '%' ||
    element.includes('cloud') ||
    element.includes('humidity') ||
    element.includes('percentage') ||
    element.includes('probability')
  ) {
    return percentColor
  }
  return windColor
}

function valuesForItem(item: TimeseriesElementItem, offset: number): number[] {
  const element = item.element ?? ''
  if (item.view === 'ICON') {
    return series(2, 2, offset).map((value) =>
      clamp(Math.round(value), 1, 8),
    )
  }
  if (item.view === 'PRECIPITATION_TYPE') {
    return series(2, 2, offset).map((value) =>
      clamp(Math.round(value), 0, 10),
    )
  }
  if (element.includes('direction')) {
    return series(220, 40, offset)
  }
  if (element.includes('temperature') || element === 'dewpoint') {
    return series(12, 6, offset)
  }
  if (element.includes('windgust')) {
    return series(11, 6, offset)
  }
  if (element.includes('windspeed') || element === 'currentspeed') {
    return series(6, 4, offset)
  }
  if (element.includes('precip') || element === 'snowdepth') {
    return series(0.8, 1.4, offset).map((value) => Math.max(0, value))
  }
  if (
    item.unit === '%' ||
    element.includes('cloud') ||
    element.includes('humidity') ||
    element.includes('percentage') ||
    element.includes('probability')
  ) {
    return series(50, 30, offset).map((value) => clamp(value, 0, 100))
  }
  if (element.includes('pressure')) {
    return series(1013, 8, offset)
  }
  if (element === 'cape') {
    return series(800, 400, offset)
  }
  if (
    element.includes('waveheight') ||
    element === 'seasurfaceheight'
  ) {
    return series(1.2, 0.8, offset).map((value) => Math.max(0, value))
  }
  if (element.includes('waveperiod')) {
    return series(8, 2, offset)
  }
  if (
    element.includes('pm') ||
    element.includes('pollen') ||
    element.includes('ozone') ||
    element.includes('dioxide') ||
    element.includes('monoxide') ||
    element.includes('dust') ||
    element.includes('biomass') ||
    element.includes('optical')
  ) {
    return series(15, 8, offset).map((value) => Math.max(0, value))
  }
  if (element === 'visibility') {
    return series(12, 4, offset)
  }
  if (element === 'salinity') {
    return series(35, 1, offset)
  }
  if (element === 'uvindex' || element === 'uvindexclearsky') {
    return series(4, 3, offset).map((value) => Math.max(0, value))
  }
  return series(10, 4, offset)
}

function rowFromItem(item: TimeseriesElementItem, model: string): TimeseriesRow {
  const offset = offsetFor(model)
  return {
    title: item.title,
    subtitle: item.unit,
    titleExtra: item.level,
    unit: item.unit,
    view: item.view,
    config: {
      element: item.element,
      decimals: item.decimals,
    },
    data: cellsFromValues(valuesForItem(item, offset), colorForItem(item)),
  }
}

function rowsForGroup(
  groups: TimeseriesElementGroup[],
  elementGroup: string,
  model: string,
): TimeseriesRow[] {
  const group =
    groups.find((entry) => entry.key === elementGroup) ?? groups[0]
  return (group?.items ?? []).map((entry) => rowFromItem(entry, model))
}

export function getTimeseriesBlocks(options: {
  model: string
  run: number | 'all'
  elementGroup: string
  models: readonly TimeseriesModel[]
  elementGroups?: TimeseriesElementGroup[]
}): TimeseriesBlock[] {
  const {
    model,
    run,
    elementGroup,
    models,
    elementGroups = DEFAULT_TIMESERIES_ELEMENT_GROUPS,
  } = options
  const selected = models.find((entry) => entry.slug === model) ?? models[0]
  if (!selected) {
    return []
  }
  const rows = rowsForGroup(elementGroups, elementGroup, model)
  const hiddenRows =
    elementGroup === 'overview'
      ? [{ title: 'Visibility', reason: 'Not available for this model' }]
      : undefined

  if (run === 'all') {
    return selected.runtimes.map((runtime, index) => ({
      title: selected.title,
      titleExtra: index === 0 ? 'latest' : undefined,
      subtitle:
        new Date(runtime * 1000).toISOString().slice(0, 16).replace('T', ' ') +
        'Z',
      rows,
      hiddenRows,
    }))
  }

  return [
    {
      title: selected.title,
      subtitle: 'Amsterdam',
      rows,
      hiddenRows,
    },
  ]
}
