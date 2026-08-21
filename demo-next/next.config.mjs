import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@infoplaza/platform'],
  // The platform package is linked from the repo root via `file:..`. Tracing
  // must start there so Vercel serverless functions include dist/ and deps.
  outputFileTracingRoot: path.join(__dirname, '..'),
}

export default nextConfig
