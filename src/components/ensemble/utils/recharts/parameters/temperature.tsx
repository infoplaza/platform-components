import CustomTooltip from '../../../graph/tooltips/tooltip'
import type { EnsembleRow } from '../../../types'
import { getMinMaxValues } from '../graph'

const TEMPERATURE_SLUGS = [
  'temperature_temperature',
  'overview_temperature',
  'overview_dewpoint',
  'temperature_temperature_2m',
  'temperature_temperaturemin_2m',
  'temperature_temperature_100m',
  'temperature_temperature_200m',
  'temperature_dewpoint',
  'summer_temperature',
  'temperature_temperaturemax_2m',
  'winter_temperature',
]

function isTemperatureSlug(slug: string | undefined): boolean {
  return Boolean(slug && TEMPERATURE_SLUGS.includes(slug))
}

const rangeCache = new Map<string, number[]>()

function calculateTemperatureRange(rows: EnsembleRow[], modelApi = 'prod') {
  const cacheKey = `${modelApi}:${rows.length}:${rows[0]?.datetime}:${rows[rows.length - 1]?.datetime}`
  const cached = rangeCache.get(cacheKey)
  if (cached) return cached

  const { maxValue, minValue } = getMinMaxValues(rows, modelApi)
  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    return []
  }

  let max = Math.ceil(maxValue)
  while (max % 5 !== 0) max++
  let min = Math.floor(minValue)
  while (min % 5 !== 0) min--

  const ticks = Array.from(
    { length: Math.ceil((max - min) / 5) + 1 },
    (_, i) => max - i * 5,
  )
  rangeCache.set(cacheKey, ticks)
  return ticks
}

export function getTempUnitReferenceLines(unit?: string) {
  if (unit === 'K') {
    return [
      { line: 273.15, stroke: '#666666', strokeDasharray: '5 5' },
      { line: 298.15, stroke: '#ff9300', strokeDasharray: '5 5' },
      { line: 303.15, stroke: '#E63A48', strokeDasharray: '5 5' },
      { line: 273.15, stroke: '#2680b3', strokeDasharray: '5 5' },
      { line: 263.15, stroke: '#2680b3', strokeDasharray: '5 5' },
    ]
  }
  if (unit === '°F') {
    return [
      { line: 32, stroke: '#666666', strokeDasharray: '5 5' },
      { line: 77, stroke: '#ff9300', strokeDasharray: '5 5' },
      { line: 86, stroke: '#E63A48', strokeDasharray: '5 5' },
      { line: 32, stroke: '#2680b3', strokeDasharray: '5 5' },
      { line: 14, stroke: '#2680b3', strokeDasharray: '5 5' },
    ]
  }
  return [
    { line: 0, stroke: '#666666', strokeDasharray: '5 5' },
    { line: 25, stroke: '#ff9300', strokeDasharray: '5 5' },
    { line: 30, stroke: '#E63A48', strokeDasharray: '5 5' },
    { line: 0, stroke: '#2680b3', strokeDasharray: '5 5' },
    { line: -10, stroke: '#2680b3', strokeDasharray: '5 5' },
  ]
}

export function getTemperatureConfig(props: {
  slug?: string
  rows?: EnsembleRow[]
  unit?: string
  view?: string
  modelApi?: string
}) {
  const { slug, rows = [], unit, view, modelApi } = props
  if (!isTemperatureSlug(slug)) {
    return { yAxis: {}, tooltip: {}, reference: {} }
  }

  return {
    yAxis: {
      domain: ['dataMin', 'dataMax'],
      interval: view === 'basic' ? 'equidistantPreserveStart' : 'preserveStart',
      ticks: calculateTemperatureRange(rows, modelApi),
    },
    tooltip: {
      content: <CustomTooltip decimalPlace={1} />,
    },
    reference: {
      yLines: getTempUnitReferenceLines(unit),
    },
  }
}
