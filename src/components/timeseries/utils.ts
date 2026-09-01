import { formatDate, type SupportedLocale } from '@/src/utilities/date'
import type {
  TimeseriesDirectionView,
  TimeseriesModel,
  TimeseriesRun,
} from './types'

const COMPASS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
  'N',
] as const

export const DEFAULT_DIRECTION_VIEW: TimeseriesDirectionView = {
  arrow: true,
  degrees: true,
  compass: false,
}

const DIRECTION_VIEW_CYCLE: TimeseriesDirectionView[] = [
  { arrow: true, degrees: true, compass: false },
  { arrow: true, degrees: false, compass: true },
  { arrow: false, degrees: true, compass: true },
]

export function nextDirectionView(
  current: TimeseriesDirectionView,
): TimeseriesDirectionView {
  const index = DIRECTION_VIEW_CYCLE.findIndex(
    (view) =>
      view.arrow === current.arrow &&
      view.degrees === current.degrees &&
      view.compass === current.compass,
  )
  return DIRECTION_VIEW_CYCLE[(index + 1) % DIRECTION_VIEW_CYCLE.length]
}

export function degreesToCompass(degrees: number): string {
  if (!Number.isFinite(degrees)) return ''
  const normalized = ((degrees % 360) + 360) % 360
  return COMPASS[Math.round(normalized / 22.5)] ?? 'N'
}

export function isWithinCurrentHour(timestamp: number): boolean {
  const now = Date.now()
  const hourStart = Math.floor(now / 3_600_000) * 3_600_000
  const ms = timestamp * 1000
  return ms >= hourStart && ms < hourStart + 3_600_000
}

export function toSupportedLocale(locale: string | undefined): SupportedLocale {
  if (
    locale === 'nl' ||
    locale === 'de' ||
    locale === 'it' ||
    locale === 'es' ||
    locale === 'fr' ||
    locale === 'en'
  ) {
    return locale
  }
  return 'en'
}

export function formatHeaderDate(
  timestamp: number,
  format: string,
  locale: string,
  timezone?: string | null,
): string {
  const date = new Date(timestamp * 1000)
  return (
    formatDate(date, format, toSupportedLocale(locale), timezone ?? undefined) ??
    ''
  )
}

export function toFixedTruncated(value: number, decimals: number): string {
  const factor = 10 ** decimals
  const truncated = Math.trunc(value * factor + Number.EPSILON) / factor
  return truncated.toFixed(decimals)
}

export function resolveDecimals(
  value: number,
  decimals: number | undefined,
  element?: string,
  unit?: string,
): number {
  if (typeof decimals === 'number') {
    return decimals
  }
  if (element === 'pressure_meansealevel' || unit === 'hPa') {
    return 1
  }
  const abs = Math.abs(value)
  if (abs >= 100) return 0
  return 1
}

/** Mean sea-level pressure: integers in full; 1000–1999 with decimals drop the leading 1. */
export function formatPressureMeanSeaLevel(
  value: number,
  decimals: number,
): string {
  let fixed = value.toFixed(decimals)
  if (Number.isInteger(value)) {
    return fixed.replace(/\.0+$/, '')
  }
  if (value >= 1000 && value < 2000 && fixed.startsWith('1')) {
    fixed = fixed.slice(1)
  }
  return fixed
}

export function latestRuntime(
  models: readonly TimeseriesModel[],
  slug: string | undefined,
): TimeseriesRun | undefined {
  if (!slug) return undefined
  const selected = models.find((item) => item.slug === slug)
  if (!selected?.runtimes.length) return undefined
  return Math.max(...selected.runtimes)
}
