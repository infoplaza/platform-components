import { proxyUpstream } from '../proxy'
import { transformTimeseriesModelsResponse } from '../dto/timeseries-models-transform'
import type { PlatformEndpoint, PlatformEndpointHandler } from './types'
import {
  parseCoordinate,
  parseRequestUrl,
  timeseriesAuthOptions,
  withQuery,
} from './utils'

const handle: PlatformEndpointHandler = async (req, res, options) => {
  const { pathname, params } = parseRequestUrl(req)
  const lat = parseCoordinate(params, 'lat')
  const lon = parseCoordinate(params, 'lon')
  if (lat == null || lon == null) {
    res.status(400).json({ error: 'lat and lon are required' })
    return
  }

  await proxyUpstream(
    withQuery(req, pathname, `lat=${lat}&lon=${lon}`),
    res,
    timeseriesAuthOptions(options),
    'models',
    transformTimeseriesModelsResponse,
  )
}

export const timeseriesModelsEndpoint: PlatformEndpoint = {
  path: 'timeseries-models',
  handle,
}
