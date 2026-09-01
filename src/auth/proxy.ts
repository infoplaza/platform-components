import type {
  PlatformAuthOptions,
  PlatformRequest,
  PlatformResponse,
} from './types'

const defaultScheme = (apiKey: string) => `Bearer ${apiKey}`

/**
 * Optional hook to mutate a JSON upstream response before it is sent back to the
 * caller. Only invoked for `application/json` responses.
 */
export type UpstreamJsonTransform = (
  data: unknown,
  req: PlatformRequest,
) => unknown | Promise<unknown>

/**
 * Forwards the incoming request to the configured upstream API, attaching the
 * static API key. The upstream status, content-type and body are streamed back
 * to the caller. Endpoints can use this once they are ready to proxy for real.
 *
 * When `transformJson` is provided and the upstream returns JSON, the parsed
 * body is passed through it before being serialized to the caller.
 */
export async function proxyUpstream(
  req: PlatformRequest,
  res: PlatformResponse,
  options: PlatformAuthOptions,
  upstreamPath: string,
  transformJson?: UpstreamJsonTransform,
): Promise<void> {
  const base = options.baseUrl?.replace(/\/+$/, '')

  if (!base) {
    res.status(500).json({
      error: '[PlatformAuth] `baseUrl` must be configured to proxy requests.',
    })
    return
  }

  const queryString = (req.url ?? '').split('?')[1]
  const cleanPath = upstreamPath.replace(/^\/+/, '')

  const target = new URL(`${base}/${cleanPath}`)
  if (queryString) {
    for (const [key, value] of new URLSearchParams(queryString)) {
      target.searchParams.append(key, value)
    }
  }

  const headers = new Headers()
  const incomingContentType = req.headers['content-type']
  if (typeof incomingContentType === 'string') {
    headers.set('content-type', incomingContentType)
  }

  // Send the API key either as a query-string parameter or a request header.
  if (options.apiKeyQueryParam) {
    target.searchParams.set(options.apiKeyQueryParam, options.apiKey)
  } else {
    const scheme = options.apiKeyScheme ?? defaultScheme
    headers.set(options.apiKeyHeader ?? 'Authorization', scheme(options.apiKey))
  }

  const targetUrl = target.toString()

  const method = (req.method ?? 'GET').toUpperCase()
  const hasBody = method !== 'GET' && method !== 'HEAD' && req.body != null
  const body = hasBody
    ? typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body)
    : undefined

  if (hasBody && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  console.log('targetUrl', targetUrl)
  const upstream = await fetch(targetUrl, { method, headers, body })
  const contentType = upstream.headers.get('content-type') ?? ''

  res.status(upstream.status)
  res.setHeader('content-type', contentType || 'application/json')

  if (contentType.includes('application/json')) {
    const data = await upstream.json()
    const result =
      transformJson && upstream.ok ? await transformJson(data, req) : data
    res.json(result)
    return
  }

  res.send(await upstream.text())
}
