import { proxyUpstream } from '../proxy'
import { transformTimeseriesPointForecastResponse } from '../dto/timeseries-point-forecast-transform'
import type { PlatformEndpoint, PlatformEndpointHandler } from './types'
import {
  parseCoordinate,
  parseRequestUrl,
  requireParam,
  resolveMapsBaseUrl,
  timeseriesAuthOptions,
  withQuery,
} from './utils'

const POINT_FORECAST_QUERY_KEYS = [
  'lat',
  'lon',
  'model',
  'elements',
  'levels',
  'runtime',
  'units',
  'members',
] as const

const handle: PlatformEndpointHandler = async (req, res, options) => {
  const { pathname, params } = parseRequestUrl(req)
  const lat = parseCoordinate(params, 'lat')
  const lon = parseCoordinate(params, 'lon')
  const model = requireParam(params, 'model')
  const elements = requireParam(params, 'elements')
  const levels = requireParam(params, 'levels')
  if (lat == null || lon == null || !model || !elements || !levels) {
    res.status(400).json({
      error: 'lat, lon, model, elements, and levels are required',
    })
    return
  }

  const forwarded = new URLSearchParams()
  for (const key of POINT_FORECAST_QUERY_KEYS) {
    const value = params.get(key)
    if (value != null && value !== '') {
      forwarded.set(key, value)
    }
  }

  await proxyUpstream(
    withQuery(req, pathname, forwarded.toString()),
    res,
    timeseriesAuthOptions(options),
    'point',
    (data) =>
      transformTimeseriesPointForecastResponse(data, {
        mapsBaseUrl: resolveMapsBaseUrl(options.baseUrl),
        apiKey: options.apiKey,
        lat,
        lon,
        model,
        runtime: params.get('runtime') ?? undefined,
      }),
  )
}

export const timeseriesPointForecastEndpoint: PlatformEndpoint = {
  path: 'timeseries-point-forecast',
  handle,
}
