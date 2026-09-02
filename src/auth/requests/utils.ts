import type { PlatformAuthOptions, PlatformRequest } from '../types'

const DEFAULT_TIMESERIES_BASE_URL =
  'https://api.infoplaza.dev/v1/weather/timeseries'
const DEFAULT_ENSEMBLE_BASE_URL =
  'https://api.infoplaza.dev/v1/weather/ensemble'
const DEFAULT_MAPS_BASE_URL = 'https://api.infoplaza.dev/v1/weather/maps'

export function parseRequestUrl(req: PlatformRequest): {
  pathname: string
  params: URLSearchParams
} {
  const [pathname, queryString] = (req.url ?? '').split('?')
  return {
    pathname,
    params: new URLSearchParams(queryString),
  }
}

export function withQuery(
  req: PlatformRequest,
  pathname: string,
  query: string,
): PlatformRequest {
  return {
    ...req,
    url: query ? `${pathname}?${query}` : pathname,
  }
}

export function parseCoordinate(
  params: URLSearchParams,
  key: 'lat' | 'lon',
): number | null {
  if (!params.has(key)) {
    return null
  }
  const value = Number(params.get(key))
  return Number.isFinite(value) ? value : null
}

export function requireParam(
  params: URLSearchParams,
  key: string,
): string | null {
  const value = params.get(key)?.trim() ?? ''
  return value ? value : null
}

export function resolveTimeseriesBaseUrl(
  baseUrl: string | undefined,
  override?: string,
): string {
  if (override) {
    return override.replace(/\/+$/, '')
  }
  const base = (baseUrl ?? '').replace(/\/+$/, '')
  if (base.includes('/weather/maps')) {
    return base.replace('/weather/maps', '/weather/timeseries')
  }
  return DEFAULT_TIMESERIES_BASE_URL
}

export function resolveMapsBaseUrl(baseUrl: string | undefined): string {
  const base = (baseUrl ?? '').replace(/\/+$/, '')
  if (base.includes('/weather/timeseries')) {
    return base.replace('/weather/timeseries', '/weather/maps')
  }
  if (base.includes('/weather/maps')) {
    return base
  }
  return DEFAULT_MAPS_BASE_URL
}

export function timeseriesAuthOptions(
  options: PlatformAuthOptions,
): PlatformAuthOptions {
  return {
    ...options,
    baseUrl: resolveTimeseriesBaseUrl(
      options.baseUrl,
      options.timeseriesBaseUrl,
    ),
    apiKeyQueryParam: 'api_key',
  }
}

export function resolveEnsembleBaseUrl(
  baseUrl: string | undefined,
  override?: string,
): string {
  if (override) {
    return override.replace(/\/+$/, '')
  }
  const base = (baseUrl ?? '').replace(/\/+$/, '')
  if (base.includes('/weather/maps')) {
    return base.replace('/weather/maps', '/weather/ensemble')
  }
  if (base.includes('/weather/timeseries')) {
    return base.replace('/weather/timeseries', '/weather/ensemble')
  }
  return DEFAULT_ENSEMBLE_BASE_URL
}

export function ensembleAuthOptions(
  options: PlatformAuthOptions,
): PlatformAuthOptions {
  return {
    ...options,
    baseUrl: resolveEnsembleBaseUrl(options.baseUrl, options.ensembleBaseUrl),
    apiKeyQueryParam: 'api_key',
  }
}
