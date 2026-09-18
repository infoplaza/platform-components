import type { DocsComponent } from '../docs-component-section'

export const TIMESERIES_CHARTS_IMPORT = `import {
  TimeseriesChartsForecast,
  TimeseriesModelsProvider,
  TimeseriesChartsProvider,
} from '@infoplaza/platform/timeseries-charts'`

export const TIMESERIES_CHARTS_COMPONENTS: DocsComponent[] = [
  {
    id: 'timeseries-charts-forecast',
    name: 'TimeseriesChartsForecast',
    summary: 'Packaged composed charts with toolbar and charts.',
    description:
      'Wraps TimeseriesModelsProvider and TimeseriesChartsProvider, then optional Toolbar, Builder + Chart. lat and lon are required. Charts load from GET /api/platform/timeseries-point-forecast (or marine-timeseries-point-forecast when domain is marine) unless you pass charts or getCharts. One config group becomes one composed chart (LINE + DIRECTION + VALUE + PRECIPITATION_TYPE). Applies ip-platform for you.',
    importStatement: `import { TimeseriesChartsForecast } from '@infoplaza/platform/timeseries-charts'`,
    notes: [
      'Do not pass a models array. The catalog is loaded from GET /api/platform/timeseries-models (or marine-timeseries-models when domain is marine).',
      'domain defaults to land. Set domain="marine" on Forecast or TimeseriesModelsProvider.',
      'Builder stacks every group in elementGroups.',
      'showToolbar defaults to true. showFooter is off for now (group-visibility pills are disabled).',
    ],
    required: [
      { name: 'lat', type: 'number', description: 'Latitude of the forecast point.' },
      { name: 'lon', type: 'number', description: 'Longitude of the forecast point.' },
    ],
    optional: [
      {
        name: 'basePath',
        type: 'string',
        defaultValue: "'/api/platform'",
        description: 'Auth handler mount path.',
      },
      {
        name: 'domain',
        type: "'land' | 'marine'",
        defaultValue: "'land'",
        description: 'Which PlatformAuth proxy to use. land hits timeseries-models and timeseries-point-forecast; marine hits the marine-timeseries-* routes.',
      },
      {
        name: 'model / defaultModel / onModelChange',
        type: 'string',
        description:
          'Preferred catalog slug. model without onModelChange (or defaultModel) is the initial selection; model + onModelChange is controlled. If the slug is not in the fetched catalog, the first model is used.',
      },
      {
        name: 'showToolbar',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Render the model / run pill toolbar.',
      },
      {
        name: 'showFooter',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Group-visibility pills. Off for now; leave false.',
      },
      {
        name: 'elementGroups',
        type: 'TimeseriesChartElementGroup[]',
        defaultValue: 'DEFAULT_LAND_TIMESERIES_CHART_GROUPS when domain is land, DEFAULT_MARINE_TIMESERIES_CHART_GROUPS when marine',
        description: 'Chart config. Each group is one composed chart. Item view is LINE, DIRECTION, VALUE, or PRECIPITATION_TYPE. LINE items may set optional line (color, strokeWidth, strokeDasharray, opacity, type). Groups may set optional yAxis.domain ([number | auto | dataMin | dataMax, ...]); omit to keep Y pinned at 0. Graph config.domain remains the X-axis time range. A defined array replaces domain defaults (it does not merge). Omit to use land or marine defaults from domain.',
      },
      {
        name: 'visibleGroups / defaultVisibleGroups / onVisibleGroupsChange',
        type: 'string[]',
        description: 'Which group keys are shown. Defaults to every group.',
      },
      {
        name: 'charts',
        type: 'TimeseriesChartBlock[]',
        description: 'Host-owned chart blocks. When defined, skips the point-forecast fetch.',
      },
      {
        name: 'getCharts',
        type: '(options) => TimeseriesChartBlock[]',
        description:
          'Sync override when charts is omitted. Receives model, run, models, elementGroups, visibleGroups, locale, timezone.',
      },
      {
        name: 'locale',
        type: 'string',
        defaultValue: "'en'",
        description: "Date axis labels: 'en' | 'nl' | 'de' | 'it' | 'es' | 'fr'.",
      },
      {
        name: 'plotHeight',
        type: 'number',
        defaultValue: '320',
        description: 'Plot-area height in pixels. Also sizes the Builder loading skeleton. Chart/Graph can override. fixedHeight still overrides the total Recharts container.',
      },
      {
        name: 'hourInterval',
        type: '1 | 3 | 6',
        defaultValue: '6',
        description: 'Vertical unlabeled hour grid lines in the plot. Day-boundary ticks stay on the X axis. For 3h and 6h, strip overlays (direction, value, precipitation type) show the latest point in each bucket, centered; 1h keeps hourly strip points. LINE series are unchanged. Chart/Graph can override.',
      },
      {
        name: 'thresholds',
        type: 'TimeseriesChartThresholds | null',
        description:
          'Optional project-style object; only conditions and ignored_hours are used. Each chart keeps AND-groups whose elementIds are all LINE series on that chart, then draws dashed Y-lines and a status strip above the date labels. Chart/Graph can override.',
      },
      { name: 'className', type: 'string', description: 'Extra class on the root wrapper.' },
    ],
    example: `<TimeseriesChartsForecast
  lat={52.3676}
  lon={4.9041}
  model="gfs"
  locale="en"
/>`,
  },
  {
    id: 'timeseries-charts-models-provider',
    name: 'TimeseriesModelsProvider',
    summary: 'Location-filtered timeseries catalog (re-exported).',
    description:
      'Same provider as @infoplaza/platform/timeseries. Required lat and lon. Fetches GET {basePath}/timeseries-models?lat=&lon= (or marine-timeseries-models when domain is marine). Re-exported so composed charts can import from one package.',
    importStatement: `import { TimeseriesModelsProvider, useTimeseriesModels } from '@infoplaza/platform/timeseries-charts'`,
    required: [
      { name: 'lat', type: 'number', description: 'Latitude of the forecast point.' },
      { name: 'lon', type: 'number', description: 'Longitude of the forecast point.' },
    ],
    optional: [
      {
        name: 'basePath',
        type: 'string',
        defaultValue: "'/api/platform'",
        description: 'Auth handler mount path.',
      },
      {
        name: 'domain',
        type: "'land' | 'marine'",
        defaultValue: "'land'",
        description: 'land uses timeseries-models; marine uses marine-timeseries-models.',
      },
    ],
  },
  {
    id: 'timeseries-charts-provider',
    name: 'TimeseriesChartsProvider',
    summary: 'Selection, chart blocks, and group visibility.',
    description:
      'Must sit under TimeseriesModelsProvider. Holds model / run / visibleGroups, loads chart blocks, and exposes them to Toolbar, Builder, and Footer. No models prop. Fetches point forecast unless charts / getCharts is passed.',
    importStatement: `import { TimeseriesChartsProvider, useTimeseriesCharts } from '@infoplaza/platform/timeseries-charts'`,
    notes: [
      'useTimeseriesCharts() throws outside the provider. useTimeseriesChartsContext() is nullable.',
    ],
    required: [],
    optional: [
      {
        name: 'model / defaultModel / onModelChange',
        type: 'string',
        description:
          'Preferred catalog slug. model without onModelChange (or defaultModel) is the initial selection; model + onModelChange is controlled. If the slug is not in the fetched catalog, the first model is used.',
      },
      { name: 'run / defaultRun / onRunChange', type: "number | 'all'", description: 'Runtime selection. all fetches one payload per catalog runtime.' },
      { name: 'elementGroups', type: 'TimeseriesChartElementGroup[]', description: 'Replaces domain defaults when defined (does not merge). Land uses DEFAULT_LAND_TIMESERIES_CHART_GROUPS, marine uses DEFAULT_MARINE_TIMESERIES_CHART_GROUPS. LINE items may set optional line; groups may set optional yAxis.domain.' },
      { name: 'visibleGroups / defaultVisibleGroups / onVisibleGroupsChange', type: 'string[]', description: 'Group keys currently shown.' },
      { name: 'charts', type: 'TimeseriesChartBlock[]', description: 'Host-owned blocks. Skips the fetch.' },
      { name: 'getCharts', type: '(options) => TimeseriesChartBlock[]', description: 'Sync override when charts is omitted.' },
      { name: 'locale', type: 'string', defaultValue: "'en'", description: 'Date axis locale.' },
      {
        name: 'plotHeight',
        type: 'number',
        defaultValue: '320',
        description: 'Plot-area height in pixels. Flows to Chart/Graph and the Builder loading skeleton.',
      },
      {
        name: 'hourInterval',
        type: '1 | 3 | 6',
        defaultValue: '6',
        description: 'Vertical unlabeled hour grid lines. For 3h and 6h, strip overlays summarize to the latest point in each bucket, centered. Flows to Chart/Graph.',
      },
      {
        name: 'thresholds',
        type: 'TimeseriesChartThresholds | null',
        description:
          'Optional. conditions + ignored_hours. Per-chart Y-lines and status strip for LINE elements on that chart. Flows to Chart/Graph.',
      },
    ],
  },
  {
    id: 'timeseries-charts-toolbar',
    name: 'TimeseriesChartsToolbar',
    summary: 'Model and run pills.',
    description:
      'Resolves props ?? context and returns null if neither exists — it does not throw. Reuses timeseries pills internally, not map controls.',
    importStatement: `import { TimeseriesChartsToolbar } from '@infoplaza/platform/timeseries-charts'`,
    required: [],
    optional: [
      { name: 'model', type: 'string', description: 'Falls back to context.' },
      { name: 'onModelChange', type: '(slug: string) => void', description: 'Falls back to context.' },
      { name: 'run', type: "number | 'all'", description: 'Falls back to context.' },
      { name: 'onRunChange', type: "(run: number | 'all') => void", description: 'Falls back to context.' },
    ],
  },
  {
    id: 'timeseries-charts-builder',
    name: 'TimeseriesChartsBuilder',
    summary: 'Maps chart blocks onto Chart. Does not fetch.',
    description:
      'Requires TimeseriesChartsProvider. Loading skeleton, then one chart-block context per TimeseriesChartBlock (runtime × group). Clone children once per block.',
    importStatement: `import { TimeseriesChartsBuilder, TimeseriesChartsChart } from '@infoplaza/platform/timeseries-charts'`,
    required: [],
    optional: [
      {
        name: 'children',
        type: 'ReactNode',
        description: 'Typically <TimeseriesChartsChart />.',
      },
    ],
    example: `<TimeseriesChartsBuilder>
  <TimeseriesChartsChart />
</TimeseriesChartsBuilder>`,
  },
  {
    id: 'timeseries-charts-chart',
    name: 'TimeseriesChartsChart',
    summary: 'Bridge from block context to TimeseriesGraph.',
    description:
      'Reads the current chart block (or explicit graph props) and renders TimeseriesGraph.',
    importStatement: `import { TimeseriesChartsChart } from '@infoplaza/platform/timeseries-charts'`,
    required: [],
    optional: [
      {
        name: 'config',
        type: 'TimeseriesChartGraphConfig',
        description: 'Explicit graph config. Otherwise reads the current builder block.',
      },
      {
        name: 'plotHeight',
        type: 'number',
        defaultValue: 'context, else 320',
        description: 'Plot-area height in pixels. Falls back to TimeseriesChartsProvider.',
      },
      {
        name: 'hourInterval',
        type: '1 | 3 | 6',
        defaultValue: 'context, else 6',
        description: 'Vertical unlabeled hour grid lines. For 3h and 6h, strip overlays summarize to the latest point in each bucket, centered. Falls back to TimeseriesChartsProvider.',
      },
      {
        name: 'thresholds',
        type: 'TimeseriesChartThresholds | null',
        description: 'Falls back to TimeseriesChartsProvider.',
      },
    ],
  },
  {
    id: 'timeseries-charts-footer',
    name: 'TimeseriesChartsFooter',
    summary: 'Group visibility pills (disabled for now).',
    description:
      'Toggles which groups are stacked, instead of exclusive selection. Resolves props ?? context and returns null if neither exists. Keeps at least one group visible. Packaged Forecast leaves this off (showFooter defaults to false).',
    importStatement: `import { TimeseriesChartsFooter } from '@infoplaza/platform/timeseries-charts'`,
    required: [],
    optional: [
      { name: 'elementGroups', type: 'TimeseriesChartElementGroup[]', description: 'Falls back to context.' },
      { name: 'visibleGroups', type: 'string[]', description: 'Falls back to context.' },
      { name: 'onVisibleGroupsChange', type: '(keys: string[]) => void', description: 'Falls back to context.' },
    ],
  },
  {
    id: 'timeseries-graph',
    name: 'TimeseriesGraph',
    summary: 'Low-level Recharts ComposedChart.',
    description:
      'LINE series in the plot; DIRECTION arrows, VALUE labels, and PRECIPITATION_TYPE icons in a Customized strip band under the plot (height grows with overlay rows). Precipitation-type icons use the point-forecast palette (the same visualization as the map legend); hail is off-white so it stays readable on the strip. Day banding, hour lines, and the hover cursor continue through the band. Hover values float in the title row (centered overlay, no layout shift) and list every group item at the hovered hour: LINE values, DIRECTION (arrow + degrees + compass), VALUE, and PRECIPITATION_TYPE. Optional thresholds add dashed Y-lines for in-scale LINE elements, a status color strip above the date labels, a Thresholds legend, and Watch / Caution / Critical on hover. LINE series read color, strokeWidth, dash, opacity, and curve from the series; Y-axis domain comes from config.yAxis or defaults to [0, auto]. config.domain is the X-axis time range.',
    importStatement: `import { TimeseriesGraph } from '@infoplaza/platform/timeseries-charts'`,
    required: [
      {
        name: 'config',
        type: 'TimeseriesChartGraphConfig',
        description: 'Aligned LINE rows plus DIRECTION / VALUE / PRECIPITATION_TYPE overlays.',
      },
    ],
    optional: [
      { name: 'id', type: 'string', description: 'Key prefix for series.' },
      { name: 'title', type: 'string', description: 'Chart title (group name).' },
      { name: 'titleExtra', type: 'string', description: 'Secondary title, e.g. latest.' },
      { name: 'subtitle', type: 'string', description: 'Shown under the title (e.g. formatted runtime).' },
      { name: 'locale', type: 'string', description: 'Date formatting locale.' },
      { name: 'timezone', type: 'string | null', description: 'Date axis timezone.' },
      {
        name: 'plotHeight',
        type: 'number',
        defaultValue: '320',
        description: 'Plot-area height in pixels. The strip band (direction/value/precipitation-type rows) and axis chrome are added on top.',
      },
      {
        name: 'hourInterval',
        type: '1 | 3 | 6',
        defaultValue: '6',
        description: 'Vertical unlabeled hour grid lines. Day-boundary ticks stay on the X axis. For 3h and 6h, strip overlays show the latest point in each bucket, centered; 1h keeps hourly strip points. LINE series are unchanged.',
      },
      {
        name: 'thresholds',
        type: 'TimeseriesChartThresholds | null',
        description:
          'Optional. Only conditions and ignored_hours are read. Per-chart Y-lines and status strip for LINE elements plotted on this graph.',
      },
      { name: 'fixedWidth', type: 'number', description: 'Optional fixed pixel width.' },
      { name: 'fixedHeight', type: 'number', description: 'Optional fixed pixel height. Overrides plotHeight plus chrome.' },
    ],
  },
]
