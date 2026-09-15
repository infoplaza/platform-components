import Link from 'next/link'
import { DocsCodeBlock } from '../docs-code-block'
import { Code, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'

export function MigrationDocs() {
  return (
    <DocsPage
      title="Migration"
      description={
        <p className="m-0">
          The hand-wired composition remains supported (see the Composed example on the{' '}
          <Link href="/demo" className="font-medium text-primary">
            map demo
          </Link>
          ). New integrations should use <Code>PlatformMap</Code> +{' '}
          <Code>WeatherLayers</Code>.
        </p>
      }
    >
      <DocsGuideSection id="before" title="Before (still works)">
        <DocsCodeBlock>{`import { BaseMap, MapControlHud } from '@infoplaza/platform/components'
import { MAP_STYLES } from '@infoplaza/platform/defaults'
import { Providers } from '@infoplaza/platform/providers'
import { LayerComposer, LayerOverlay } from '@infoplaza/platform/layers'
import MapEventsProvider from '@infoplaza/platform/events'

<Providers>
  <BaseMap viewState={viewState} onMove={onMove} mapStyles={MAP_STYLES} mapStyleKey="dark">
    {({ beforeId }) => (
      <>
        <MapEventsProvider handler="demand">
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
</Providers>`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="after" title="After (recommended)">
        <DocsCodeBlock>{`import { PlatformMap, WeatherLayers } from '@infoplaza/platform/components'
import { MAP_STYLES } from '@infoplaza/platform/defaults'

<PlatformMap viewState={viewState} onMove={onMove} mapStyles={MAP_STYLES} mapStyleKey="dark">
  <WeatherLayers handler="demand" showHud />
</PlatformMap>`}</DocsCodeBlock>
        <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
          <li>Auth route / <Code>PLATFORM_API_KEY</Code> unchanged.</li>
          <li>
            <Code>Providers</Code> moves inside <Code>WeatherLayers</Code> — do not wrap{' '}
            <Code>PlatformMap</Code> in an outer <Code>Providers</Code> as well.
          </li>
          <li>
            Feature layers that need the MapLibre instance use <Code>usePlatformMap()</Code>{' '}
            (returns <Code>{'{ map, beforeId, … }'}</Code>).
          </li>
          <li>
            Toggle weather on a feature map by mounting/unmounting{' '}
            <Code>WeatherLayers</Code> (no models fetch when unmounted).
          </li>
          <li>Old path remains supported; no forced upgrade.</li>
        </ul>
      </DocsGuideSection>
    </DocsPage>
  )
}
