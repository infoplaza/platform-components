import { proxyUpstream } from '../proxy'
import { transformEnsemblePointForecastResponse } from '../dto/ensemble-point-forecast-transform'
import type { PlatformEndpoint, PlatformEndpointHandler } from './types'
import {
  ensembleAuthOptions,
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
    ensembleAuthOptions(options),
    'point',
    (data) =>
      transformEnsemblePointForecastResponse(data, {
        lat,
        lon,
        model,
        runtime: params.get('runtime') ?? undefined,
      }),
  )
}

export const ensemblePointForecastEndpoint: PlatformEndpoint = {
  path: 'ensemble-point-forecast',
  handle,
}
