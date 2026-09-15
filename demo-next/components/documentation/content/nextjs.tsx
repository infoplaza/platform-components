import Link from 'next/link'
import { DocsCodeBlock } from '../docs-code-block'
import { Code, DocsCallout, DocsExternalLink, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { INFOPLAZA_PLATFORM_INTRO_URL } from '../../../lib/infoplaza-platform'

export function NextJsDocs() {
  return (
    <DocsPage
      title="Next.js"
      description={
        <p className="m-0">
          The client bundle is browser-safe: no Node-only modules (
          <Code>fs</Code>, <Code>worker_threads</Code>, <Code>child_process</Code>) are
          bundled into client chunks. App Router + Turbopack (<Code>next dev</Code> /{' '}
          <Code>next build</Code>) is supported.
        </p>
      }
    >
      <DocsCallout>
        Maps on Next require MapLibre 6 worker wiring —{' '}
        <Link href="/documentation/maplibre" className="font-medium text-primary">
          setWorkerUrl
        </Link>{' '}
        plus copy workers into <Code>public/</Code>. This applies to both Turbopack and
        webpack.
      </DocsCallout>

      <DocsGuideSection id="transpile" title="transpilePackages">
        <DocsCodeBlock>{`// next.config.js
const nextConfig = {
  transpilePackages: ['@infoplaza/platform'],
}

module.exports = nextConfig`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="css" title="CSS in a Tailwind host">
        <p className="m-0">
          This documentation site and <Code>demo-next</Code> import{' '}
          <Code>@infoplaza/platform/styles.css</Code> plus MapLibre CSS in the root layout.
          Host apps that already run Tailwind should prefer{' '}
          <Code>@infoplaza/platform/styles.embed.css</Code> so preflight does not reset
          the site. See{' '}
          <Link href="/documentation/styling" className="font-medium text-primary">
            Styling
          </Link>
          .
        </p>
      </DocsGuideSection>

      <DocsGuideSection id="auth" title="Auth route">
        <p className="m-0">
          Mount the catch-all at <Code>app/api/platform/[...platform]/route.ts</Code> as
          shown in{' '}
          <Link href="/documentation/auth" className="font-medium text-primary">
            Server setup
          </Link>
          . Create a token on the{' '}
          <DocsExternalLink href={INFOPLAZA_PLATFORM_INTRO_URL}>
            Infoplaza developer platform
          </DocsExternalLink>{' '}
          and keep <Code>PLATFORM_API_KEY</Code> server-side.
        </p>
      </DocsGuideSection>

      <DocsGuideSection id="geotiff" title="geotiff">
        <p className="m-0">
          <Code>geotiff</Code> is an optional dependency (only needed for GeoTIFF tile
          decoding). If you do not install it, GeoTIFF decoding throws a descriptive error;
          everything else works. It is loaded lazily via an external dynamic{' '}
          <Code>import(&apos;geotiff&apos;)</Code> so the host bundler applies its own
          browser resolution.
        </p>
      </DocsGuideSection>

      <DocsGuideSection id="webpack" title="Webpack fallback">
        <p className="m-0">
          If you hit a bundler edge case, the webpack builder remains a fallback:{' '}
          <Code>next dev --webpack</Code> / <Code>next build --webpack</Code>.
        </p>
      </DocsGuideSection>
    </DocsPage>
  )
}
