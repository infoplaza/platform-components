import { proxyUpstream } from '../proxy'
import { transformTimeseriesPointForecastResponse } from '../dto/timeseries-point-forecast-transform'
import type { PlatformEndpoint, PlatformEndpointHandler } from './types'
import {
  marineTimeseriesAuthOptions,
  parseCoordinate,
  parseRequestUrl,
  requireParam,
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
  if (lat == null || lon == null || !model || !elements) {
    res.status(400).json({
      error: 'lat, lon, model, and elements are required',
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
    marineTimeseriesAuthOptions(options),
    'point',
    (data) =>
      transformTimeseriesPointForecastResponse(data, {
        lat,
        lon,
        model,
        runtime: params.get('runtime') ?? undefined,
      }),
  )
}

export const marineTimeseriesPointForecastEndpoint: PlatformEndpoint = {
  path: 'marine-timeseries-point-forecast',
  handle,
}
