import Link from 'next/link'
import { DocsCodeBlock } from '../docs-code-block'
import { INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL } from '../../../lib/infoplaza-platform'
import { Code, DocsExternalLink, DocsGuideSection } from '../docs-inline'
import { DocsPage } from '../docs-page'
import { DocsPackageSection } from '../docs-package-section'
import {
  TIMESERIES_CHARTS_COMPONENTS,
  TIMESERIES_CHARTS_IMPORT,
} from './timeseries-charts'

export function TimeseriesChartsDocs() {
  return (
    <DocsPage
      title="Timeseries charts"
      packageName="@infoplaza/platform/timeseries-charts"
      description={
        <p className="m-0">
          A portable point-forecast chart — Recharts composed LINE series with
          DIRECTION arrows, VALUE labels, and PRECIPITATION_TYPE icons on the axis —
          without the map stack or app chrome. The models catalog is the same as timeseries tables (
          <Code>GET /api/platform/timeseries-models</Code>, or{' '}
          <Code>marine-timeseries-models</Code> when <Code>domain=&quot;marine&quot;</Code>
          ). Series load from{' '}
          <Code>GET /api/platform/timeseries-point-forecast</Code> (or{' '}
          <Code>marine-timeseries-point-forecast</Code>) unless the host
          passes <Code>charts</Code> / <Code>getCharts</Code>. See the{' '}
          <Link href="/demo/timeseries-charts" className="font-medium text-primary">
            timeseries charts demo
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
          Sibling product to the timeseries table and ensemble. Import only from{' '}
          <Code>@infoplaza/platform/timeseries-charts</Code>. Do not extend table{' '}
          <Code>TimeseriesCellView</Code> with LINE.
        </p>
        <DocsCodeBlock>{`<TimeseriesChartsForecast
  lat={52.3676}
  lon={4.9041}
  model="gfs"
  showToolbar={false}
/>`}</DocsCodeBlock>
        <DocsCodeBlock>{`<TimeseriesModelsProvider lat={52.3676} lon={4.9041}>
  <TimeseriesChartsProvider>
    <TimeseriesChartsToolbar />
    <TimeseriesChartsBuilder>
      <TimeseriesChartsChart />
    </TimeseriesChartsBuilder>
  </TimeseriesChartsProvider>
</TimeseriesModelsProvider>`}</DocsCodeBlock>
        <p className="m-0">
          Default groups follow <Code>domain</Code>: land uses{' '}
          <Code>DEFAULT_LAND_TIMESERIES_CHART_GROUPS</Code> (Temperature,
          Precipitation, Wind); marine uses{' '}
          <Code>DEFAULT_MARINE_TIMESERIES_CHART_GROUPS</Code> (Wind and Wave).
          Each group is one composed chart. Group-visibility footer pills are
          off for now.
        </p>
        <p className="m-0">
          Pass <Code>elementGroups</Code> to replace those defaults (it does not
          merge). Reuse a default group or define new ones. Optional{' '}
          <Code>thresholds</Code> only apply to LINE series on each chart.
          Optional <Code>line</Code> on a LINE item sets color, thickness, dash,
          opacity, and curve. Optional <Code>yAxis.domain</Code> on a group sets
          the shared Y scale (<Code>graph.config.domain</Code> stays the X-axis
          time range):
        </p>
        <DocsCodeBlock>{`const GROUPS = [
  DEFAULT_LAND_TIMESERIES_CHART_GROUPS.find((g) => g.key === 'temperature')!,
  {
    key: 'clouds',
    title: 'Cloud cover',
    items: [
      { slug: 'clouds_total', title: 'Total cloud cover', element: 'cloudcovertotal', unit: '%', view: 'LINE' },
      { slug: 'clouds_low', title: 'Low clouds', element: 'cloudcoverlow', unit: '%', view: 'LINE' },
      { slug: 'clouds_mid', title: 'Mid clouds', element: 'cloudcovermiddle', unit: '%', view: 'LINE' },
      { slug: 'clouds_high', title: 'High clouds', element: 'cloudcoverhigh', unit: '%', view: 'LINE' },
      { slug: 'clouds_rh', title: 'Relative humidity', element: 'relativehumidity', level: '2m', unit: '%', view: 'LINE' },
      { slug: 'clouds_vis', title: 'Visibility', element: 'visibility', unit: 'km', view: 'VALUE', stripLabel: 'Vis' },
    ],
  },
  {
    key: 'pressure',
    title: 'Pressure',
    yAxis: { domain: ['dataMin', 'dataMax'] },
    items: [
      { slug: 'pressure_msl', title: 'Mean sea level pressure', element: 'pressure_meansealevel', unit: 'hPa', view: 'LINE' },
      { slug: 'pressure_surface', title: 'Surface pressure', element: 'pressure', level: 'surface', unit: 'hPa', view: 'LINE' },
    ],
  },
]

const THRESHOLDS = {
  ignored_hours: [],
  conditions: {
    yellow: [
      { rows: [{ elementId: 'cloudcovertotal', operator: 'greater-than', from: 50, to: null }] },
      { rows: [{ elementId: 'relativehumidity', operator: 'greater-than', from: 80, to: null }] },
      { rows: [{ elementId: 'pressure_meansealevel', operator: 'less-than', from: 1010, to: null }] },
    ],
    orange: [
      { rows: [{ elementId: 'cloudcovertotal', operator: 'greater-than', from: 75, to: null }] },
      { rows: [{ elementId: 'relativehumidity', operator: 'greater-than', from: 90, to: null }] },
      { rows: [{ elementId: 'pressure_meansealevel', operator: 'less-than', from: 1000, to: null }] },
    ],
    red: [
      { rows: [{ elementId: 'cloudcovertotal', operator: 'greater-than', from: 90, to: null }] },
      { rows: [{ elementId: 'relativehumidity', operator: 'greater-than', from: 95, to: null }] },
      { rows: [{ elementId: 'pressure_meansealevel', operator: 'less-than', from: 990, to: null }] },
    ],
  },
}

<TimeseriesChartsForecast
  lat={52.3676}
  lon={4.9041}
  model="gfs"
  elementGroups={GROUPS}
  thresholds={THRESHOLDS}
/>`}</DocsCodeBlock>
        <DocsCodeBlock>{`{
  key: 'temperature',
  title: 'Temperature',
  items: [
    {
      slug: 'temperature_temperature',
      title: 'Temperature',
      element: 'temperature',
      level: '2m',
      unit: '°C',
      view: 'LINE',
      line: { color: '#E63A48', strokeWidth: 2, type: 'monotone' },
    },
    {
      slug: 'temperature_dewpoint',
      title: 'Dewpoint',
      element: 'dewpoint',
      level: '2m',
      unit: '°C',
      view: 'LINE',
      line: { color: '#3b82f6', strokeDasharray: '4 4' },
    },
    {
      slug: 'temperature_temperatureapparent',
      title: 'Feels like',
      element: 'temperatureapparent',
      level: '2m',
      unit: '°C',
      view: 'LINE',
      line: { color: '#b45309', strokeWidth: 1, opacity: 0.55 },
    },
  ],
}`}</DocsCodeBlock>
      </DocsGuideSection>

      <DocsPackageSection
        id="timeseries-charts-api"
        title="API"
        packageName="@infoplaza/platform/timeseries-charts"
        description="Compound API. TimeseriesModelsProvider is the only writer of the catalog. TimeseriesChartsProvider loads charts by default and stacks every configured group."
        importStatement={TIMESERIES_CHARTS_IMPORT}
        typesNote={
          <>
            Also exported: <Code>DEFAULT_LAND_TIMESERIES_CHART_GROUPS</Code>,{' '}
            <Code>DEFAULT_MARINE_TIMESERIES_CHART_GROUPS</Code>,{' '}
            <Code>DEFAULT_TIMESERIES_CHART_PLOT_HEIGHT</Code>, hooks{' '}
            <Code>useTimeseriesCharts</Code> / <Code>useTimeseriesChartsContext</Code> /{' '}
            <Code>useTimeseriesChartBlock</Code>, and types such as{' '}
            <Code>TimeseriesChartBlock</Code>, <Code>TimeseriesChartGraphConfig</Code>,{' '}
            <Code>TimeseriesChartLineStyle</Code>, <Code>TimeseriesChartYAxis</Code>,{' '}
            <Code>TimeseriesChartView</Code>.
          </>
        }
        items={TIMESERIES_CHARTS_COMPONENTS}
      />
    </DocsPage>
  )
}
