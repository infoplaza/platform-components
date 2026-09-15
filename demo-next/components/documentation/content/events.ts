import type { DocsComponent } from '../docs-component-section'

export const EVENTS_IMPORT = `import MapEventsProvider, {
  useEventHandlerType,
  DemandEventsProvider,
  SimpleEventsProvider,
  NowcastEventsProvider,
} from '@infoplaza/platform/events'
import type { EventHandlerType } from '@infoplaza/platform/events'`

export const EVENT_EXPORTS: DocsComponent[] = [
  {
    id: 'map-events-provider',
    name: 'MapEventsProvider',
    summary: 'Fetches weather layer payloads and textures for the current view.',
    description:
      'Chooses a handler (demand, simple, or nowcast) from the active model unless you pass handler, then loads layer URLs and textures keyed by timestamp. The render-prop argument is the mapComponents object LayerComposer expects. WeatherLayers already mounts this.',
    importStatement: `import MapEventsProvider from '@infoplaza/platform/events'`,
    notes: [
      'Must be inside Providers (weather + timestamps) and PlatformMap (MapLibre map).',
      'Also available as a named export: import { MapEventsProvider } from "@infoplaza/platform/events".',
      'Handler resolution when handler is omitted: nowcast models → nowcast; regional (non-global) models and observations → simple; global / nowcast-like types → demand; otherwise demand.',
    ],
    required: [
      {
        name: 'children',
        type: '(mapComponents: Record<number, unknown[]>) => ReactNode',
        description:
          'Render prop. mapComponents maps unix timestamps to layer descriptors for LayerComposer.',
      },
    ],
    optional: [
      {
        name: 'handler',
        type: `'simple' | 'demand' | 'nowcast'`,
        description:
          'Force a handler. When omitted, useEventHandlerType() picks one from the active model and element.',
      },
    ],
    relatedTypes: [
      {
        name: 'EventHandlerType',
        description: 'Handler ids exported from @infoplaza/platform/events.',
        fields: [
          {
            name: 'demand',
            type: `'demand'`,
            description:
              'Viewport-driven fetches, debounced on map move. Used for global models and several special types.',
          },
          {
            name: 'simple',
            type: `'simple'`,
            description:
              'Fixed viewport URL, preloads all timestamps. Used for regional models and observations.',
          },
          {
            name: 'nowcast',
            type: `'nowcast'`,
            description: 'Nowcast texture pipeline with viewport-driven fetches on map move.',
          },
        ],
      },
    ],
    example: `<MapEventsProvider handler="demand">
  {(mapComponents) => (
    <LayerComposer beforeId={beforeId} mapComponents={mapComponents}>
      {({ layers }) => <LayerOverlay layers={layers} interleaved />}
    </LayerComposer>
  )}
</MapEventsProvider>`,
  },
  {
    id: 'use-event-handler-type',
    name: 'useEventHandlerType',
    kind: 'hook',
    summary: 'Resolves which map event handler to use.',
    description:
      'Returns the override if you pass one; otherwise inspects the active model (format, regionCategory) and element slug. Must be used inside WeatherMapProvider.',
    importStatement: `import { useEventHandlerType } from '@infoplaza/platform/events'`,
    required: [],
    optional: [
      {
        name: 'override',
        type: `'simple' | 'demand' | 'nowcast'`,
        description: 'Force this handler instead of resolving from the model.',
      },
    ],
    returns: [
      {
        name: '(return)',
        type: `'simple' | 'demand' | 'nowcast'`,
        description: 'Handler id. Defaults to demand when no rule matches.',
      },
    ],
    example: `const handler = useEventHandlerType()
const forced = useEventHandlerType('simple')`,
  },
  {
    id: 'demand-events-provider',
    name: 'DemandEventsProvider',
    summary: 'Viewport-driven forecast layer fetches.',
    description:
      'Loads layer URLs from the current map bounds, debounced on move, then fetches forecast textures per timestamp. MapEventsProvider selects this for global models and several special types. Prefer MapEventsProvider unless you need to pin this handler.',
    importStatement: `import { DemandEventsProvider } from '@infoplaza/platform/events'`,
    notes: [
      'Must be inside Providers and a react-map-gl Map (uses useMap).',
      'Same children render prop as MapEventsProvider. No handler prop — this is the handler.',
    ],
    required: [
      {
        name: 'children',
        type: '(mapComponents: Record<number, unknown[]>) => ReactNode',
        description: 'Same as MapEventsProvider children.',
      },
    ],
    optional: [],
    example: `<DemandEventsProvider>
  {(mapComponents) => (
    <LayerComposer mapComponents={mapComponents}>
      {({ layers }) => <LayerOverlay layers={layers} />}
    </LayerComposer>
  )}
</DemandEventsProvider>`,
  },
  {
    id: 'simple-events-provider',
    name: 'SimpleEventsProvider',
    summary: 'Fixed-viewport forecast fetches with full preload.',
    description:
      'Builds layer URLs without tracking map move, and preloads all timestamps. MapEventsProvider selects this for regional (non-global) models and the observations element. Prefer MapEventsProvider unless you need to pin this handler.',
    importStatement: `import { SimpleEventsProvider } from '@infoplaza/platform/events'`,
    required: [
      {
        name: 'children',
        type: '(mapComponents: Record<number, unknown[]>) => ReactNode',
        description: 'Same as MapEventsProvider children.',
      },
    ],
    optional: [],
    example: `<SimpleEventsProvider>
  {(mapComponents) => (
    <LayerComposer mapComponents={mapComponents}>
      {({ layers }) => <LayerOverlay layers={layers} />}
    </LayerComposer>
  )}
</SimpleEventsProvider>`,
  },
  {
    id: 'nowcast-events-provider',
    name: 'NowcastEventsProvider',
    summary: 'Viewport-driven nowcast texture pipeline.',
    description:
      'Like demand, but uses the nowcast texture loader. MapEventsProvider selects this when the model format is nowcast. Prefer MapEventsProvider unless you need to pin this handler.',
    importStatement: `import { NowcastEventsProvider } from '@infoplaza/platform/events'`,
    notes: [
      'Must be inside Providers and a react-map-gl Map (uses useMap).',
    ],
    required: [
      {
        name: 'children',
        type: '(mapComponents: Record<number, unknown[]>) => ReactNode',
        description: 'Same as MapEventsProvider children.',
      },
    ],
    optional: [],
    example: `<NowcastEventsProvider>
  {(mapComponents) => (
    <LayerComposer mapComponents={mapComponents}>
      {({ layers }) => <LayerOverlay layers={layers} />}
    </LayerComposer>
  )}
</NowcastEventsProvider>`,
  },
]
