import type {
  TimeseriesBlock,
  TimeseriesCell,
  TimeseriesCellView,
  TimeseriesElementGroup,
  TimeseriesModel,
  TimeseriesRow,
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

function series(base: number, amplitude: number, offset: number): number[] {
  return Array.from({ length: HOURS }, (_, index) => {
    const wave = Math.sin((index + offset) / 3) * amplitude
    return Math.round((base + wave) * 10) / 10
  })
}

function row(
  partial: Omit<TimeseriesRow, 'data'> & {
    values: number[]
    colorFor: (value: number) => { im_color: string; im_textcolor: string }
  },
): TimeseriesRow {
  const { values, colorFor, ...rest } = partial
  return {
    ...rest,
    data: cellsFromValues(values, colorFor),
  }
}

const MODEL_OFFSET: Record<string, number> = {
  harmonie: 0,
  ecmwf: 1.5,
  gfs: 3,
}

function offsetFor(model: string): number {
  return MODEL_OFFSET[model] ?? 0
}

export const TIMESERIES_MODELS: TimeseriesModel[] = [
  { slug: 'harmonie', title: 'Harmonie', runtimes: [], available: true, sort: 1 },
  { slug: 'ecmwf', title: 'ECMWF IFS', runtimes: [], available: true, sort: 2 },
  { slug: 'gfs', title: 'GFS', runtimes: [], available: true, isBeta: true, sort: 3 },
]

export function withRuntimes(models: TimeseriesModel[]): TimeseriesModel[] {
  const now = startOfCurrentHourSeconds()
  const runtimes = [now - 6 * 3600, now - 12 * 3600, now - 18 * 3600]
  return models.map((model) => ({ ...model, runtimes }))
}

export const TIMESERIES_ELEMENT_GROUPS: TimeseriesElementGroup[] = [
  { key: 'overview', title: 'Overview' },
  { key: 'wind', title: 'Wind' },
  { key: 'precipitation', title: 'Precipitation' },
]

function overviewRows(model: string): TimeseriesRow[] {
  const offset = offsetFor(model)
  return [
    row({
      title: 'Weather',
      view: 'ICON' as TimeseriesCellView,
      values: series(2, 2, offset).map((value) =>
        Math.max(1, Math.min(8, Math.round(value))),
      ),
      colorFor: () => ({ im_color: 'transparent', im_textcolor: '#111' }),
    }),
    row({
      title: 'Temperature',
      subtitle: '°C',
      unit: '°C',
      view: 'VALUE',
      config: { element: 'temperature', decimals: 1 },
      values: series(12, 6, offset),
      colorFor: temperatureColor,
    }),
    row({
      title: 'Wind speed',
      subtitle: 'm/s',
      unit: 'm/s',
      view: 'VALUE_ROUND',
      values: series(6, 4, offset),
      colorFor: windColor,
    }),
    row({
      title: 'Wind direction',
      subtitle: '°',
      unit: '°',
      view: 'DIRECTION',
      values: series(220, 40, offset),
      colorFor: windColor,
    }),
    row({
      title: 'Precipitation',
      subtitle: 'mm',
      unit: 'mm',
      view: 'VALUE',
      config: { element: 'precipitation', decimals: 1 },
      values: series(0.8, 1.4, offset).map((value) => Math.max(0, value)),
      colorFor: precipColor,
    }),
  ]
}

function windRows(model: string): TimeseriesRow[] {
  const offset = offsetFor(model)
  return [
    row({
      title: 'Wind speed',
      subtitle: 'm/s',
      unit: 'm/s',
      view: 'VALUE',
      config: { decimals: 1 },
      values: series(7, 5, offset),
      colorFor: windColor,
    }),
    row({
      title: 'Wind gust',
      subtitle: 'm/s',
      unit: 'm/s',
      view: 'VALUE_ROUND',
      values: series(11, 6, offset),
      colorFor: windColor,
    }),
    row({
      title: 'Wind direction',
      subtitle: '°',
      unit: '°',
      view: 'DIRECTION',
      values: series(200, 50, offset),
      colorFor: windColor,
    }),
  ]
}

function precipitationRows(model: string): TimeseriesRow[] {
  const offset = offsetFor(model)
  return [
    row({
      title: 'Precipitation',
      subtitle: 'mm',
      unit: 'mm',
      view: 'VALUE',
      config: { decimals: 1 },
      values: series(1.2, 1.6, offset).map((value) => Math.max(0, value)),
      colorFor: precipColor,
    }),
    row({
      title: 'Type',
      view: 'PRECIPITATION_TYPE',
      values: series(2, 2, offset).map((value) =>
        Math.max(0, Math.min(10, Math.round(value))),
      ),
      colorFor: precipColor,
    }),
  ]
}

const ROWS_BY_GROUP: Record<string, (model: string) => TimeseriesRow[]> = {
  overview: overviewRows,
  wind: windRows,
  precipitation: precipitationRows,
}

export function getTimeseriesBlocks(options: {
  model: string
  run: number | 'all'
  elementGroup: string
  models: TimeseriesModel[]
}): TimeseriesBlock[] {
  const { model, run, elementGroup, models } = options
  const selected = models.find((item) => item.slug === model) ?? models[0]
  const rowsFn = ROWS_BY_GROUP[elementGroup] ?? overviewRows
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
      rows: rowsFn(model),
      hiddenRows,
    }))
  }

  return [
    {
      title: selected.title,
      subtitle: 'Amsterdam',
      rows: rowsFn(model),
      hiddenRows,
    },
  ]
}
