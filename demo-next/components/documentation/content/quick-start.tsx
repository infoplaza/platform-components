import Link from 'next/link'
import { DocsCodeBlock } from '../docs-code-block'
import { Code, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { DocsPropTable } from '../docs-prop-table'

export function QuickStartDocs() {
  return (
    <DocsPage
      title="Quick start"
      description={
        <p className="m-0">
          A <Code>PlatformMap</Code> shell with packaged <Code>WeatherLayers</Code>{' '}
          (providers, events, Deck overlay, optional HUD). There is no client-side models
          fetch to wire yourself — <Code>WeatherLayers</Code> / <Code>Providers</Code> handle
          it. Follows the{' '}
          <Link href="/demo" className="font-medium text-primary">
            live map demo
          </Link>
          .
        </p>
      }
    >
      <DocsGuideSection id="map" title="Map with weather">
        <DocsCodeBlock>{`import { useState } from 'react'
import { PlatformMap, WeatherLayers } from '@infoplaza/platform/components'
import { MAP_STYLES } from '@infoplaza/platform/defaults'

import 'maplibre-gl/dist/maplibre-gl.css'
import '@infoplaza/platform/styles.css'

function App() {
  const [viewState, setViewState] = useState({
    longitude: 4.9041,
    latitude: 52.3676,
    zoom: 7,
  })
  const [mapStyleKey, setMapStyleKey] = useState('dark')

  return (
    <PlatformMap
      viewState={viewState}
      onMove={(event) => setViewState(event?.viewState)}
      mapStyles={MAP_STYLES}
      mapStyleKey={mapStyleKey}
    >
      <WeatherLayers showHud />
    </PlatformMap>
  )
}`}</DocsCodeBlock>
        <p className="m-0">
          Use a bare <Code>PlatformMap</Code> (no <Code>WeatherLayers</Code>) when you only
          need the MapLibre shell and host feature layers via <Code>usePlatformMap()</Code>.
        </p>
      </DocsGuideSection>

      <DocsGuideSection id="weather-config" title="Configuring weather">
        <p className="m-0">
          <Code>WeatherLayers</Code> and <Code>Providers</Code> accept an optional{' '}
          <Code>weatherConfig</Code>. Every field is optional.
        </p>
        <DocsPropTable
          title="weatherConfig"
          nameColumn="Field"
          props={[
            {
              name: 'model',
              type: 'string',
              defaultValue: "'gfs'",
              description: 'Initial model slug.',
            },
            {
              name: 'element',
              type: 'string',
              defaultValue: "'temperature'",
              description: 'Initial weather element.',
            },
            {
              name: 'run',
              type: 'string',
              defaultValue: "'latest'",
              description: 'Initial model run.',
            },
            {
              name: 'member',
              type: 'string',
              description: 'Ensemble member; inferred from the model when omitted.',
            },
            {
              name: 'level',
              type: 'string',
              description: 'Vertical level; inferred from the element when omitted.',
            },
          ]}
        />
        <DocsCodeBlock>{`<WeatherLayers
  weatherConfig={{ model: 'optimal', element: 'wind' }}
  showHud
/>`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="models-config" title="Configuring the models request">
        <p className="m-0">
          <Code>Providers</Code> accepts an optional <Code>modelsConfig</Code> that
          controls the internal <Code>/api/platform/models</Code> request. Default{' '}
          <Code>basePath</Code> is <Code>/api/platform</Code>. Use{' '}
          <Code>useModels()</Code> if you need the catalog in host UI.
        </p>
        <DocsCodeBlock>{`import { useModels } from '@infoplaza/platform/providers'

function ModelCount() {
  const { models, loading, error } = useModels()
  if (loading) return <span>Loading models…</span>
  if (error) return <span>Failed to load models</span>
  return <span>{models.length} models available</span>
}`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="timeseries" title="Timeseries">
        <p className="m-0">
          Timeseries does not accept a <Code>models</Code> array.{' '}
          <Code>TimeseriesForecast</Code> requires <Code>lat</Code> and <Code>lon</Code> and
          loads the catalog plus point-forecast rows through PlatformAuth.
        </p>
        <DocsCodeBlock>{`import { TimeseriesForecast } from '@infoplaza/platform/timeseries'

<TimeseriesForecast lat={52.3676} lon={4.9041} />`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="timeseries-charts" title="Timeseries charts">
        <DocsCodeBlock>{`import { TimeseriesChartsForecast } from '@infoplaza/platform/timeseries-charts'

<TimeseriesChartsForecast lat={52.3676} lon={4.9041} />`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsGuideSection id="ensemble" title="Ensemble">
        <DocsCodeBlock>{`import { EnsembleForecast } from '@infoplaza/platform/ensemble'

<EnsembleForecast lat={52.3676} lon={4.9041} />`}</DocsCodeBlock>
      </DocsGuideSection>
    </DocsPage>
  )
}
