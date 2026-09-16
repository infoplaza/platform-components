import type { TimeseriesDomain } from './types'

export function timeseriesCatalogPath(
  domain: TimeseriesDomain = 'land',
): string {
  return domain === 'marine'
    ? 'marine-timeseries-models'
    : 'timeseries-models'
}

export function timeseriesPointPath(
  domain: TimeseriesDomain = 'land',
): string {
  return domain === 'marine'
    ? 'marine-timeseries-point-forecast'
    : 'timeseries-point-forecast'
}
