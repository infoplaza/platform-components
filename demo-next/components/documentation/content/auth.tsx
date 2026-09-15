import { DocsCodeBlock } from '../docs-code-block'
import { Code, DocsCallout, DocsExternalLink, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { DocsPropTable } from '../docs-prop-table'
import {
  INFOPLAZA_PLATFORM_EXAMPLES_URL,
  INFOPLAZA_PLATFORM_INTRO_URL,
} from '../../../lib/infoplaza-platform'

export function AuthDocs() {
  return (
    <DocsPage
      title="Server setup"
      packageName="@infoplaza/platform/auth"
      description={
        <p className="m-0">
          <Code>Providers</Code>, timeseries, and ensemble load data by calling{' '}
          <Code>/api/platform/*</Code> on <strong>your</strong> server. That route proxies
          to the Infoplaza API with your secret key. Mount <Code>PlatformAuth</Code> once
          on a catch-all — every platform endpoint is served automatically. The browser
          never sees the key.
        </p>
      }
    >
      <DocsCallout>
        Create an API token on the{' '}
        <DocsExternalLink href={INFOPLAZA_PLATFORM_INTRO_URL}>
          Infoplaza developer platform
        </DocsExternalLink>{' '}
        first, then mount this handler. Without a token and this route,{' '}
        <Code>GET /api/platform/models</Code> (and the timeseries / ensemble catalog and
        point-forecast routes) do not exist, so weather layers and forecast tables will
        not load. To see API request counts and token credit cost in a host app, open the{' '}
        <DocsExternalLink href={INFOPLAZA_PLATFORM_EXAMPLES_URL}>
          platform examples
        </DocsExternalLink>
        .
      </DocsCallout>

      <DocsGuideSection id="create-token" title="Create an API token">
        <p className="m-0">
          API keys are created and managed on the{' '}
          <DocsExternalLink href={INFOPLAZA_PLATFORM_INTRO_URL}>
            Infoplaza developer platform
          </DocsExternalLink>
          . Copy the token into <Code>PLATFORM_API_KEY</Code> on your server. Without a
          token, <Code>/api/platform/*</Code> cannot proxy weather, timeseries, or ensemble
          data.
        </p>
      </DocsGuideSection>

      <DocsGuideSection id="app-router" title="App Router">
        <p className="m-0">
          Create <Code>app/api/platform/[...platform]/route.ts</Code>:
        </p>
        <DocsCodeBlock>{`import PlatformAuth from '@infoplaza/platform/auth'

const apiKey = process.env.PLATFORM_API_KEY
if (!apiKey) {
  throw new Error('PLATFORM_API_KEY environment variable is not set')
}

const handler = PlatformAuth({ apiKey })

export { handler as GET, handler as POST }`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="pages-router" title="Pages Router">
        <p className="m-0">
          Create <Code>pages/api/platform/[...platform].ts</Code>:
        </p>
        <DocsCodeBlock>{`import PlatformAuth from '@infoplaza/platform/auth'

export default PlatformAuth({ apiKey: process.env.PLATFORM_API_KEY! })`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="options" title="Options">
        <p className="m-0">
          Only <Code>apiKey</Code> is required. Import type{' '}
          <Code>PlatformAuthOptions</Code> from <Code>@infoplaza/platform/auth</Code>.
        </p>
        <DocsPropTable
          title="PlatformAuthOptions"
          nameColumn="Option"
          props={[
            {
              name: 'apiKey',
              type: 'string',
              description: 'Secret key attached to every proxied upstream request. Required.',
            },
            {
              name: 'baseUrl',
              type: 'string',
              defaultValue: "'https://api.infoplaza.com/weather/v1'",
              description: 'Upstream API that map /models requests are proxied to.',
            },
            {
              name: 'basePath',
              type: 'string',
              defaultValue: "'/api/platform'",
              description:
                'Public path this handler is mounted on. Used to resolve the endpoint segment.',
            },
            {
              name: 'apiKeyQueryParam',
              type: 'string',
              defaultValue: "'token'",
              description:
                "Query param the key is sent as for map /models. Set to '' to use header auth instead.",
            },
            {
              name: 'apiKeyHeader',
              type: 'string',
              defaultValue: "'Authorization'",
              description: 'Header used when apiKeyQueryParam is falsy.',
            },
            {
              name: 'apiKeyScheme',
              type: '(apiKey) => string',
              defaultValue: '`Bearer ${apiKey}`',
              description: 'Formats the header value when using header auth.',
            },
            {
              name: 'timeseriesBaseUrl',
              type: 'string',
              description:
                'Upstream for timeseries-models and timeseries-point-forecast. If baseUrl contains /weather/maps, it is swapped to /weather/timeseries; otherwise a product default is used.',
            },
            {
              name: 'ensembleBaseUrl',
              type: 'string',
              description:
                'Upstream for ensemble-models and ensemble-point-forecast. Same path-swap rules as timeseries, targeting /weather/ensemble.',
            },
          ]}
        />
        <p className="m-0">
          Map requests send the key as <Code>?token=</Code> by default. Timeseries and
          ensemble handlers send <Code>?api_key=</Code> regardless of{' '}
          <Code>apiKeyQueryParam</Code>.
        </p>
      </DocsGuideSection>

      <DocsGuideSection id="endpoints" title="Proxied endpoints">
        <p className="m-0">
          Unknown first segments return <Code>404</Code>. New endpoints added to the
          package appear on this catch-all without extra route files.
        </p>
        <DocsPropTable
          title="Routes"
          nameColumn="Path"
          props={[
            {
              name: 'GET /models',
              type: 'maps',
              description: 'Weather models catalog for the map stack.',
            },
            {
              name: 'GET /timeseries-models',
              type: 'timeseries',
              description: 'Requires lat and lon. Location-filtered forecast catalog.',
            },
            {
              name: 'GET /timeseries-point-forecast',
              type: 'timeseries',
              description:
                'Requires lat, lon, model, elements, and levels. Optional runtime, units, members.',
            },
            {
              name: 'GET /ensemble-models',
              type: 'ensemble',
              description: 'Requires lat and lon together if either is present.',
            },
            {
              name: 'GET /ensemble-point-forecast',
              type: 'ensemble',
              description:
                'Requires lat, lon, model, and elements. Optional levels, runtime, units.',
            },
          ]}
        />
      </DocsGuideSection>

      <DocsGuideSection id="env" title="Environment">
        <DocsCodeBlock>{`# .env.local
PLATFORM_API_KEY=your-secret-key`}</DocsCodeBlock>
        <p className="m-0">
          <Code>your-secret-key</Code> is the token from the{' '}
          <DocsExternalLink href={INFOPLAZA_PLATFORM_INTRO_URL}>
            developer platform
          </DocsExternalLink>
          . Keep it server-side and never commit it. If you mount the handler under a
          different base path, pass it through <Code>modelsConfig.basePath</Code> on{' '}
          <Code>Providers</Code> / <Code>WeatherLayers</Code>, and <Code>basePath</Code> on{' '}
          <Code>TimeseriesModelsProvider</Code> / <Code>EnsembleModelsProvider</Code>, so
          client requests target the right URL. Default is <Code>/api/platform</Code>.
        </p>
      </DocsGuideSection>
    </DocsPage>
  )
}
