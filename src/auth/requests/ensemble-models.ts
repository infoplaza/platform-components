import { proxyUpstream } from '../proxy'
import { transformEnsembleModelsResponse } from '../dto/ensemble-models-transform'
import type { PlatformEndpoint, PlatformEndpointHandler } from './types'
import {
  ensembleAuthOptions,
  parseCoordinate,
  parseRequestUrl,
  withQuery,
} from './utils'

const handle: PlatformEndpointHandler = async (req, res, options) => {
  const { pathname, params } = parseRequestUrl(req)
  const wantsLocation = params.has('lat') || params.has('lon')
  const lat = parseCoordinate(params, 'lat')
  const lon = parseCoordinate(params, 'lon')

  if (wantsLocation && (lat == null || lon == null)) {
    res.status(400).json({ error: 'lat and lon are required together' })
    return
  }

  const query =
    lat != null && lon != null ? `lat=${lat}&lon=${lon}` : ''

  await proxyUpstream(
    withQuery(req, pathname, query),
    res,
    ensembleAuthOptions(options),
    'models',
    transformEnsembleModelsResponse,
  )
}

export const ensembleModelsEndpoint: PlatformEndpoint = {
  path: 'ensemble-models',
  handle,
}
