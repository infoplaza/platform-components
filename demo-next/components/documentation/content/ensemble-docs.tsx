import Link from 'next/link'
import { DocsCodeBlock } from '../docs-code-block'
import { INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL } from '../../../lib/infoplaza-platform'
import { Code, DocsExternalLink, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { DocsPackageSection } from '../docs-package-section'
import { ENSEMBLE_COMPONENTS, ENSEMBLE_IMPORT } from './ensemble'

export function EnsembleDocs() {
  return (
    <DocsPage
      title="Ensemble"
      packageName="@infoplaza/platform/ensemble"
      description={
        <p className="m-0">
          A portable ensemble forecast chart — Recharts plume, line, and bar graphs —
          without the map stack or app chrome. The models catalog loads through PlatformAuth
          (<Code>GET /api/platform/ensemble-models</Code>). Chart series load from{' '}
          <Code>GET /api/platform/ensemble-point-forecast</Code> unless the host passes{' '}
          <Code>charts</Code> / <Code>getCharts</Code>. See the{' '}
          <Link href="/demo/ensemble" className="font-medium text-primary">
            ensemble demo
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
          Sibling product to timeseries and the map. Import only from{' '}
          <Code>@infoplaza/platform/ensemble</Code>.
        </p>
        <DocsCodeBlock>{`<EnsembleForecast
  lat={52.3676}
  lon={4.9041}
  showToolbar={false}
  showFooter={false}
/>`}</DocsCodeBlock>
        <DocsCodeBlock>{`<EnsembleModelsProvider lat={52.3676} lon={4.9041}>
  <EnsembleProvider>
    <EnsembleToolbar />
    <EnsembleBuilder>
      <EnsembleChart />
    </EnsembleBuilder>
    <EnsembleFooter />
  </EnsembleProvider>
</EnsembleModelsProvider>`}</DocsCodeBlock>
        <p className="m-0">
          Default model when omitted: <Code>ecmwfensembleglobal</Code> if it is in the
          catalog (<Code>DEFAULT_ENSEMBLE_MODEL</Code>), otherwise the first catalog model.
        </p>
      </DocsGuideSection>

      <DocsPackageSection
        id="ensemble-api"
        title="API"
        packageName="@infoplaza/platform/ensemble"
        description="Compound API. EnsembleModelsProvider is the only writer of the catalog. EnsembleProvider loads charts by default and adds a basic / expert view."
        importStatement={ENSEMBLE_IMPORT}
        typesNote={
          <>
            Also exported: <Code>DEFAULT_ENSEMBLE_ELEMENT_GROUPS</Code>,{' '}
            <Code>DEFAULT_ENSEMBLE_MODEL</Code>, <Code>ENSEMBLE_TIMESERIES</Code>, hooks{' '}
            <Code>useEnsemble</Code> / <Code>useEnsembleContext</Code> /{' '}
            <Code>useEnsembleChartBlock</Code>, and types such as{' '}
            <Code>EnsembleChartBlock</Code>, <Code>EnsembleGraphConfig</Code>,{' '}
            <Code>EnsembleView</Code>.
          </>
        }
        items={ENSEMBLE_COMPONENTS}
      />
    </DocsPage>
  )
}
