import type { DocsComponent } from '../docs-component-section'

export const LAYERS_IMPORT = `import {
  LayerComposer,
  LayerOverlay,
} from '@infoplaza/platform/layers'`

export const LAYER_EXPORTS: DocsComponent[] = [
  {
    id: 'layer-composer',
    name: 'LayerComposer',
    summary: 'Turns weather map components into Deck.gl layers.',
    description:
      'Reads mapComponents from MapEventsProvider, picks connectors by rendering type (IMAGE_V2, VALUES, PARTICLES, BARBS, DIRECTIONS, CONTOURS, CONTOURGEOJSON, RANGE, STORMTRACKS, PLOT, GRADES), and applies LayerSettingsProvider state. Pass the resulting layers to LayerOverlay. WeatherLayers already wires this.',
    importStatement: `import { LayerComposer } from '@infoplaza/platform/layers'`,
    notes: [
      'Must be rendered inside Providers (needs useLayerSettings, useDisplaySettings, and timestamp context).',
      'beforeId should match PlatformMap / usePlatformMap().beforeId so labels stay above weather.',
      'When frameSkip is on, the last valid timestamp and last rendered layers are kept while the next payload loads.',
    ],
    required: [
      {
        name: 'children',
        type: '(args: { layers: Layer[] }) => ReactNode',
        description: 'Render prop. layers is the Deck.gl layer list to pass to LayerOverlay.',
      },
    ],
    optional: [
      {
        name: 'mapComponents',
        type: 'Record<number, unknown[]>',
        description:
          'Timestamp → layer descriptors from MapEventsProvider. When omitted or empty, no weather layers are produced (unless frameSkip keeps the previous list).',
      },
      {
        name: 'beforeId',
        type: 'string',
        description:
          'MapLibre layer id forwarded to connectors so interleaved weather inserts under labels and borders.',
      },
    ],
    example: `<MapEventsProvider>
  {(mapComponents) => (
    <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
      {({ layers }) => (
        <LayerOverlay layers={layers} interleaved beforeId={beforeId} />
      )}
    </LayerComposer>
  )}
</MapEventsProvider>`,
  },
  {
    id: 'layer-overlay',
    name: 'LayerOverlay',
    summary: 'Deck.gl overlay on the MapLibre map.',
    description:
      'Mounts a MapLibreOverlay with the layers from LayerComposer. When interleaved is true, weather is inserted into the basemap style under beforeId so place names stay on top. Overlay is the same component under another name.',
    importStatement: `import { LayerOverlay } from '@infoplaza/platform/layers'`,
    notes: [
      'Must be a child of PlatformMap (or any react-map-gl Map). It uses useMap / useControl.',
      'import { Overlay } from "@infoplaza/platform/layers" is an alias of LayerOverlay.',
      'Also exported from @infoplaza/platform/layers/overlay and @infoplaza/platform/layers/composer.',
    ],
    required: [
      {
        name: 'layers',
        type: 'Layer[]',
        description: 'Deck.gl layers from LayerComposer (or your own).',
      },
    ],
    optional: [
      {
        name: 'interleaved',
        type: 'boolean',
        defaultValue: 'true',
        description:
          'When true, layers are inserted into the MapLibre style. When false, Deck.gl draws on top of the map.',
      },
      {
        name: 'beforeId',
        type: 'string',
        description:
          'MapLibre layer id to insert weather under. Required for correct interleaved order; if it cannot be resolved, interleaved layers are skipped rather than drawn above labels.',
      },
      {
        name: 'controller',
        type: 'boolean',
        description:
          'Forwarded to the Deck.gl overlay. When true, the overlay participates in pointer interaction and picking.',
      },
    ],
    example: `<LayerOverlay
  layers={layers}
  interleaved
  controller
  beforeId={beforeId}
/>`,
  },
]
