import { DocsCodeBlock } from '../docs-code-block'
import { Code, DocsCallout, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { DocsPropTable } from '../docs-prop-table'

export function MapLibreDocs() {
  return (
    <DocsPage
      title="MapLibre 6"
      description={
        <p className="m-0">
          MapLibre v6 loads vector tiles in a Web Worker (<Code>maplibre-gl-worker.mjs</Code>,
          which imports <Code>maplibre-gl-shared.mjs</Code>). Under Next.js (Turbopack and
          webpack), Vite, Rollup, and similar bundlers, that worker URL is not resolved
          correctly unless the host calls{' '}
          <a
            href="https://maplibre.org/maplibre-gl-js/docs/API/functions/setWorkerUrl/"
            className="font-medium text-primary"
          >
            setWorkerUrl
          </a>{' '}
          <strong>before the first map mounts</strong>.
        </p>
      }
    >
      <DocsCallout>
        If you skip this step the map canvas often appears but basemap tiles never load. A
        blank or grey shell with no tile network requests almost always means the worker URL
        is missing or pointing at the wrong path.
      </DocsCallout>

      <DocsGuideSection id="next" title="Next.js">
        <p className="m-0">You need two things:</p>
        <ol className="m-0 flex list-decimal flex-col gap-2 pl-5">
          <li>Serve the worker files from <Code>public/</Code> (same-origin URLs).</li>
          <li>
            Call <Code>setWorkerUrl</Code> once on the client before any{' '}
            <Code>PlatformMap</Code> / <Code>BaseMap</Code>.
          </li>
        </ol>
        <p className="m-0 font-medium text-dark">1. Copy workers on dev / build</p>
        <p className="m-0">
          Use the same approach as <Code>demo-next/scripts/copy-maplibre-workers.mjs</Code>:
        </p>
        <DocsCodeBlock>{`// scripts/copy-maplibre-workers.mjs
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const maplibrePackageJson = require.resolve('maplibre-gl/package.json', {
  paths: [appRoot],
})
const maplibreDist = path.join(path.dirname(maplibrePackageJson), 'dist')
const publicDir = path.join(appRoot, 'public', 'maplibre')
const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']

mkdirSync(publicDir, { recursive: true })

for (const file of files) {
  const source = path.join(maplibreDist, file)
  if (!existsSync(source)) {
    throw new Error(\`Missing MapLibre worker asset: \${source}\`)
  }
  copyFileSync(source, path.join(publicDir, file))
}`}</DocsCodeBlock>
        <DocsCodeBlock>{`{
  "scripts": {
    "predev": "node scripts/copy-maplibre-workers.mjs",
    "prebuild": "node scripts/copy-maplibre-workers.mjs",
    "dev": "next dev",
    "build": "next build"
  }
}`}</DocsCodeBlock>
        <p className="m-0">
          Add <Code>public/maplibre/</Code> to <Code>.gitignore</Code>. Optional: also run
          the script from <Code>postinstall</Code> if CI does not call <Code>prebuild</Code>.
        </p>
        <p className="m-0 font-medium text-dark">2. Point MapLibre at the worker (client only)</p>
        <DocsCodeBlock>{`// components/maplibre-worker.ts
'use client'

import { setWorkerUrl } from 'maplibre-gl'

let configured = false

export function ensureMapLibreWorker() {
  if (configured || typeof window === 'undefined') return
  setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
  configured = true
}

ensureMapLibreWorker()`}</DocsCodeBlock>
        <p className="m-0">
          Import that module once, before any map mounts — for example at the top of your
          map client entry.
        </p>
        <DocsCodeBlock>{`'use client'
import '@/components/maplibre-worker'
// then render PlatformMap`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="vite" title="Vite">
        <DocsCodeBlock>{`import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(workerUrl)`}</DocsCodeBlock>
        <p className="m-0">If TypeScript complains about the import:</p>
        <DocsCodeBlock>{`// vite-env.d.ts
declare module '*?worker&url' {
  const workerUrl: string
  export default workerUrl
}`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="upgrade" title="Upgrading from MapLibre 5">
        <DocsPropTable
          title="Checklist"
          nameColumn="Step"
          props={[
            {
              name: '1',
              type: 'deps',
              description:
                'Bump maplibre-gl to ^6.9.0 (or at least ≥ 6.4.1) and @infoplaza/platform to a MapLibre 6 release.',
            },
            {
              name: '2',
              type: 'deps',
              description:
                'Ensure react-map-gl is ≥ 8.1.2 (this package pins ^8.1.3). Older 8.1.0/8.1.1 crash on map.transform.',
            },
            {
              name: '3',
              type: 'deps',
              description:
                'This package uses @deck.gl/maplibre (not @deck.gl/mapbox) with deck.gl 9.4+ so weather overlays work on MapLibre 6.',
            },
            {
              name: '4',
              type: 'host',
              description: 'Add the worker copy + setWorkerUrl steps (Next) or the Vite snippet.',
            },
            {
              name: '5',
              type: 'css',
              description: 'Keep CSS imports as maplibre-gl/dist/maplibre-gl.css — path unchanged.',
            },
            {
              name: '6',
              type: 'api',
              description:
                'Platform APIs (Providers, BaseMap, auth route, timeseries/ensemble) stay the same for this upgrade.',
            },
          ]}
        />
      </DocsGuideSection>
    </DocsPage>
  )
}
