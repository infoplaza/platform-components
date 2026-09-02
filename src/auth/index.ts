import type {
  PlatformAuthOptions,
  PlatformRequest,
  PlatformResponse,
  PlatformRouteHandler,
} from './types'

export type {
  PlatformAuthOptions,
  PlatformHandler,
  PlatformRequest,
  PlatformResponse,
  PlatformRouteHandler,
} from './types'
import { endpoints } from './requests'

export { proxyUpstream } from './proxy'

const DEFAULT_BASE_PATH = '/api/platform'
const DEFAULT_BASE_URL = 'https://api.infoplaza.com/weather/v1'
// Upstream expects the key as `?token=<apiKey>` rather than an auth header.
const DEFAULT_API_KEY_QUERY_PARAM = 'token'

/**
 * Resolves the endpoint segments that follow the mounted base path.
 *
 * For a request to `/api/platform/models` mounted at `/api/platform`, this
 * returns `['models']`.
 */
function resolveSegments(req: PlatformRequest, basePath: string): string[] {
  const pathname = (req.url ?? '').split('?')[0]
  const normalizedBase = basePath.replace(/\/+$/, '')
  const baseIndex = normalizedBase ? pathname.indexOf(normalizedBase) : -1

  const remainder =
    baseIndex >= 0
      ? pathname.slice(baseIndex + normalizedBase.length)
      : pathname

  return remainder.split('/').filter(Boolean)
}

/**
 * Routes a normalized request to the matching platform endpoint. New endpoints
 * are registered in `requests/` and become available automatically under the
 * mounted catch-all route (e.g. adding a `layers` handler exposes
 * `/api/platform/layers`).
 */
async function dispatch(
  req: PlatformRequest,
  res: PlatformResponse,
  options: PlatformAuthOptions,
  basePath: string,
): Promise<void> {
  const segments = resolveSegments(req, basePath)
  const handler = endpoints[segments[0] ?? '']

  if (!handler) {
    res
      .status(404)
      .json({ error: `Unknown platform endpoint: /${segments.join('/')}` })
    return
  }

  await handler(req, res, options, segments)
}

/**
 * Type guard distinguishing a Pages Router `(req, res)` call from an App Router
 * `(request, context)` call. Only the Pages Router response exposes `status()`.
 */
function isPlatformResponse(value: unknown): value is PlatformResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PlatformResponse).status === 'function'
  )
}

/**
 * Bridges the Web Fetch `Request`/`Response` model used by the App Router to the
 * neutral `(req, res)` shape the endpoint dispatcher expects.
 */
async function handleWebRequest(
  request: Request,
  options: PlatformAuthOptions,
  basePath: string,
): Promise<Response> {
  const url = new URL(request.url)

  let statusCode = 200
  const headers = new Headers()

  let rawBody: unknown
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    rawBody = await request.text().catch(() => undefined)
  }

  const platformReq: PlatformRequest = {
    url: url.pathname + url.search,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: rawBody,
  }

  return await new Promise<Response>((resolve) => {
    const res: PlatformResponse = {
      status(code: number) {
        statusCode = code
        return res
      },
      json(body: unknown) {
        headers.set('content-type', 'application/json')
        resolve(
          new Response(JSON.stringify(body), { status: statusCode, headers }),
        )
      },
      send(body: unknown) {
        resolve(
          new Response(typeof body === 'string' ? body : JSON.stringify(body), {
            status: statusCode,
            headers,
          }),
        )
      },
      setHeader(name: string, value: string | number | readonly string[]) {
        headers.set(name, Array.isArray(value) ? value.join(', ') : String(value))
      },
      end(chunk?: unknown) {
        resolve(new Response((chunk as BodyInit) ?? null, { status: statusCode, headers }))
      },
    }

    Promise.resolve(dispatch(platformReq, res, options, basePath)).catch(
      (error) => {
        resolve(
          new Response(JSON.stringify({ error: String(error) }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
          }),
        )
      },
    )
  })
}

/**
 * Creates a single handler that transparently serves every platform endpoint
 * under a catch-all route, à la NextAuth. Mount it once and new endpoints
 * become available without adding more route files.
 *
 * @example App Router — `app/api/platform/[...platform]/route.ts`
 * ```ts
 * import PlatformAuth from '@infoplaza/platform/auth'
 *
 * export const authOptions = {
 *   apiKey: process.env.PLATFORM_API_KEY!,
 * }
 *
 * const handler = PlatformAuth(authOptions)
 * export { handler as GET, handler as POST }
 * ```
 *
 * @example Pages Router — `pages/api/platform/[...platform].ts`
 * ```ts
 * import PlatformAuth from '@infoplaza/platform/auth'
 *
 * export const authOptions = {
 *   apiKey: process.env.PLATFORM_API_KEY!,
 * }
 *
 * export default PlatformAuth(authOptions)
 * ```
 */
export default function PlatformAuth(
  options: PlatformAuthOptions,
): PlatformRouteHandler {
  if (!options || !options.apiKey) {
    throw new Error('[PlatformAuth] `apiKey` is required.')
  }

  // `apiKey` is the only required option. `baseUrl` and `apiKeyQueryParam` fall
  // back to the Infoplaza defaults so a minimal `{ apiKey }` config just works.
  const resolvedOptions: PlatformAuthOptions = {
    ...options,
    baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
    apiKeyQueryParam: options.apiKeyQueryParam ?? DEFAULT_API_KEY_QUERY_PARAM,
  }

  const basePath = resolvedOptions.basePath ?? DEFAULT_BASE_PATH

  const handler = (async (
    reqOrRequest: Request | PlatformRequest,
    maybeRes?: PlatformResponse,
  ): Promise<Response | void> => {
    // Pages Router: invoked as `(req, res)`.
    if (isPlatformResponse(maybeRes)) {
      await dispatch(reqOrRequest as PlatformRequest, maybeRes, resolvedOptions, basePath)
      return
    }

    // App Router / Web: invoked as `(request, context?)`.
    return await handleWebRequest(reqOrRequest as Request, resolvedOptions, basePath)
  }) as PlatformRouteHandler

  return handler
}
