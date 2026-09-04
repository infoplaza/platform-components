import type { PlatformEndpoint, PlatformEndpointHandler } from './types'
import { ensembleModelsEndpoint } from './ensemble-models'
import { ensemblePointForecastEndpoint } from './ensemble-point-forecast'
import { modelsEndpoint } from './models'
import { timeseriesModelsEndpoint } from './timeseries-models'
import { timeseriesPointForecastEndpoint } from './timeseries-point-forecast'

/**
 * Register new endpoints here. Each entry is exposed automatically under the
 * mounted catch-all route (e.g. adding `{ path: 'layers', handle }` exposes
 * `/api/platform/layers`).
 */
const registered: readonly PlatformEndpoint[] = [
  modelsEndpoint,
  timeseriesModelsEndpoint,
  timeseriesPointForecastEndpoint,
  ensembleModelsEndpoint,
  ensemblePointForecastEndpoint,
]

export const endpoints: Record<string, PlatformEndpointHandler> =
  Object.fromEntries(
    registered.map((endpoint) => [endpoint.path, endpoint.handle]),
  )
