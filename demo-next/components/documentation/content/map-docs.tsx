import { DocsPackageSection } from '../docs-package-section'
import { DocsPage } from '../docs-page'
import { DocsExternalLink } from '../docs-inline'
import { EVENT_EXPORTS, EVENTS_IMPORT } from './events'
import { LAYER_EXPORTS, LAYERS_IMPORT } from './layers'
import { MAP_COMPONENTS, MAP_COMPONENTS_IMPORT, MAP_DEPRECATED_COMPONENTS } from './map-components'
import { PROVIDER_EXPORTS, PROVIDERS_IMPORT } from './providers'
import { INFOPLAZA_PLATFORM_EXAMPLES_MAPS_URL } from '../../../lib/infoplaza-platform'

export function MapComponentsDocs() {
  return (
    <DocsPage
      title="Map"
      description={
        <p className="m-0">
          The map stack is split across four packages. New integrations should
          use <code className="font-mono text-xs">PlatformMap</code> with{' '}
          <code className="font-mono text-xs">WeatherLayers</code>, which already
          mounts providers, events, and the layer overlay. The composed APIs
          below are for hosts that need to wire the stack themselves. See API
          request counts and token credits in the{' '}
          <DocsExternalLink href={INFOPLAZA_PLATFORM_EXAMPLES_MAPS_URL}>
            maps platform example
          </DocsExternalLink>
          .
        </p>
      }
    >
      <DocsPackageSection
        id="map-components"
        title="Components"
        packageName="@infoplaza/platform/components"
        description="MapLibre shell, packaged weather stack, and control HUD."
        importStatement={MAP_COMPONENTS_IMPORT}
        typesNote={
          <>
            Also exported as types:{' '}
            <code className="font-mono text-xs">PlatformMapProps</code>,{' '}
            <code className="font-mono text-xs">PlatformMapLoadPayload</code>,{' '}
            <code className="font-mono text-xs">WeatherLayersProps</code>,{' '}
            <code className="font-mono text-xs">MapControlHudProps</code>,{' '}
            <code className="font-mono text-xs">MapStyle</code>,{' '}
            <code className="font-mono text-xs">BaseMapStyle</code>,{' '}
            <code className="font-mono text-xs">MapStyleVariant</code>.
          </>
        }
        items={MAP_COMPONENTS}
      />

      <DocsPackageSection
        id="map-providers"
        title="Providers"
        packageName="@infoplaza/platform/providers"
        description="Context tree and hooks for map, models, weather selection, layer settings, and display flags. WeatherLayers mounts Providers for you."
        importStatement={PROVIDERS_IMPORT}
        typesNote={
          <>
            Also exported: <code className="font-mono text-xs">PlatformMapContext</code>,{' '}
            <code className="font-mono text-xs">ModelsContext</code>,{' '}
            <code className="font-mono text-xs">WeatherMapContext</code>, and types{' '}
            <code className="font-mono text-xs">PlatformMapContextValue</code>,{' '}
            <code className="font-mono text-xs">PlatformMapStyleVariantName</code>.
          </>
        }
        items={PROVIDER_EXPORTS}
      />

      <DocsPackageSection
        id="map-layers"
        title="Layers"
        packageName="@infoplaza/platform/layers"
        description="Deck.gl pipeline: compose weather descriptors into layers, then overlay them on the MapLibre map."
        importStatement={LAYERS_IMPORT}
        typesNote={
          <>
            <code className="font-mono text-xs">Overlay</code> is an alias of{' '}
            <code className="font-mono text-xs">LayerOverlay</code>. Deep imports{' '}
            <code className="font-mono text-xs">@infoplaza/platform/layers/composer</code> and{' '}
            <code className="font-mono text-xs">@infoplaza/platform/layers/overlay</code> are also
            available.
          </>
        }
        items={LAYER_EXPORTS}
      />

      <DocsPackageSection
        id="map-events"
        title="Events"
        packageName="@infoplaza/platform/events"
        description="Fetches weather layer payloads and textures for the current map view. MapEventsProvider picks a handler from the active model unless you override it."
        importStatement={EVENTS_IMPORT}
        typesNote={
          <>
            <code className="font-mono text-xs">EventHandlerType</code> is{' '}
            <code className="font-mono text-xs">&apos;simple&apos; | &apos;demand&apos; | &apos;nowcast&apos;</code>.
          </>
        }
        items={EVENT_EXPORTS}
      />

      <DocsPackageSection
        id="deprecated"
        title="Deprecated"
        description="Still exported and supported, but not recommended for new integrations."
        items={MAP_DEPRECATED_COMPONENTS}
      />
    </DocsPage>
  )
}
