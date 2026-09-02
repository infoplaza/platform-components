import { proxyUpstream } from '../proxy'
import { transformModelsResponse } from '../dto/models-transform'
import type { PlatformEndpoint, PlatformEndpointHandler } from './types'

/**
 * Proxies to `${baseUrl}/models` (e.g.
 * https://api.infoplaza.com/weather/v1/models?token=<apiKey>) and enriches each
 * model with a computed `elementGroups` collection derived from the FORECAST
 * layer configuration.
 */
const handle: PlatformEndpointHandler = async (req, res, options) => {
  await proxyUpstream(req, res, options, 'models', (data) =>
    transformModelsResponse(data),
  )
}

export const modelsEndpoint: PlatformEndpoint = {
  path: 'models',
  handle,
}
