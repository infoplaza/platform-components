import PlatformAuth from '../../../../../dist/auth/index.js'

// NextAuth-style setup: mount PlatformAuth once on a catch-all route and every
// platform endpoint (e.g. `/api/platform/models`) is served automatically. New
// endpoints added to the package show up here without extra route files.
const apiKey = process.env.PLATFORM_API_KEY
if (!apiKey) {
  throw new Error('PLATFORM_API_KEY environment variable is not set')
}

export const authOptions = {
  apiKey,
  baseUrl: process.env.PLATFORM_BASE_URL ?? 'https://api.infoplaza.dev/v1/weather/maps',
  // Upstream expects the key as `?token=<apiKey>` rather than an auth header.
  apiKeyQueryParam: 'token',
}

const handler = PlatformAuth(authOptions)

export { handler as GET, handler as POST }
