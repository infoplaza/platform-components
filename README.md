# @infoplaza/platform

React components and providers for rendering Infoplaza weather layers on a MapLibre map, plus a portable timeseries forecast table.

## Demo

A hosted Next.js demo lives at [https://platform-components.vercel.app/](https://platform-components.vercel.app/). The source is in `demo-next/`.

| Page | URL |
| --- | --- |
| Map (BaseMap, weather layers, HUD) | [https://platform-components.vercel.app/](https://platform-components.vercel.app/) |
| Timeseries forecast table | [https://platform-components.vercel.app/timeseries](https://platform-components.vercel.app/timeseries) |

## Install

```bash
npm install @infoplaza/platform maplibre-gl
```

Peer expectations:

- React 18 or 19
- **`maplibre-gl` ≥ 6.4.1** (this package targets **`^6.9.0`**)

Import styles once in your app entry (see [Styling & CSS isolation](#styling--css-isolation)):

```ts
import 'maplibre-gl/dist/maplibre-gl.css'
import '@infoplaza/platform/styles.css' // or styles.embed.css in a Tailwind host
```

> **Heads up:** weather models are fetched **internally** by `Providers` / `WeatherLayers`.
> You must mount the platform auth route on your server — see
> [Server setup (required)](#server-setup-required).

## MapLibre 6 setup (required for maps)

MapLibre v6 loads vector tiles in a **Web Worker** (`maplibre-gl-worker.mjs`, which imports
`maplibre-gl-shared.mjs`). Under **Next.js (Turbopack and webpack)**, Vite, Rollup, and
similar bundlers, that worker URL is not resolved correctly unless the host calls
[`setWorkerUrl`](https://maplibre.org/maplibre-gl-js/docs/API/functions/setWorkerUrl/)
**before the first map mounts**.

If you skip this step the map canvas often appears but **basemap tiles never load**.

Official background: [v5 → v6 migration guide](https://maplibre.org/maplibre-gl-js/docs/guides/v5-to-v6-migration-guide/).

### Next.js (recommended: automate the copy)

You need two things:

1. Serve the worker files from `public/` (same-origin URLs).
2. Call `setWorkerUrl` once on the client before any `BaseMap` / MapLibre map.

#### 1. Copy workers automatically on `dev` / `build`

Add a small script (same approach as `demo-next/scripts/copy-maplibre-workers.mjs`):

```js
// scripts/copy-maplibre-workers.mjs
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
    throw new Error(`Missing MapLibre worker asset: ${source}`)
  }
  copyFileSync(source, path.join(publicDir, file))
}

console.log(`Copied MapLibre workers → ${publicDir}`)
```

Hook it in `package.json` so every install/dev/build stays in sync with the
installed `maplibre-gl` version:

```json
{
  "scripts": {
    "predev": "node scripts/copy-maplibre-workers.mjs",
    "prebuild": "node scripts/copy-maplibre-workers.mjs",
    "dev": "next dev",
    "build": "next build"
  }
}
```

Add `public/maplibre/` to `.gitignore` (generated assets; do not commit them).

Optional: also run the script from `postinstall` if CI does not call `prebuild`
before bundling.

#### 2. Point MapLibre at the worker (client only)

```ts
// components/maplibre-worker.ts
'use client'

import { setWorkerUrl } from 'maplibre-gl'

let configured = false

export function ensureMapLibreWorker() {
  if (configured || typeof window === 'undefined') return
  setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
  configured = true
}

ensureMapLibreWorker()
```

Import that module **once**, before any map mounts — for example at the top of
your map client entry (or a client layout that wraps map routes):

```ts
'use client'
import '@/components/maplibre-worker'
// …then render BaseMap / PlatformMap
```

Reference implementation: [`demo-next/`](demo-next/) (`scripts/copy-maplibre-workers.mjs`,
`components/maplibre-worker.ts`, wired from the map client).

#### Manual alternative (no script)

```bash
mkdir -p public/maplibre
cp node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs public/maplibre/
cp node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs public/maplibre/
```

Then call `setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')` as above. Prefer the
script so upgrades of `maplibre-gl` do not leave stale workers in `public/`.

### Vite

```ts
import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(workerUrl)
```

If TypeScript complains about the `?worker&url` import, add:

```ts
// vite-env.d.ts
declare module '*?worker&url' {
  const workerUrl: string
  export default workerUrl
}
```

### Upgrading from MapLibre 5 / older `@infoplaza/platform`

| Step | Action |
| --- | --- |
| 1 | Bump `maplibre-gl` to `^6.9.0` (or at least `≥ 6.4.1`) and `@infoplaza/platform` to a release that depends on MapLibre 6 |
| 2 | Ensure `react-map-gl` is **≥ 8.1.2** (this package pins `^8.1.3`). Older 8.1.0/8.1.1 still read removed `map.transform` and crash with `Cannot read properties of undefined (reading 'center')` |
| 3 | This package uses `@deck.gl/maplibre` (not `@deck.gl/mapbox`) with deck.gl **9.4+** so weather overlays work on MapLibre 6. Hosts should not pin an older `@deck.gl/mapbox` that still reads `map.transform.height` |
| 4 | Add the worker copy + `setWorkerUrl` steps above (Next) or the Vite snippet |
| 5 | Keep CSS imports as `maplibre-gl/dist/maplibre-gl.css` — path unchanged |
| 6 | Platform APIs (`Providers`, `BaseMap`, auth route, timeseries/ensemble) stay the same for this upgrade |
| 7 | Smoke-test: basemap tiles load, weather layers/HUD still work |

If the map shell renders but stays blank/grey with no tile network requests, the
worker URL is almost always missing or pointing at the wrong path.

## Server setup (required)

`Providers` loads the available weather models for you by calling
`GET /api/platform/models` on **your own** server, which proxies the request to
the Infoplaza API using your secret API key. You must mount the platform auth
handler once so this endpoint exists — without it the models request (and
therefore the weather layers) will not load.

The handler is NextAuth-style: mount it once on a catch-all route and every
platform endpoint (e.g. `/api/platform/models`, `/api/platform/timeseries-models`,
`/api/platform/timeseries-point-forecast`)
is served automatically. Your API key stays server-side; the browser only ever
talks to `/api/platform/*`.

### App Router — `app/api/platform/[...platform]/route.ts`

```ts
import PlatformAuth from '@infoplaza/platform/auth'

const apiKey = process.env.PLATFORM_API_KEY
if (!apiKey) {
  throw new Error('PLATFORM_API_KEY environment variable is not set')
}

// `apiKey` is the only required option — `baseUrl` defaults to the Infoplaza API
// and the key is sent as `?token=<apiKey>` unless you override those.
const handler = PlatformAuth({ apiKey })

export { handler as GET, handler as POST }
```

### Pages Router — `pages/api/platform/[...platform].ts`

```ts
import PlatformAuth from '@infoplaza/platform/auth'

export default PlatformAuth({ apiKey: process.env.PLATFORM_API_KEY! })
```

### Options

Only `apiKey` is required. The rest are optional:

| Option | Default | Purpose |
| --- | --- | --- |
| `apiKey` | — (required) | Secret key attached to every proxied upstream request. |
| `baseUrl` | `'https://api.infoplaza.com/weather/v1'` | Upstream API that requests are proxied to. |
| `apiKeyQueryParam` | `'token'` | Query param the key is sent as for map `/models`. Timeseries models use `api_key`. Set to `''` to use header auth instead. |
| `basePath` | `'/api/platform'` | Public path this handler is mounted on. |
| `timeseriesBaseUrl` | derived from `baseUrl` | Upstream for timeseries routes (`timeseries-models`, `timeseries-point-forecast`). If `baseUrl` contains `/weather/maps`, it is swapped to `/weather/timeseries`. |

### Environment variables

```bash
# .env.local
PLATFORM_API_KEY=your-secret-key
```

If you mount the handler under a different base path, pass it through
`modelsConfig.basePath` on `Providers` so the internal request targets the right
URL (see [`modelsConfig`](#configuring-the-models-request)).

## Quick Start

This example follows the same flow as the [live demo](https://platform-components.vercel.app/)
(`demo-next/components/map/map-demo.tsx`): wrap your map
with providers, compose layers, render an overlay, and mount the control HUD.
Note there is **no** client-side models fetch — `Providers` handles it.

```tsx
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

import { BaseMap, MapControlHud, MAP_STYLES } from '@infoplaza/platform/components'
import { Providers } from '@infoplaza/platform/providers'
import { LayerComposer, Overlay } from '@infoplaza/platform'

import MapEventsProvider from '@infoplaza/platform/events'

import 'maplibre-gl/dist/maplibre-gl.css'
// Host apps that already run Tailwind / have global styles should use the embed
// build instead (see "Styling & CSS isolation" below):
import '@infoplaza/platform/styles.css'

function App() {
  const [viewState, setViewState] = useState({
    longitude: 4.9041,
    latitude: 52.3676,
    zoom: 7,
  })
  const [mapStyleKey, setMapStyleKey] = useState('dark')

  return (
    <Providers
      weatherConfig={{
        model: 'gfs',
        element: 'temperature',
        run: 'latest',
        member: '0',
        level: '2m',
      }}
      // Optional — controls the internal models request. These are the defaults.
      modelsConfig={{ apiEnv: 'prod', betaModels: false }}
    >
      <BaseMap
        viewState={viewState}
        onMove={(event: any) => setViewState(event?.viewState)}
        mapStyles={MAP_STYLES}
        mapStyleKey={mapStyleKey}
      >
        {({ beforeId }) => (
          <>
            <MapEventsProvider handler="demand">
              {(mapComponents) => (
                <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
                  {({ layers }) => <Overlay layers={[...layers]} interleaved controller />}
                </LayerComposer>
              )}
            </MapEventsProvider>

            <MapControlHud
              mapIndex={0}
              mapsLength={1}
              isMultipleMapView={false}
              onMapsCount={() => {}}
              onExportChange={() => {}}
              mapRef={null}
              viewState={viewState}
            />
          </>
        )}
      </BaseMap>
    </Providers>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Missing root element')
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### Configuring the models request

`Providers` accepts an optional `modelsConfig` prop that controls the internal
`/api/platform/models` request:

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| `apiEnv` | `'prod' \| 'test'` | `'prod'` | Upstream environment to request models for. |
| `betaModels` | `boolean` | `false` | Whether to include beta models. |
| `basePath` | `string` | `'/api/platform'` | Base path where the auth handler is mounted; the request is sent to `${basePath}/models`. |

The fetched models are exposed through context. If you need direct access, use
the `useModels()` hook (or `useProviders().models`) from
`@infoplaza/platform/providers`:

```tsx
import { useModels } from '@infoplaza/platform/providers'

function ModelCount() {
  const { models, loading, error } = useModels()
  if (loading) return <span>Loading models…</span>
  if (error) return <span>Failed to load models</span>
  return <span>{models.length} models available</span>
}
```

### Timeseries models catalog

Timeseries does **not** accept a `models` array. `TimeseriesModelsProvider`
(or packaged `TimeseriesForecast`) requires `lat` and `lon` and loads
`GET /api/platform/timeseries-models?lat=&lon=`. The catalog is read-only.

Chart rows load from `GET /api/platform/timeseries-point-forecast` unless the
host passes `blocks` or `getBlocks`.

```tsx
import { TimeseriesForecast } from '@infoplaza/platform/timeseries'

<TimeseriesForecast lat={52.3676} lon={4.9041} />
```

## What You Need

- A React application with an element like `<div id="root"></div>`.
- The platform auth route mounted on your server plus a `PLATFORM_API_KEY` — this is what powers the internal models request (see [Server setup (required)](#server-setup-required)).
- A map style for `BaseMap`: pick one of the built-in `MAP_STYLES` via `mapStyleKey`, pass your own `mapStyles` list, or supply a raw MapLibre style URL via `style` (see [Map styles](#map-styles)).
- Package styles imported once: `@infoplaza/platform/styles.css`.
- MapLibre CSS imported once: `maplibre-gl/dist/maplibre-gl.css`.

## Main Building Blocks

- `Providers` (`@infoplaza/platform/providers`): sets weather/config context used by the layer pipeline and fetches the available models internally.
- `PlatformAuth` (`@infoplaza/platform/auth`): server-side catch-all handler that proxies `/api/platform/*` to the Infoplaza API using your secret key (required — see [Server setup](#server-setup-required)).
- `BaseMap` (`@infoplaza/platform/components`): renders the MapLibre map container and handles camera updates.
- `LayerComposer` (`@infoplaza/platform`): converts map event output into Deck.gl-ready layers.
- `Overlay` (`@infoplaza/platform`): mounts Deck.gl layers on top of the map.
- `MapControlHud` (`@infoplaza/platform/components`): built-in map controls for model/element/time interactions.
- `MapEventsProvider` (`@infoplaza/platform/events`): bridges map interaction events into the layer pipeline.
- Timeseries (`@infoplaza/platform/timeseries`): `TimeseriesModelsProvider` loads the location-filtered catalog; `TimeseriesProvider` loads point-forecast rows by default. Packaged `TimeseriesForecast` (requires `lat`/`lon`) or compose Provider, Toolbar, Builder, Chart, and Footer. See the [timeseries demo](https://platform-components.vercel.app/timeseries).

## Map styles

`BaseMap` controls the underlying MapLibre basemap through a small, structured
**map style** system instead of a single style URL. A map style bundles the
basemap source(s) and the `beforeId` that the weather layers should be inserted
under, so data layers always render below the right labels/features.

### Shape of a map style

```ts
import type { MapStyle } from '@infoplaza/platform/components'

const myStyle: MapStyle = {
  key: 'dark',          // unique id used by `mapStyleKey`
  title: 'Dark',        // human-readable label (e.g. for a style picker)
  styles: {
    // Used for normal (land/atmospheric) models.
    default: {
      source: 'https://maps.example.com/styles/dark/style.json', // URL or MapLibre style object
      beforeId: 'river', // weather under rivers + borders + labels, above land fills
    },
    // Used automatically for marine models (category `wave` / `ocean`).
    marine: {
      source: 'https://maps.example.com/styles/dark-marine/style.json',
      beforeId: 'river',
    },
  },
}
```

- `source` is either a MapLibre style URL or an inline MapLibre style object.
- `beforeId` is the id of the basemap layer the weather layers are placed under.
  `BaseMap` exposes the resolved value through the `beforeId` render-prop so you
  can forward it to `LayerComposer` (`<LayerComposer beforeId={beforeId} … />`).
  If a style omits it, `BaseMap` falls back to `'river'`.
  Prefer the first river/border/label layer (e.g. `river`, `boundary_state`, `road-name`) so
  place names, rivers, and borders stay above the weather raster.

### Selecting a style

`BaseMap` resolves the active style in this order:

1. **`style`** — a raw MapLibre style URL or object. If set, it overrides
   everything else (escape hatch / quick start).
2. **`mapStyle`** — an explicit `BaseMapStyle` object (`{ styles: { default, marine } }`).
   Takes precedence over `mapStyleKey`; kept mainly for backwards compatibility.
3. **`mapStyleKey`** — selects an entry by `key` from the `mapStyles` list.
4. Fallback — the first entry of `mapStyles`.

```tsx
// Use a built-in style by key
<BaseMap mapStyles={MAP_STYLES} mapStyleKey="dark" viewState={viewState}>
  {({ beforeId }) => /* … */}
</BaseMap>
```

`mapStyles` defaults to the built-in `MAP_STYLES`, so `mapStyleKey` alone is
enough when you only need the shipped options.

### Built-in styles (`MAP_STYLES`)

`MAP_STYLES` (from `@infoplaza/platform/components`) ships these keys:

| `key` | `title` | Notes |
| --- | --- | --- |
| `dark` | Dark | Dark basemap |
| `land` | Land | Land-focused basemap |
| `sea` | Sea | Sea-focused basemap |
| `traffic` | Traffic | Traffic basemap |

Each one provides both a `default` and a `marine` variant.

### Marine auto-switching

`BaseMap` reads `modelInfo` from weather map context. Marine models (where
`modelInfo.description.category` is `wave` or `ocean`) automatically use the
style's `marine` variant; all other models use `default`. If a style has no
`marine` variant, it falls back to `default`.

### Extending the built-in styles

Add your own option by spreading `MAP_STYLES` and appending a custom `MapStyle`:

```tsx
import { BaseMap, MAP_STYLES } from '@infoplaza/platform/components'

const customStyle = {
  key: 'demotiles',
  title: 'MapLibre Demo',
  styles: {
    default: { source: 'https://demotiles.maplibre.org/style.json', beforeId: '' },
    marine:  { source: 'https://demotiles.maplibre.org/style.json', beforeId: '' },
  },
}

const mapStyles = [...MAP_STYLES, customStyle]

// A simple style picker:
<select value={mapStyleKey} onChange={(e) => setMapStyleKey(e.target.value)}>
  {mapStyles.map((option) => (
    <option key={option.key} value={option.key}>{option.title}</option>
  ))}
</select>

<BaseMap mapStyles={mapStyles} mapStyleKey={mapStyleKey} viewState={viewState}>
  {({ beforeId }) => /* … */}
</BaseMap>
```

## Entry Points

| Import | Purpose |
| --- | --- |
| `@infoplaza/platform` | Top-level API (`LayerComposer`, `Overlay`, components, providers) |
| `@infoplaza/platform/components` | `BaseMap`, `MapControlHud`, `MAP_STYLES`, `MapStyle` type, … |
| `@infoplaza/platform/providers` | `Providers`, `useModels`, `useProviders` |
| `@infoplaza/platform/auth` | `PlatformAuth` (server-side route handler) |
| `@infoplaza/platform/events` | `MapEventsProvider` |
| `@infoplaza/platform/timeseries` | `TimeseriesForecast`, `TimeseriesModelsProvider`, `TimeseriesProvider`, toolbar / builder / chart / footer |
| `@infoplaza/platform/layers/composer` · `/layers/overlay` | Individual layer building blocks |
| `@infoplaza/platform/styles.css` | Full stylesheet (includes Tailwind preflight) — for standalone apps |
| `@infoplaza/platform/styles.embed.css` | Utilities only, **no preflight** — for host apps that already run Tailwind / have global styles |

All package types are emitted with resolvable paths — deep imports and `.d.ts`
files no longer reference internal aliases.

## Styling & CSS isolation

All package utility classes are emitted with a Tailwind v4 **`ip` prefix**
(`.ip\:flex`, `.ip\:bg-white/80`, …), so they can never collide with a host
application's own Tailwind utilities. Pick the stylesheet that matches your host:

- **Standalone app** (no existing Tailwind / you want a reset): import
  `@infoplaza/platform/styles.css`. This includes Tailwind preflight (global
  element resets).
- **Embedding into an existing app** (Next.js, an app that already runs Tailwind,
  or any app with its own global styles): import
  `@infoplaza/platform/styles.embed.css`. This ships **only prefixed utilities**
  with **no preflight and no global element selectors** (`html`, `*`, `button`,
  `input`, `svg`), so it will not overwrite your site's CSS.

```tsx
// Host app (Next.js etc.)
import '@infoplaza/platform/styles.embed.css'
```

### Recommended wrapper

Wrap the map/HUD subtree in the `ip-platform` class. The prefix already prevents
class collisions, but the wrapper provides a stable scope for dark-mode/fullscreen
context and the icon color hook:

```tsx
<div className="ip-platform" style={{ height: '100%' }}>
  <Providers /* … */>{/* BaseMap, HUD, … */}</Providers>
</div>
```

### Icons

Exported icons render with `fill: currentColor` and are sized by the
`className` you pass. For a host-agnostic default that does not depend on Tailwind
`text-*` classes resolving, add the `ip-icon` class and (optionally) drive color
and size through CSS variables:

```css
.ip-platform { --ip-icon-color: #1f2937; --ip-icon-size: 1.25rem; }
```

## Next.js / Turbopack compatibility

The client bundle is browser-safe: no Node-only modules (`fs`,
`worker_threads`, `child_process`) are bundled into client chunks, and `geotiff`
is loaded lazily via an external dynamic `import('geotiff')` so the host bundler
applies its own browser resolution.

**Maps on Next require MapLibre 6 worker wiring** — see
[MapLibre 6 setup](#maplibre-6-setup-required-for-maps) (`setWorkerUrl` + copy
workers into `public/`). This applies to both Turbopack and webpack.

Add the package to `transpilePackages`:

```js
// next.config.js
const nextConfig = {
  transpilePackages: ['@infoplaza/platform'],
}
module.exports = nextConfig
```

- **App Router + Turbopack** (`next dev` / `next build`) is supported.
- `geotiff` is an optional dependency (only needed for GeoTIFF tile decoding). If
  you don't install it, GeoTIFF decoding throws a descriptive error; everything
  else works. You can also supply your own instance via `setLibrary('geotiff', lib)`.
- If you hit a bundler edge case, the webpack builder remains a fallback
  (`next dev --webpack` / `next build --webpack`).