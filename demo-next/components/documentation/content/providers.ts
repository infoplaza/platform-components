import type { DocsComponent } from '../docs-component-section'

export const PROVIDERS_IMPORT = `import {
  Providers,
  useProviders,
  usePlatformMap,
  usePlatformMapContext,
  ModelsProvider,
  useModels,
  useModelsContext,
  WeatherMapProvider,
  useWeatherMap,
  LayerSettingsProvider,
  useLayerSettings,
  DisplaySettingsProvider,
  useDisplaySettings,
} from '@infoplaza/platform/providers'`

export const PROVIDER_EXPORTS: DocsComponent[] = [
  {
    id: 'providers',
    name: 'Providers',
    summary: 'Composed weather context tree for the map stack.',
    description:
      'Mounts Redux timestamps, models fetch, weather state, legend values, layer settings, and display settings. WeatherLayers already includes this. Use Providers yourself only when composing LayerComposer / MapEventsProvider by hand.',
    importStatement: `import { Providers } from '@infoplaza/platform/providers'`,
    notes: [
      'When mounted under PlatformMap, Providers switches the basemap to the marine variant for wave/ocean models.',
      'Do not wrap PlatformMap in Providers if you also use WeatherLayers — that would nest two provider trees.',
      'Fetches GET {basePath}/models on mount. Mount PlatformAuth on your server.',
    ],
    required: [
      {
        name: 'children',
        type: 'ReactNode',
        description: 'Map overlay, HUD, or other consumers of weather context.',
      },
    ],
    optional: [
      {
        name: 'weatherConfig',
        type: 'WeatherConfig',
        defaultValue: '{}',
        description:
          'Initial weather selection. Omitted fields use gfs / temperature / latest; member and level are inferred.',
      },
      {
        name: 'modelsConfig',
        type: 'ModelsConfig',
        description:
          'Controls the internal models request. Set basePath if PlatformAuth is not mounted at /api/platform.',
      },
      {
        name: 'mapIndex',
        type: 'number',
        defaultValue: '0',
        description: 'Index of this map in a multi-map layout. Passed to timestamp context.',
      },
    ],
    example: `<PlatformMap viewState={viewState} onMove={onMove}>
  <Providers
    weatherConfig={{ model: 'optimal', element: 'temperature' }}
    mapIndex={0}
  >
    <MapEventsProvider>
      {(mapComponents) => (
        <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
          {({ layers }) => <LayerOverlay layers={layers} interleaved />}
        </LayerComposer>
      )}
    </MapEventsProvider>
    <MapControlHud />
  </Providers>
</PlatformMap>`,
  },
  {
    id: 'use-providers',
    name: 'useProviders',
    kind: 'hook',
    summary: 'Reads every provider value in one call.',
    description:
      'Convenience hook for composed hosts that need models, weather, legend, layer settings, display settings, and mapIndex together. Throws if any of those providers is missing.',
    importStatement: `import { useProviders } from '@infoplaza/platform/providers'`,
    notes: [
      'Must be used inside Providers (or WeatherLayers).',
    ],
    required: [],
    optional: [],
    returns: [
      {
        name: 'mapIndex',
        type: 'number',
        description: 'Active map index from MapIndexProvider.',
      },
      {
        name: 'models',
        type: 'ModelsContextValue',
        description: 'Same as useModels(): { models, loading, error }.',
      },
      {
        name: 'weather',
        type: 'WeatherContextValue',
        description: 'Same as useWeatherMap().',
      },
      {
        name: 'legend',
        type: '{ legends, setLegends }',
        description: 'Legend values used by MapControlHud.',
      },
      {
        name: 'layerSettings',
        type: 'LayerSettingsContextValue',
        description: 'Same as useLayerSettings().',
      },
      {
        name: 'displaySettings',
        type: 'DisplaySettingsContextValue',
        description: 'Same as useDisplaySettings().',
      },
    ],
    example: `const { weather, models, layerSettings } = useProviders()
if (models.loading) return null
return <span>{weather.model} · {models.models.length} models</span>`,
  },
  {
    id: 'use-platform-map',
    name: 'usePlatformMap',
    kind: 'hook',
    summary: 'MapLibre instance and style context from PlatformMap.',
    description:
      'Use this to add host sources/layers, call flyTo, or read the beforeId that weather layers insert under. Throws when used outside PlatformMap.',
    importStatement: `import { usePlatformMap } from '@infoplaza/platform/providers'`,
    notes: [
      'Must be used under PlatformMap. map is null until the MapLibre map has loaded.',
    ],
    required: [],
    optional: [],
    returns: [
      {
        name: 'map',
        type: 'maplibre-gl.Map | null',
        description: 'The loaded MapLibre map, or null before onLoad.',
      },
      {
        name: 'beforeId',
        type: 'string',
        description:
          'Basemap layer id weather should insert under. Falls back to lakes-transparent.',
      },
      {
        name: 'styleVariant',
        type: `'default' | 'marine'`,
        description: 'Active style variant.',
      },
      {
        name: 'setStyleVariant',
        type: "(variant: 'default' | 'marine') => void",
        description: 'Switch variant. Providers already does this for marine models.',
      },
    ],
    example: `function FlyToAmsterdam() {
  const { map } = usePlatformMap()
  return (
    <button
      type="button"
      disabled={!map}
      onClick={() => map?.flyTo({ center: [4.9041, 52.3676], zoom: 10 })}
    >
      Fly to Amsterdam
    </button>
  )
}`,
  },
  {
    id: 'use-platform-map-context',
    name: 'usePlatformMapContext',
    kind: 'hook',
    summary: 'Nullable PlatformMap context.',
    description:
      'Same value as usePlatformMap, but returns null outside PlatformMap instead of throwing. Used internally by Providers for marine style sync.',
    importStatement: `import { usePlatformMapContext } from '@infoplaza/platform/providers'`,
    required: [],
    optional: [],
    returns: [
      {
        name: '(return)',
        type: 'PlatformMapContextValue | null',
        description: 'Map context, or null when there is no PlatformMap ancestor.',
      },
    ],
    example: `const ctx = usePlatformMapContext()
ctx?.setStyleVariant('marine')`,
  },
  {
    id: 'models-provider',
    name: 'ModelsProvider',
    summary: 'Fetches the weather models catalog.',
    description:
      'Loads GET {basePath}/models once and exposes { models, loading, error }. Already mounted inside Providers. Use it directly only if you need the catalog without the rest of the weather tree.',
    importStatement: `import { ModelsProvider } from '@infoplaza/platform/providers'`,
    required: [
      {
        name: 'children',
        type: 'ReactNode',
        description: 'Consumers of useModels / useModelsContext.',
      },
    ],
    optional: [
      {
        name: 'basePath',
        type: 'string',
        defaultValue: `'/api/platform'`,
        description: 'Public path where PlatformAuth is mounted.',
      },
    ],
    example: `<ModelsProvider basePath="/api/platform">
  <ModelCount />
</ModelsProvider>`,
  },
  {
    id: 'use-models',
    name: 'useModels',
    kind: 'hook',
    summary: 'Weather models catalog from ModelsProvider.',
    description:
      'Throws outside ModelsProvider. Prefer this when the catalog is required; use useModelsContext when the component can render without it.',
    importStatement: `import { useModels } from '@infoplaza/platform/providers'`,
    required: [],
    optional: [],
    returns: [
      {
        name: 'models',
        type: 'ModelInfo[]',
        description: 'Fetched catalog. Empty until the request succeeds.',
      },
      {
        name: 'loading',
        type: 'boolean',
        description: 'True while the models request is in flight.',
      },
      {
        name: 'error',
        type: 'Error | null',
        description: 'Set when the models request fails.',
      },
    ],
    example: `function ModelCount() {
  const { models, loading, error } = useModels()
  if (loading) return <span>Loading models…</span>
  if (error) return <span>Failed to load models</span>
  return <span>{models.length} models available</span>
}`,
  },
  {
    id: 'use-models-context',
    name: 'useModelsContext',
    kind: 'hook',
    summary: 'Nullable models catalog.',
    description:
      'Same as useModels, but returns null outside ModelsProvider instead of throwing.',
    importStatement: `import { useModelsContext } from '@infoplaza/platform/providers'`,
    required: [],
    optional: [],
    returns: [
      {
        name: '(return)',
        type: 'ModelsContextValue | null',
        description: '{ models, loading, error }, or null outside ModelsProvider.',
      },
    ],
  },
  {
    id: 'weather-map-provider',
    name: 'WeatherMapProvider',
    summary: 'Weather selection state and derived layer info.',
    description:
      'Holds the active model, element, run, member, and level, and derives modelInfo, elementInfo, and layersInfo. Reads the catalog from ModelsProvider unless weatherConfig.models is passed. Already mounted inside Providers.',
    importStatement: `import { WeatherMapProvider } from '@infoplaza/platform/providers'`,
    notes: [
      'Should sit under ModelsProvider so the catalog is available.',
      'weatherConfig.models is deprecated; the fetched catalog takes over when it is omitted.',
    ],
    required: [
      {
        name: 'children',
        type: 'ReactNode',
        description: 'HUD, events, and other weather consumers.',
      },
    ],
    optional: [
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
          'Deprecated. If provided, takes precedence over ModelsProvider.',
      },
    ],
    example: `<ModelsProvider>
  <WeatherMapProvider model="optimal" element="wind">
    <MapControlHud />
  </WeatherMapProvider>
</ModelsProvider>`,
  },
  {
    id: 'use-weather-map',
    name: 'useWeatherMap',
    kind: 'hook',
    summary: 'Current weather selection and derived layer info.',
    description:
      'Throws outside WeatherMapProvider. Use this to read or change the active model, element, run, member, and level, or to inspect layersInfo for the HUD and event handlers.',
    importStatement: `import { useWeatherMap } from '@infoplaza/platform/providers'`,
    required: [],
    optional: [],
    returns: [
      {
        name: 'model',
        type: 'string',
        description: 'Active model slug.',
      },
      {
        name: 'element',
        type: 'string',
        description: 'Active element slug.',
      },
      {
        name: 'modelRun',
        type: 'string',
        description: 'Active run (for example latest).',
      },
      {
        name: 'modelMember',
        type: 'string | null',
        description: 'Active ensemble member.',
      },
      {
        name: 'modelLevel',
        type: 'string | null',
        description: 'Active vertical level.',
      },
      {
        name: 'setModel / setElement / setModelRun / setModelMember / setModelLevel',
        type: 'function',
        description: 'Selection setters.',
      },
      {
        name: 'models',
        type: 'ModelInfo[]',
        description: 'Catalog used by this provider.',
      },
      {
        name: 'modelInfo',
        type: 'ModelInfo | null',
        description: 'Resolved available model (may fall back if the slug is missing).',
      },
      {
        name: 'elementInfo',
        type: 'ElementInfo | null',
        description: 'Active element, including layers and HUD options.',
      },
      {
        name: 'layersInfo',
        type: 'WeatherLayersInfo | null',
        description: 'Resolved layer stack for the current selection.',
      },
      {
        name: 'hideLayers',
        type: 'string[]',
        description: 'Layer slugs hidden via config.',
      },
    ],
    example: `const { model, setModel, elementInfo } = useWeatherMap()
setModel('gfs')`,
  },
  {
    id: 'layer-settings-provider',
    name: 'LayerSettingsProvider',
    summary: 'Per-layer rendering settings (image, contours, particles, …).',
    description:
      'Holds user-tunable settings for each rendering type and persists them to storage. LayerComposer reads getLayerState(layer) to decide what to draw. Already mounted inside Providers.',
    importStatement: `import { LayerSettingsProvider } from '@infoplaza/platform/providers'`,
    required: [
      {
        name: 'children',
        type: 'ReactNode',
        description: 'Layer composer, HUD layer panel, or other settings consumers.',
      },
    ],
    optional: [],
    example: `<LayerSettingsProvider>
  <LayerComposer mapComponents={mapComponents}>
    {({ layers }) => <LayerOverlay layers={layers} />}
  </LayerComposer>
</LayerSettingsProvider>`,
  },
  {
    id: 'use-layer-settings',
    name: 'useLayerSettings',
    kind: 'hook',
    summary: 'Read and write per-layer rendering settings.',
    description:
      'Throws outside LayerSettingsProvider. Use getLayerState(layer) for the merged flat settings object that connectors consume. Per-bucket getters and setters (image, values, contour, …) write only that layer.',
    importStatement: `import { useLayerSettings } from '@infoplaza/platform/providers'`,
    notes: [
      'state and actions are the legacy global defaults, used for layers that have not been configured individually.',
      'Settings persist in local storage (state-layer-settings-v1).',
    ],
    required: [],
    optional: [],
    returns: [
      {
        name: 'state',
        type: 'LayerSettingsState',
        description: 'Merged default + global settings (not per-layer).',
      },
      {
        name: 'actions',
        type: 'LegacyLayerActions',
        description: 'Global setters (image opacity, particle count, barb density, …).',
      },
      {
        name: 'getLayerState',
        type: '(layer) => LayerSettingsState',
        description: 'Merged settings for a specific layer. Used by LayerComposer.',
      },
      {
        name: 'getImageState / setImageState / …',
        type: 'function',
        description:
          'Per-bucket reads and writes for IMAGE_V2, VALUES, CONTOURS, CONTOURGEOJSON, DIRECTIONS, BARBS, and GRADES.',
      },
    ],
    example: `const { getLayerState, setImageState } = useLayerSettings()
const settings = getLayerState(layer)
setImageState(layer, { imageOpacity: 0.8 })`,
  },
  {
    id: 'display-settings-provider',
    name: 'DisplaySettingsProvider',
    summary: 'HUD display flags (advanced layer settings, frame skip).',
    description:
      'Persists advanceLayerSettings and frameSkip. LayerComposer uses frameSkip to keep the last valid timestamp visible while the next one loads. Already mounted inside Providers.',
    importStatement: `import { DisplaySettingsProvider } from '@infoplaza/platform/providers'`,
    required: [
      {
        name: 'children',
        type: 'ReactNode',
        description: 'Layer composer or HUD settings consumers.',
      },
    ],
    optional: [],
  },
  {
    id: 'use-display-settings',
    name: 'useDisplaySettings',
    kind: 'hook',
    summary: 'Read and write display flags.',
    description: 'Throws outside DisplaySettingsProvider.',
    importStatement: `import { useDisplaySettings } from '@infoplaza/platform/providers'`,
    required: [],
    optional: [],
    returns: [
      {
        name: 'advanceLayerSettings',
        type: 'boolean',
        defaultValue: 'false',
        description: 'When true, the HUD shows advanced layer controls.',
      },
      {
        name: 'setAdvanceLayerSettings',
        type: '(value: boolean) => void',
        description: 'Persist advanced layer settings.',
      },
      {
        name: 'frameSkip',
        type: 'boolean',
        defaultValue: 'false',
        description:
          'When true, LayerComposer keeps showing the last loaded timestamp while the current one is missing.',
      },
      {
        name: 'setFrameSkip',
        type: '(value: boolean) => void',
        description: 'Persist frame skip.',
      },
      {
        name: 'state',
        type: '{ advanceLayerSettings, frameSkip }',
        description: 'Snapshot of both flags.',
      },
    ],
  },
]
