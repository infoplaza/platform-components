// Structural types compatible with Next.js `NextApiRequest`/`NextApiResponse`
// (Pages Router) as well as Node's `IncomingMessage`/`ServerResponse`. They are
// declared locally so consumers don't need `next` installed to type the handler.

export interface PlatformRequest {
  url?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  query?: Record<string, string | string[] | undefined>
  body?: unknown
}

export interface PlatformResponse {
  status(code: number): PlatformResponse
  json(body: unknown): void
  send(body: unknown): void
  setHeader(name: string, value: string | number | readonly string[]): void
  end(chunk?: unknown): void
}

export type PlatformHandler = (
  req: PlatformRequest,
  res: PlatformResponse,
) => void | Promise<void>

/**
 * Universal handler returned by `PlatformAuth`. It detects its calling
 * convention so a single default export works in both Next.js routers:
 *
 * - **App Router** — called by Next with a Web `Request` and returns a
 *   `Response`. Re-export it as the route's HTTP methods:
 *   `export { handler as GET, handler as POST }`.
 * - **Pages Router** — called with `(req, res)` like a classic
 *   `NextApiHandler`. Use it directly: `export default handler`.
 */
export interface PlatformRouteHandler {
  (request: Request): Promise<Response>
  (req: PlatformRequest, res: PlatformResponse): Promise<void>
}

export interface PlatformAuthOptions {
  /** Static API key attached to every proxied upstream request. */
  apiKey: string
  /**
   * Base URL of the upstream API that requests are proxied to
   * (e.g. `https://api.infoplaza.io`). Required once endpoints proxy upstream.
   */
  baseUrl?: string
  /**
   * Public base path this handler is mounted on. Used to resolve the endpoint
   * segment from the incoming request URL.
   * @default '/api/platform'
   */
  basePath?: string
  /**
   * Request header used to send the API key upstream.
   * @default 'Authorization'
   */
  apiKeyHeader?: string
  /**
   * Formats the API key into the header value.
   * @default (apiKey) => `Bearer ${apiKey}`
   */
  apiKeyScheme?: (apiKey: string) => string
  /**
   * If set, the API key is sent as this query-string parameter instead of a
   * request header (e.g. `'token'` results in `?token=<apiKey>`).
   */
  apiKeyQueryParam?: string
}
