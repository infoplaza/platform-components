import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import image from '@rollup/plugin-image'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { builtinModules } from 'node:module'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRootDir = path.dirname(fileURLToPath(import.meta.url))

const pkg = JSON.parse(
  readFileSync(path.resolve(projectRootDir, 'package.json'), 'utf8'),
)

// Treat every runtime dependency, peer/optional dependency and Node built-in as
// external so they are never bundled into the client graph. This keeps Node-only
// code (e.g. geotiff -> fs/worker_threads, deck.gl/luma -> worker_threads) out of
// the published chunks, which is what makes the package Turbopack-safe and lets the
// host bundler apply each dependency's own `browser` resolution conditions.
const externalPackages = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.optionalDependencies ?? {}),
]

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
])

function external(id) {
  if (builtins.has(id)) {
    return true
  }
  return externalPackages.some(
    (name) => id === name || id.startsWith(`${name}/`),
  )
}

export default {
  input: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'layers/composer': 'src/layers/composer.tsx',
    'layers/overlay': 'src/layers/overlay.tsx',
    'providers/index': 'src/providers/index.ts',
    'events/index': 'src/events/index.tsx',
    'auth/index': 'src/auth/index.ts',
  },
  external,
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name]-[hash].js',
  },
  onwarn(warning, warn) {
    if (
      warning.code === 'CIRCULAR_DEPENDENCY' &&
      Array.isArray(warning.ids) &&
      warning.ids.length > 0 &&
      warning.ids.every((id) => id.includes('/node_modules/'))
    ) {
      return
    }
    warn(warning)
  },
  treeshake: true,
  plugins: [
    alias({
      entries: [
        {
          find: '@/src',
          replacement: path.resolve(projectRootDir, 'src'),
        },
        {
          find: '@/@types',
          replacement: path.resolve(projectRootDir, '@types'),
        },
      ],
    }),
    nodeResolve({ extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx'] }),
    image(),
    json(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: { ignoreDeprecations: '6.0' },
    }),
    terser({ maxWorkers: 1, format: { comments: false } }),
  ],
}
