import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRootDir = path.dirname(fileURLToPath(import.meta.url))

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'maplibre-gl',
  'react-map-gl',
  'react-map-gl/maplibre',
]

export default {
  input: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'providers/index': 'src/providers/index.ts',
  },
  external,
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name]-[hash].js',
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
    nodeResolve({ extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'] }),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: { ignoreDeprecations: '6.0' },
    }),
    terser({ maxWorkers: 1, format: { comments: false } }),
  ],
}
