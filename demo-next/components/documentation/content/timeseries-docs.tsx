import Link from 'next/link'
import { DocsCodeBlock } from '../docs-code-block'
import { INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL } from '../../../lib/infoplaza-platform'
import { Code, DocsExternalLink, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { DocsPackageSection } from '../docs-package-section'
import { TIMESERIES_COMPONENTS, TIMESERIES_IMPORT } from './timeseries'

export function TimeseriesDocs() {
  return (
    <DocsPage
      title="Timeseries"
      packageName="@infoplaza/platform/timeseries"
      description={
        <p className="m-0">
          A portable forecast table for other platforms — no map stack, ImWeather fetch
          layer, or app chrome. The models catalog and point-forecast rows load through
          PlatformAuth. Hosts may still override rows with <Code>blocks</Code> /{' '}
          <Code>getBlocks</Code>. See the{' '}
          <Link href="/demo/timeseries" className="font-medium text-primary">
            timeseries demo
          </Link>
          . See API request counts and token credits in the{' '}
          <DocsExternalLink href={INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL}>
            charts platform example
          </DocsExternalLink>
          .
        </p>
      }
    >
      <DocsGuideSection id="usage" title="Packaged vs composed">
        <p className="m-0">
          Wrap host UI in <Code>ip-platform</Code> when you compose the stack yourself.
          Import only from <Code>@infoplaza/platform/timeseries</Code>.
        </p>
        <DocsCodeBlock>{`<TimeseriesForecast
  lat={52.3676}
  lon={4.9041}
  showToolbar={false}
  showFooter={false}
/>`}</DocsCodeBlock>
        <DocsCodeBlock>{`<TimeseriesModelsProvider lat={52.3676} lon={4.9041}>
  <TimeseriesProvider>
    <TimeseriesToolbar />
    <TimeseriesBuilder>
      <TimeseriesChart />
    </TimeseriesBuilder>
    <TimeseriesFooter />
  </TimeseriesProvider>
</TimeseriesModelsProvider>`}</DocsCodeBlock>
        <p className="m-0">
          Data flow: lat/lon → <Code>GET /api/platform/timeseries-models</Code> → selection
          → <Code>GET /api/platform/timeseries-point-forecast</Code> (unless{' '}
          <Code>blocks</Code> / <Code>getBlocks</Code>) → Builder maps blocks onto Chart.
        </p>
      </DocsGuideSection>

      <DocsPackageSection
        id="timeseries-api"
        title="API"
        packageName="@infoplaza/platform/timeseries"
        description="Compound API. TimeseriesModelsProvider is the only writer of the catalog. TimeseriesProvider loads chart rows by default."
        importStatement={TIMESERIES_IMPORT}
        typesNote={
          <>
            Also exported: <Code>TimeseriesPills</Code>, <Code>ScrollSync</Code>,{' '}
            <Code>TIMESERIES_CELL_VIEWS</Code>, <Code>DEFAULT_TIMESERIES_ELEMENT_GROUPS</Code>,
            hooks <Code>useTimeseries</Code> / <Code>useTimeseriesContext</Code> /{' '}
            <Code>useTimeseriesBlock</Code>, and types such as <Code>TimeseriesBlock</Code>,{' '}
            <Code>TimeseriesRow</Code>, <Code>TimeseriesCell</Code>.
          </>
        }
        items={TIMESERIES_COMPONENTS}
      />
    </DocsPage>
  )
}
