import Link from 'next/link'
import { DocsCodeBlock } from '../docs-code-block'
import { Code, DocsCallout, DocsExternalLink, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { INFOPLAZA_PLATFORM_INTRO_URL } from '../../../lib/infoplaza-platform'

export function InstallDocs() {
  return (
    <DocsPage
      title="Installation"
      description={
        <p className="m-0">
          Add the platform package and MapLibre. Peer expectation: React 18 or 19,{' '}
          <Code>maplibre-gl</Code> ≥ 6.4.1 (this package targets <Code>^6.9.0</Code>).
        </p>
      }
    >
      <DocsGuideSection id="npm" title="Install">
        <DocsCodeBlock>{`npm install @infoplaza/platform maplibre-gl`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="styles" title="Import styles once">
        <p className="m-0">
          Import MapLibre CSS and the platform stylesheet in your app entry. Hosts that
          already run Tailwind should use the embed build so preflight does not reset
          their site.
        </p>
        <DocsCodeBlock>{`import 'maplibre-gl/dist/maplibre-gl.css'
import '@infoplaza/platform/styles.css'
// or, in a Tailwind / existing-global-styles host:
import '@infoplaza/platform/styles.embed.css'`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsCallout>
        Weather models are fetched internally by <Code>Providers</Code> /{' '}
        <Code>WeatherLayers</Code>. Create an API token on the{' '}
        <DocsExternalLink href={INFOPLAZA_PLATFORM_INTRO_URL}>
          Infoplaza developer platform
        </DocsExternalLink>{' '}
        and mount the platform auth route on your server — see{' '}
        <Link href="/documentation/auth" className="font-medium text-primary">
          Server setup
        </Link>
        . Maps also need MapLibre 6 worker wiring before the first map mounts.
      </DocsCallout>

      <DocsGuideSection id="optional" title="Optional geotiff">
        <p className="m-0">
          <Code>geotiff</Code> is an optional dependency used only for GeoTIFF tile
          decoding. If you do not install it, GeoTIFF decoding throws a descriptive error;
          everything else still works. The decoder is loaded lazily via{' '}
          <Code>import(&apos;geotiff&apos;)</Code> so the host bundler applies its own
          browser resolution.
        </p>
      </DocsGuideSection>
    </DocsPage>
  )
}
