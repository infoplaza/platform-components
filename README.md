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
  const [models, setModels] = useState<any[]>([])
  const [mapStyleKey, setMapStyleKey] = useState('dark')

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
              models={models}
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

## What You Need

- A React application with an element like `<div id="root"></div>`.
- A model endpoint (or local data source) that returns the `weatherConfig.models` collection.
- A map style for `BaseMap`: pick one of the built-in `MAP_STYLES` via `mapStyleKey`, pass your own `mapStyles` list, or supply a raw MapLibre style URL via `style` (see [Map styles](#map-styles)).
- Package styles imported once: `@infoplaza/platform/styles.css`.
- MapLibre CSS imported once: `maplibre-gl/dist/maplibre-gl.css`.

## Main Building Blocks

- `Providers` (`@infoplaza/platform/providers`): sets weather/config context used by the layer pipeline.
- `BaseMap` (`@infoplaza/platform/components`): renders the MapLibre map container and handles camera updates.
- `LayerComposer` (`@infoplaza/platform`): converts map event output into Deck.gl-ready layers.
- `Overlay` (`@infoplaza/platform`): mounts Deck.gl layers on top of the map.
- `MapControlHud` (`@infoplaza/platform/components`): built-in map controls for model/element/time interactions.
- `MapEventsProvider` (`@infoplaza/platform/events`): bridges map interaction events into the layer pipeline.

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
      beforeId: 'lakes-transparent', // weather layers are inserted before this layer id
    },
    // Used automatically for marine models (category `wave` / `ocean`).
    marine: {
      source: 'https://maps.example.com/styles/dark-marine/style.json',
      beforeId: 'landcover',
    },
  },
}
```

- `source` is either a MapLibre style URL or an inline MapLibre style object.
- `beforeId` is the id of the basemap layer the weather layers are placed under.
  `BaseMap` exposes the resolved value through the `beforeId` render-prop so you
  can forward it to `LayerComposer` (`<LayerComposer beforeId={beforeId} … />`).
  If a style omits it, `BaseMap` falls back to `'lakes-transparent'`.

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

When you pass `modelInfo` to `BaseMap`, marine models (where
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