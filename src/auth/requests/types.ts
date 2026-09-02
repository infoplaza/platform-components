import type {
  PlatformAuthOptions,
  PlatformRequest,
  PlatformResponse,
} from '../types'

/**
 * Handles a single platform endpoint after the catch-all route has resolved the
 * first path segment (e.g. `models` → `/api/platform/models`).
 *
 * `segments` is the full remainder after the mounted base path, so nested
 * routes can inspect later parts (`['models', 'ecmwf']`).
 */
export type PlatformEndpointHandler = (
  req: PlatformRequest,
  res: PlatformResponse,
  options: PlatformAuthOptions,
  segments: string[],
) => Promise<void>

/**
 * Self-describing endpoint. Register it in `requests/index.ts` to expose it
 * under `/api/platform/<path>`.
 */
export type PlatformEndpoint = {
  path: string
  handle: PlatformEndpointHandler
}
