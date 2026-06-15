import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

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
    nodeResolve({ extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'] }),
    typescript({ tsconfig: './tsconfig.json' }),
    terser({ maxWorkers: 1, format: { comments: false } }),
  ],
}
