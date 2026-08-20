/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The demo imports the built package straight from ../dist (outside this app's
  // directory), so Next needs to be allowed to transpile files outside the root.
  experimental: {
    externalDir: true,
  },
}

export default nextConfig
