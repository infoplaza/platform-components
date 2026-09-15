import type { DocsComponent } from '../docs-component-section'

export const MAP_COMPONENTS_IMPORT = `import {
  PlatformMap,
  WeatherLayers,
  MapControlHud,
} from '@infoplaza/platform/components'`

export const MAP_COMPONENTS: DocsComponent[] = [
  {
    id: 'platform-map',
    name: 'PlatformMap',
    summary: 'Weather-agnostic MapLibre shell.',
    description:
      'The general map container. It mounts a MapLibre map, resolves the basemap style, and exposes map context (map instance, beforeId, style variant) through usePlatformMap() from @infoplaza/platform/providers. Weather is optional — add host layers as children, or mount WeatherLayers when you need forecast overlays.',
    importStatement: `import { PlatformMap } from '@infoplaza/platform/components'`,
    notes: [
      'Must wrap the map subtree. WeatherLayers and usePlatformMap() only work inside PlatformMap.',
      'It is a forwardRef to the react-map-gl MapRef, so you can call map methods via ref.',
      'Style resolution order: style (raw MapLibre URL/object) → mapStyle → mapStyleKey → first entry of mapStyles.',
      'Call setWorkerUrl for MapLibre 6 before the first map mounts, or basemap tiles will not load.',
    ],
    required: [
      {
        name: 'viewState',
        type: 'Record<string, unknown>',
        description:
          'Camera state spread onto the MapLibre map. Pass at least longitude, latitude, and zoom. Typically controlled with onMove.',
      },
    ],
    optional: [
      {
        name: 'onMove',
        type: '(event: unknown) => void',
        description:
          'Fires while the camera moves. Use event.viewState to keep viewState in sync.',
      },
      {
        name: 'onClickMap',
        type: '(event: unknown) => void',
        description: 'Fires when the map canvas is clicked.',
      },
      {
        name: 'onLoad',
        type: '(payload: PlatformMapLoadPayload) => void',
        description:
          'Fires once the map has loaded. Payload includes map, bounds, center, and zoom.',
      },
      {
        name: 'children',
        type: 'ReactNode | ((props: { beforeId: string }) => ReactNode)',
        description:
          'Map children, or a render prop that receives the resolved beforeId (the basemap layer weather should insert under).',
      },
      {
        name: 'mapStyleKey',
        type: 'string',
        description:
          "Selects an entry from mapStyles by key. Built-in keys: 'dark', 'land', 'sea', 'traffic'.",
      },
      {
        name: 'mapStyles',
        type: 'MapStyle[]',
        defaultValue: 'MAP_STYLES',
        description:
          'Available basemap styles. Pass [...MAP_STYLES, customStyle] to add your own.',
      },
      {
        name: 'mapStyle',
        type: 'BaseMapStyle',
        description:
          'Explicit style object. Takes precedence over mapStyleKey. Kept mainly for backwards compatibility.',
      },
      {
        name: 'style',
        type: 'string | object | null',
        description:
          'Raw MapLibre style URL or object. When set, it overrides mapStyle / mapStyleKey (escape hatch).',
      },
      {
        name: 'styleVariant',
        type: `'default' | 'marine'`,
        defaultValue: `'default'`,
        description:
          'Which variant of the selected style to use. When omitted, WeatherLayers / Providers can switch to marine for wave/ocean models via context.',
      },
      {
        name: 'fitBounds',
        type: 'LngLatBoundsLike',
        description:
          'If set, the map fits these bounds on load and whenever the value changes.',
      },
      {
        name: 'fitBoundsOptions',
        type: '{ padding?: number; maxZoom?: number; duration?: number }',
        defaultValue: '{ padding: 48, maxZoom: 12, duration: 0 }',
        description:
          'Options forwarded to map.fitBounds. Subsequent bound updates use duration 300 unless overridden.',
      },
      {
        name: 'ref',
        type: 'React.Ref<MapRef>',
        description:
          'react-map-gl MapRef. Use getMap() for the underlying MapLibre instance, or call flyTo / fitBounds on the ref.',
      },
    ],
    relatedTypes: [
      {
        name: 'MapStyle',
        description:
          'A named basemap option with default and marine variants. Import the type from @infoplaza/platform/defaults or @infoplaza/platform/components.',
        fields: [
          {
            name: 'key',
            type: 'string',
            description: 'Unique id used by mapStyleKey.',
          },
          {
            name: 'title',
            type: 'string',
            description: 'Human-readable label (for a style picker).',
          },
          {
            name: 'styles.default.source',
            type: 'string | object',
            description: 'MapLibre style URL or inline style object for land/atmospheric models.',
          },
          {
            name: 'styles.default.beforeId',
            type: 'string',
            description:
              "Basemap layer id to insert weather under. Falls back to 'lakes-transparent' if omitted.",
          },
          {
            name: 'styles.marine.source',
            type: 'string | object',
            description: 'Style used for marine models (category wave / ocean).',
          },
          {
            name: 'styles.marine.beforeId',
            type: 'string',
            description: 'beforeId for the marine variant. Built-in marine styles use landcover.',
          },
        ],
      },
      {
        name: 'PlatformMapLoadPayload',
        description: 'Argument passed to onLoad.',
        fields: [
          {
            name: 'map',
            type: 'maplibre-gl.Map',
            description: 'The loaded MapLibre map instance.',
          },
          {
            name: 'bounds',
            type: 'LngLatBounds',
            description: 'Current map bounds.',
          },
          {
            name: 'center',
            type: 'LngLat',
            description: 'Current map center.',
          },
          {
            name: 'zoom',
            type: 'number',
            description: 'Current zoom level.',
          },
        ],
      },
    ],
    example: `<PlatformMap
  viewState={viewState}
  onMove={(event) => setViewState(event.viewState)}
  mapStyleKey="dark"
>
  <WeatherLayers showHud />
</PlatformMap>`,
  },
  {
    id: 'weather-layers',
    name: 'WeatherLayers',
    summary: 'Packaged weather stack for use under PlatformMap.',
    description:
      'Mounts Providers, map events, the Deck.gl layer pipeline (LayerComposer + LayerOverlay), and optionally MapControlHud. Use this instead of wiring Providers / MapEventsProvider / LayerComposer by hand unless you need a custom composition.',
    importStatement: `import { WeatherLayers } from '@infoplaza/platform/components'`,
    notes: [
      'Must be rendered as a child of PlatformMap. It calls usePlatformMap() for beforeId.',
      'Fetches the models catalog internally via GET /api/platform/models. Mount PlatformAuth on your server.',
      'Do not wrap PlatformMap in an outer Providers as well — Providers already lives inside WeatherLayers.',
      'Toggle weather on a feature map by mounting or unmounting WeatherLayers.',
    ],
    required: [],
    optional: [
      {
        name: 'weatherConfig',
        type: 'WeatherConfig',
        defaultValue: '{}',
        description:
          'Initial weather selection. Omitted fields use packaged defaults (gfs / temperature / latest; member and level are inferred).',
      },
      {
        name: 'modelsConfig',
        type: 'ModelsConfig',
        description:
          'Controls the internal models request. Set basePath if PlatformAuth is not mounted at /api/platform.',
      },
      {
        name: 'handler',
        type: `'simple' | 'demand' | 'nowcast'`,
        description:
          'Map event handler. When omitted, the handler is chosen from the active model (nowcast, regional, or demand).',
      },
      {
        name: 'showHud',
        type: 'boolean',
        defaultValue: 'false',
        description:
          'When true, renders MapControlHud (model / element / time / legend / zoom controls).',
      },
      {
        name: 'hudProps',
        type: 'MapControlHudProps',
        description: 'Props forwarded to MapControlHud when showHud is true.',
      },
      {
        name: 'interleaved',
        type: 'boolean',
        defaultValue: 'true',
        description:
          'When true, weather layers are inserted into the MapLibre style under beforeId so labels and borders stay on top. When false, Deck.gl draws as an overlay on top of the map.',
      },
      {
        name: 'controller',
        type: 'boolean',
        defaultValue: 'true',
        description:
          'Forwarded to the Deck.gl overlay. When true, the overlay participates in pointer interaction and picking.',
      },
      {
        name: 'mapIndex',
        type: 'number',
        defaultValue: '0',
        description:
          'Index of this map in a multi-map layout. Passed through to Providers and timestamps.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        description:
          'Extra content rendered inside Providers, alongside the overlay and HUD (for example host UI that needs weather context).',
      },
    ],
    relatedTypes: [
      {
        name: 'WeatherConfig',
        description: 'Initial weather selection passed to Providers.',
        fields: [
          {
            name: 'model',
            type: 'string',
            defaultValue: `'gfs'`,
            description: 'Initial model slug.',
          },
          {
            name: 'element',
            type: 'string',
            defaultValue: `'temperature'`,
            description: 'Initial weather element.',
          },
          {
            name: 'run',
            type: 'string',
            defaultValue: `'latest'`,
            description: 'Initial model run.',
          },
          {
            name: 'member',
            type: 'string',
            description: 'Ensemble member. Inferred from the model when omitted.',
          },
          {
            name: 'level',
            type: 'string',
            description: 'Vertical level. Inferred from the element when omitted.',
          },
          {
            name: 'hideLayers',
            type: 'string[]',
            defaultValue: '[]',
            description: 'Layer slugs to hide from the weather stack.',
          },
          {
            name: 'models',
            type: 'ModelInfo[]',
            description:
              'Deprecated. Models are fetched internally. If provided, they take precedence over the fetched catalog.',
          },
        ],
      },
      {
        name: 'ModelsConfig',
        description: 'Options for the internal GET ${basePath}/models request.',
        fields: [
          {
            name: 'basePath',
            type: 'string',
            defaultValue: `'/api/platform'`,
            description:
              'Public path where PlatformAuth is mounted. The models request is sent to ${basePath}/models.',
          },
        ],
      },
    ],
    example: `<PlatformMap
  viewState={viewState}
  onMove={(event) => setViewState(event.viewState)}
>
  <WeatherLayers
    showHud
    weatherConfig={{ model: 'optimal', element: 'temperature' }}
  />
</PlatformMap>`,
  },
  {
    id: 'map-control-hud',
    name: 'MapControlHud',
    summary: 'Built-in map controls for model, element, time, legend, and zoom.',
    description:
      'The control chrome that sits on top of the map: model / run / member pickers, element groups, timebar, legend, layer settings, info, and zoom. Prefer enabling it through WeatherLayers (showHud) unless you are composing the stack yourself.',
    importStatement: `import { MapControlHud } from '@infoplaza/platform/components'`,
    notes: [
      'Must be rendered inside Providers (WeatherMap context). WeatherLayers already provides that when showHud is true.',
      'Layout is device-aware: mobile uses a compact layer control and MapControlMobileTimebar; desktop uses the full timebar and a vertical layer panel.',
      'The timebar only renders for models whose format is forecast or nowcast.',
    ],
    required: [],
    optional: [
      {
        name: 'mapIndex',
        type: 'number',
        defaultValue: '0',
        description: 'Which map the zoom control targets in a multi-map layout.',
      },
      {
        name: 'mapsLength',
        type: 'number',
        defaultValue: '1',
        description: 'Total number of maps. Passed to the zoom control as multiMapCount.',
      },
      {
        name: 'isMultipleMapView',
        type: 'boolean',
        defaultValue: 'false',
        description:
          'Compacts the HUD: smaller info, a shorter timebar, and a single visible element slot.',
      },
    ],
    example: `<WeatherLayers
  showHud
  hudProps={{ mapIndex: 0, mapsLength: 1 }}
/>

// Composed stack (inside Providers, under PlatformMap):
<MapControlHud mapIndex={0} isMultipleMapView={false} />`,
  },
]

export const MAP_DEPRECATED_COMPONENTS: DocsComponent[] = [
  {
    id: 'base-map',
    name: 'BaseMap',
    summary: 'Weather-aware map shell. Prefer PlatformMap + WeatherLayers for new integrations.',
    description:
      'A thin wrapper around PlatformMap that reads the active model from weather context and switches the basemap to the marine variant for wave/ocean models. It must be rendered inside Providers. Still supported for the hand-wired stack; new hosts should use PlatformMap with WeatherLayers instead.',
    importStatement: `import { BaseMap } from '@infoplaza/platform/components'`,
    deprecated: true,
    notes: [
      'Deprecated. Use PlatformMap + WeatherLayers for new integrations.',
      'Must be rendered inside Providers. It calls useWeatherMap() to resolve the marine style variant.',
      'Does not accept styleVariant, onLoad, fitBounds, or fitBoundsOptions — those stay on PlatformMap.',
      'Marine switching is automatic: model category wave or ocean uses the marine variant; everything else uses default.',
    ],
    required: [
      {
        name: 'viewState',
        type: 'Record<string, unknown>',
        description:
          'Camera state spread onto the MapLibre map. Same as PlatformMap.viewState.',
      },
    ],
    optional: [
      {
        name: 'onMove',
        type: '(event: unknown) => void',
        description: 'Same as PlatformMap.onMove.',
      },
      {
        name: 'onClickMap',
        type: '(event: unknown) => void',
        description: 'Same as PlatformMap.onClickMap.',
      },
      {
        name: 'children',
        type: 'ReactNode | ((props: { beforeId: string }) => ReactNode)',
        description:
          'Typically the composed weather stack: MapEventsProvider, LayerComposer, LayerOverlay, and MapControlHud. The render-prop form receives beforeId.',
      },
      {
        name: 'mapStyleKey',
        type: 'string',
        description: 'Same as PlatformMap.mapStyleKey.',
      },
      {
        name: 'mapStyles',
        type: 'MapStyle[]',
        defaultValue: 'MAP_STYLES',
        description: 'Same as PlatformMap.mapStyles.',
      },
      {
        name: 'mapStyle',
        type: 'BaseMapStyle',
        description: 'Same as PlatformMap.mapStyle.',
      },
      {
        name: 'style',
        type: 'string | object | null',
        description: 'Same as PlatformMap.style.',
      },
    ],
    example: `<Providers>
  <BaseMap viewState={viewState} onMove={onMove} mapStyleKey="dark">
    {({ beforeId }) => (
      <>
        <MapEventsProvider>
          {(mapComponents) => (
            <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
              {({ layers }) => (
                <LayerOverlay layers={layers} interleaved controller />
              )}
            </LayerComposer>
          )}
        </MapEventsProvider>
        <MapControlHud />
      </>
    )}
  </BaseMap>
</Providers>`,
  },
]
