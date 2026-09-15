import { DocsCodeBlock } from '../docs-code-block'
import { Code, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { DocsPropTable } from '../docs-prop-table'

export function MapStylesDocs() {
  return (
    <DocsPage
      title="Map styles"
      packageName="@infoplaza/platform/defaults"
      description={
        <p className="m-0">
          <Code>PlatformMap</Code> / <Code>BaseMap</Code> control the MapLibre basemap
          through a structured map-style system instead of a single style URL. A map style
          bundles the basemap source(s) and the <Code>beforeId</Code> that weather layers
          should be inserted under, so data layers always render below the right labels.
        </p>
      }
    >
      <DocsGuideSection id="shape" title="Shape of a map style">
        <DocsCodeBlock>{`import type { MapStyle } from '@infoplaza/platform/defaults'

const myStyle: MapStyle = {
  key: 'dark',
  title: 'Dark',
  styles: {
    default: {
      source: 'https://maps.example.com/styles/dark/style.json',
      beforeId: 'lakes-transparent',
    },
    marine: {
      source: 'https://maps.example.com/styles/dark-marine/style.json',
      beforeId: 'landcover',
    },
  },
}`}</DocsCodeBlock>
        <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
          <li>
            <Code>source</Code> is a MapLibre style URL or an inline style object.
          </li>
          <li>
            <Code>beforeId</Code> is the basemap layer id weather is placed under.{' '}
            <Code>PlatformMap</Code> exposes it via the render prop and{' '}
            <Code>usePlatformMap().beforeId</Code>. If omitted, the shell falls back to{' '}
            <Code>DEFAULT_WEATHER_BEFORE_ID</Code> (<Code>lakes-transparent</Code>).
          </li>
          <li>
            Pick a layer that sits above land/water fills so place names, rivers, and
            borders stay on top of the weather raster.
          </li>
        </ul>
      </DocsGuideSection>

      <DocsGuideSection id="selecting" title="Selecting a style">
        <p className="m-0">
          <Code>PlatformMap</Code> resolves the active style in this order:
        </p>
        <ol className="m-0 flex list-decimal flex-col gap-2 pl-5">
          <li>
            <Code>style</Code> — raw MapLibre URL or object. Overrides everything else.
          </li>
          <li>
            <Code>mapStyle</Code> — explicit <Code>BaseMapStyle</Code>. Takes precedence
            over <Code>mapStyleKey</Code>.
          </li>
          <li>
            <Code>mapStyleKey</Code> — selects an entry by <Code>key</Code> from{' '}
            <Code>mapStyles</Code>.
          </li>
          <li>Fallback — the first entry of <Code>mapStyles</Code>.</li>
        </ol>
        <p className="m-0">
          Within the selected style, <Code>styleVariant</Code> (<Code>default</Code> |{' '}
          <Code>marine</Code>) picks the variant. <Code>Providers</Code> (under{' '}
          <Code>PlatformMap</Code>) and <Code>BaseMap</Code> set marine automatically for
          wave/ocean models.
        </p>
        <DocsCodeBlock>{`<PlatformMap mapStyles={MAP_STYLES} mapStyleKey="dark" viewState={viewState}>
  {({ beforeId }) => /* … */}
</PlatformMap>`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="built-in" title="Built-in styles">
        <p className="m-0">
          <Code>MAP_STYLES</Code> from <Code>@infoplaza/platform/defaults</Code>. Also
          exported: <Code>DEFAULT_WEATHER_BEFORE_ID</Code> (<Code>lakes-transparent</Code>),{' '}
          <Code>DEFAULT_MARINE_WEATHER_BEFORE_ID</Code> (<Code>landcover</Code>),{' '}
          <Code>TRAFFIC_WEATHER_BEFORE_ID</Code> (<Code>water-intermittent</Code>).
        </p>
        <DocsPropTable
          title="MAP_STYLES"
          nameColumn="key"
          props={[
            {
              name: 'dark',
              type: 'Dark',
              description: 'Dark basemap. default beforeId lakes-transparent; marine landcover.',
            },
            {
              name: 'land',
              type: 'Land',
              description: 'Land-focused basemap. Same beforeIds as dark.',
            },
            {
              name: 'sea',
              type: 'Sea',
              description: 'Sea-focused basemap. Same beforeIds as dark.',
            },
            {
              name: 'traffic',
              type: 'Traffic',
              description:
                'Traffic basemap. default beforeId water-intermittent; marine landcover.',
            },
          ]}
        />
      </DocsGuideSection>

      <DocsGuideSection id="extend" title="Extending the built-in styles">
        <DocsCodeBlock>{`import { PlatformMap } from '@infoplaza/platform/components'
import { MAP_STYLES } from '@infoplaza/platform/defaults'

const customStyle = {
  key: 'demotiles',
  title: 'MapLibre Demo',
  styles: {
    default: { source: 'https://demotiles.maplibre.org/style.json', beforeId: '' },
    marine: { source: 'https://demotiles.maplibre.org/style.json', beforeId: '' },
  },
}

const mapStyles = [...MAP_STYLES, customStyle]

<PlatformMap mapStyles={mapStyles} mapStyleKey="demotiles" viewState={viewState} />`}</DocsCodeBlock>
      </DocsGuideSection>
    </DocsPage>
  )
}
