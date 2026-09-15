import { DocsCodeBlock } from '../docs-code-block'
import { Code, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'

export function StylingDocs() {
  return (
    <DocsPage
      title="Styling"
      description={
        <p className="m-0">
          All package utility classes are emitted with a Tailwind v4 <Code>ip</Code> prefix
          (<Code>.ip:flex</Code>, <Code>.ip:bg-white/80</Code>, …), so they cannot collide
          with a host application&apos;s own Tailwind utilities.
        </p>
      }
    >
      <DocsGuideSection id="which-css" title="Which stylesheet">
        <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong>Standalone app</strong> (no existing Tailwind / you want a reset): import{' '}
            <Code>@infoplaza/platform/styles.css</Code>. This includes Tailwind preflight
            (global element resets).
          </li>
          <li>
            <strong>Embedding</strong> (Next.js, an app that already runs Tailwind, or any
            app with its own global styles): import{' '}
            <Code>@infoplaza/platform/styles.embed.css</Code>. This ships only prefixed
            utilities with no preflight and no global element selectors (
            <Code>html</Code>, <Code>*</Code>, <Code>button</Code>, <Code>input</Code>,{' '}
            <Code>svg</Code>).
          </li>
        </ul>
        <DocsCodeBlock>{`// Host app (Next.js etc.)
import '@infoplaza/platform/styles.embed.css'`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="wrapper" title="Recommended wrapper">
        <p className="m-0">
          Wrap the map, HUD, timeseries, or ensemble subtree in the{' '}
          <Code>ip-platform</Code> class. The prefix already prevents class collisions; the
          wrapper provides a stable scope for dark-mode / fullscreen context and the icon
          color hook. Packaged <Code>TimeseriesForecast</Code> and{' '}
          <Code>EnsembleForecast</Code> apply this class for you.
        </p>
        <DocsCodeBlock>{`<div className="ip-platform" style={{ height: '100%' }}>
  <WeatherLayers showHud />
</div>`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="icons" title="Icons">
        <p className="m-0">
          Exported icons render with <Code>fill: currentColor</Code> and are sized by the{' '}
          <Code>className</Code> you pass. For a host-agnostic default, add the{' '}
          <Code>ip-icon</Code> class and optionally drive color and size through CSS
          variables:
        </p>
        <DocsCodeBlock>{`.ip-platform {
  --ip-icon-color: #1f2937;
  --ip-icon-size: 1.25rem;
}`}</DocsCodeBlock>
      </DocsGuideSection>
    </DocsPage>
  )
}
