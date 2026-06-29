# @infoplaza/platform

React components and providers for rendering Infoplaza weather layers on a MapLibre map.

## Install

```bash
npm install @infoplaza/platform maplibre-gl
```

The package expects a React app (React + ReactDOM) and ships styles you should import once in your app entry.

## Quick Start

This example follows the same flow as `demo/main.tsx`: wrap your map with providers, compose layers, render an overlay, and mount the control HUD.

```tsx
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { BaseMap, MapControlHud } from '@infoplaza/platform/components'
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
  const [models, setModels] = useState<any[]>([])

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/models?apiEnv=prod&betaModels=false', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => setModels(Array.isArray(data?.data) ? data.data : []))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Unable to load models', error)
        }
      })

    return () => controller.abort()
  }, [])

  return (
    <Providers
      weatherConfig={{
        models,
        model: 'gfs',
        element: 'temperature',
        run: 'latest',
        member: '0',
        level: '2m',
      }}
    >
      <BaseMap
        viewState={viewState}
        onMove={(event: any) => setViewState(event?.viewState)}
        style="https://demotiles.maplibre.org/style.json"
      >
        <MapEventsProvider handler="demand">
          {(mapComponents) => (
            <LayerComposer mapComponents={mapComponents}>
              {({ layers }) => <Overlay layers={[...layers]} interleaved controller />}
            </LayerComposer>
          )}
        </MapEventsProvider>

        <MapControlHud
          mapIndex={0}
          mapsLength={1}
          isMultipleMapView={false}
          models={models}
          onMapsCount={() => {}}
          onExportChange={() => {}}
          mapRef={null}
          viewState={viewState}
        />
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

## What You Need

- A React application with an element like `<div id="root"></div>`.
- A model endpoint (or local data source) that returns the `weatherConfig.models` collection.
- A valid MapLibre style URL for `BaseMap` (`style` prop).
- Package styles imported once: `@infoplaza/platform/styles.css`.
- MapLibre CSS imported once: `maplibre-gl/dist/maplibre-gl.css`.

## Main Building Blocks

- `Providers` (`@infoplaza/platform/providers`): sets weather/config context used by the layer pipeline.
- `BaseMap` (`@infoplaza/platform/components`): renders the MapLibre map container and handles camera updates.
- `LayerComposer` (`@infoplaza/platform`): converts map event output into Deck.gl-ready layers.
- `Overlay` (`@infoplaza/platform`): mounts Deck.gl layers on top of the map.
- `MapControlHud` (`@infoplaza/platform/components`): built-in map controls for model/element/time interactions.
- `MapEventsProvider` (`@infoplaza/platform/events`): bridges map interaction events into the layer pipeline.

## Entry Points

| Import | Purpose |
| --- | --- |
| `@infoplaza/platform` | Top-level API (`LayerComposer`, `Overlay`, components, providers) |
| `@infoplaza/platform/components` | `BaseMap`, `MapControlHud`, … |
| `@infoplaza/platform/providers` | `Providers` |
| `@infoplaza/platform/events` | `MapEventsProvider` |
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