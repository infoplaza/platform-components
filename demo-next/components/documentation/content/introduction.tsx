import Link from 'next/link'
import { DocsCodeBlock } from '../docs-code-block'
import { Code, DocsCallout, DocsExternalLink, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { DocsPropTable } from '../docs-prop-table'
import {
  INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL,
  INFOPLAZA_PLATFORM_EXAMPLES_MAPS_URL,
  INFOPLAZA_PLATFORM_EXAMPLES_URL,
  INFOPLAZA_PLATFORM_INTRO_URL,
} from '../../../lib/infoplaza-platform'

export function IntroductionDocs() {
  return (
    <DocsPage
      title="Introduction"
      packageName="@infoplaza/platform"
      description={
        <p className="m-0">
          React components and providers for Infoplaza weather on a MapLibre map, plus a
          portable timeseries forecast table, timeseries charts, and ensemble plume charts.{' '}
          <Code>PlatformMap</Code> is the general map shell; weather is optional via{' '}
          <Code>WeatherLayers</Code>.
        </p>
      }
    >
      <DocsGuideSection id="what" title="What you get">
        <p className="m-0">
          Four sibling products, one package. Import each from its own entry point — do
          not nest timeseries, timeseries charts, or ensemble under the map barrel.
        </p>
        <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
          <li>
            <Link href="/documentation/map" className="font-medium text-primary">
              Map
            </Link>{' '}
            — <Code>PlatformMap</Code> ± <Code>WeatherLayers</Code> (providers, events, Deck
            overlay, HUD).
          </li>
          <li>
            <Link href="/documentation/timeseries" className="font-medium text-primary">
              Timeseries
            </Link>{' '}
            — location-aware forecast table. Catalog and rows load through PlatformAuth.
          </li>
          <li>
            <Link href="/documentation/timeseries-charts" className="font-medium text-primary">
              Timeseries charts
            </Link>{' '}
            — Recharts LINE / DIRECTION / VALUE / PRECIPITATION_TYPE charts from the same timeseries catalog.
          </li>
          <li>
            <Link href="/documentation/ensemble" className="font-medium text-primary">
              Ensemble
            </Link>{' '}
            — plume / line / bar charts from the ensemble catalog.
          </li>
        </ul>
      </DocsGuideSection>

      <DocsGuideSection id="need" title="What you need">
        <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
          <li>A React 18 or 19 application.</li>
          <li>
            An API token from the{' '}
            <DocsExternalLink href={INFOPLAZA_PLATFORM_INTRO_URL}>
              Infoplaza developer platform
            </DocsExternalLink>
            , plus the platform auth route mounted on your server with{' '}
            <Code>PLATFORM_API_KEY</Code> — this powers the internal models and forecast
            requests. See{' '}
            <Link href="/documentation/auth" className="font-medium text-primary">
              Server setup
            </Link>
            .
          </li>
          <li>
            For maps: a MapLibre style (built-in <Code>MAP_STYLES</Code> or your own) and
            MapLibre 6 worker wiring. See{' '}
            <Link href="/documentation/maplibre" className="font-medium text-primary">
              MapLibre 6
            </Link>
            .
          </li>
          <li>
            Package styles imported once:{' '}
            <Code>@infoplaza/platform/styles.css</Code> or{' '}
            <Code>styles.embed.css</Code> in a Tailwind host. See{' '}
            <Link href="/documentation/styling" className="font-medium text-primary">
              Styling
            </Link>
            .
          </li>
          <li>
            MapLibre CSS imported once: <Code>maplibre-gl/dist/maplibre-gl.css</Code>.
          </li>
        </ul>
      </DocsGuideSection>

      <DocsGuideSection id="entry-points" title="Entry points">
        <p className="m-0">
          Prefer the subpath that matches the product. The top-level{' '}
          <Code>@infoplaza/platform</Code> barrel re-exports map components, providers,
          layers, and defaults — not auth, events, timeseries, timeseries charts, ensemble, or CSS.
        </p>
        <DocsPropTable
          title="Imports"
          nameColumn="Import"
          props={[
            {
              name: '@infoplaza/platform',
              type: 'barrel',
              description:
                'Top-level API: PlatformMap, WeatherLayers, providers, LayerComposer / LayerOverlay, MAP_STYLES.',
            },
            {
              name: '@infoplaza/platform/components',
              type: 'map',
              description: 'PlatformMap, WeatherLayers, BaseMap, MapControlHud.',
            },
            {
              name: '@infoplaza/platform/providers',
              type: 'map',
              description: 'Providers, usePlatformMap, useModels, useProviders.',
            },
            {
              name: '@infoplaza/platform/defaults',
              type: 'map',
              description: 'MAP_STYLES, MapStyle type, beforeId constants.',
            },
            {
              name: '@infoplaza/platform/auth',
              type: 'server',
              description: 'PlatformAuth catch-all route handler.',
            },
            {
              name: '@infoplaza/platform/events',
              type: 'map',
              description: 'MapEventsProvider.',
            },
            {
              name: '@infoplaza/platform/layers',
              type: 'map',
              description: 'LayerComposer, LayerOverlay. Deep imports /composer and /overlay.',
            },
            {
              name: '@infoplaza/platform/timeseries',
              type: 'table',
              description: 'TimeseriesForecast, models/provider, toolbar, builder, chart, footer.',
            },
            {
              name: '@infoplaza/platform/timeseries-charts',
              type: 'charts',
              description: 'TimeseriesChartsForecast, models/provider, toolbar, builder, chart, graph.',
            },
            {
              name: '@infoplaza/platform/ensemble',
              type: 'charts',
              description: 'EnsembleForecast, models/provider, toolbar, builder, chart, graph.',
            },
            {
              name: '@infoplaza/platform/styles.css',
              type: 'css',
              description: 'Full stylesheet including Tailwind preflight — standalone apps.',
            },
            {
              name: '@infoplaza/platform/styles.embed.css',
              type: 'css',
              description: 'Prefixed utilities only, no preflight — Tailwind hosts.',
            },
          ]}
        />
      </DocsGuideSection>

      <DocsCallout>
        Weather models are fetched internally by <Code>Providers</Code> /{' '}
        <Code>WeatherLayers</Code>. Timeseries and ensemble catalogs load the same way.
        You must create an API token and mount the auth route — without them, maps,
        tables, and charts will not load data.
      </DocsCallout>

      <DocsGuideSection id="next" title="Next steps">
        <ol className="m-0 flex list-decimal flex-col gap-2 pl-5">
          <li>
            <Link href="/documentation/install" className="font-medium text-primary">
              Install
            </Link>{' '}
            the package and peer <Code>maplibre-gl</Code>.
          </li>
          <li>
            <DocsExternalLink href={INFOPLAZA_PLATFORM_INTRO_URL}>
              Create an API token
            </DocsExternalLink>{' '}
            on the Infoplaza developer platform.
          </li>
          <li>
            Mount{' '}
            <Link href="/documentation/auth" className="font-medium text-primary">
              PlatformAuth
            </Link>{' '}
            with <Code>PLATFORM_API_KEY</Code>.
          </li>
          <li>
            Follow the{' '}
            <Link href="/documentation/quick-start" className="font-medium text-primary">
              Quick start
            </Link>{' '}
            for a map, or jump to timeseries / ensemble.
          </li>
          <li>
            See live API request counts and token credits in the{' '}
            <DocsExternalLink href={INFOPLAZA_PLATFORM_EXAMPLES_URL}>
              platform examples
            </DocsExternalLink>
            :{' '}
            <DocsExternalLink href={INFOPLAZA_PLATFORM_EXAMPLES_MAPS_URL}>
              maps
            </DocsExternalLink>{' '}
            and{' '}
            <DocsExternalLink href={INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL}>
              charts
            </DocsExternalLink>{' '}
            (timeseries and ensemble).
          </li>
        </ol>
        <DocsCodeBlock>{`npm install @infoplaza/platform maplibre-gl`}</DocsCodeBlock>
      </DocsGuideSection>
    </DocsPage>
  )
}
