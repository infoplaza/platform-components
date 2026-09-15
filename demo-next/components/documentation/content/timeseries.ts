import type { DocsComponent } from '../docs-component-section'

export const TIMESERIES_IMPORT = `import {
  TimeseriesForecast,
  TimeseriesModelsProvider,
  TimeseriesProvider,
} from '@infoplaza/platform/timeseries'`

export const TIMESERIES_COMPONENTS: DocsComponent[] = [
  {
    id: 'timeseries-forecast',
    name: 'TimeseriesForecast',
    summary: 'Packaged forecast table with toolbar, table, and footer.',
    description:
      'Wraps TimeseriesModelsProvider and TimeseriesProvider, then renders optional Toolbar, Builder + Chart, and Footer. lat and lon are required. Chart rows load from GET /api/platform/timeseries-point-forecast unless you pass blocks or getBlocks. Applies the ip-platform class for you.',
    importStatement: `import { TimeseriesForecast } from '@infoplaza/platform/timeseries'`,
    notes: [
      'Do not pass a models array. The catalog is loaded from the auth route using lat and lon.',
      'showToolbar and showFooter default to true. Set both to false for a chart-only table.',
      'All TimeseriesProvider selection and display props are forwarded.',
    ],
    required: [
      {
        name: 'lat',
        type: 'number',
        description: 'Latitude of the forecast point.',
      },
      {
        name: 'lon',
        type: 'number',
        description: 'Longitude of the forecast point.',
      },
    ],
    optional: [
      {
        name: 'basePath',
        type: 'string',
        defaultValue: "'/api/platform'",
        description: 'Auth handler mount path. Requests go to ${basePath}/timeseries-models.',
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
        defaultValue: 'true',
        description: 'Render the element-group footer pills.',
      },
      {
        name: 'locale',
        type: 'string',
        defaultValue: "'en'",
        description: "Date headers: 'en' | 'nl' | 'de' | 'it' | 'es' | 'fr'. Others fall back to en.",
      },
      {
        name: 'blocks',
        type: 'TimeseriesBlock[]',
        description: 'Host-owned rows. When defined, skips the point-forecast fetch.',
      },
      {
        name: 'getBlocks',
        type: '(options) => TimeseriesBlock[]',
        description:
          'Sync override used when blocks is omitted. Receives model, run, elementGroup, models, elementGroups.',
      },
      {
        name: 'showPalette',
        type: 'boolean',
        defaultValue: 'true',
        description: 'When false, cell background and text colors are not applied.',
      },
      {
        name: 'headerFormat',
        type: '[string, string]',
        description: "Date header formats, e.g. ['EEEEEE d MMM', 'HH'].",
      },
      {
        name: 'scrollToCurrentTime',
        type: 'boolean',
        description: 'Scroll the table to the current hour on mount.',
      },
      {
        name: 'getIconSrc',
        type: '(value: number | null) => string | null',
        description: 'Host-supplied ICON cell images. The package does not bundle weather icons.',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Extra class on the root ip-platform wrapper.',
      },
    ],
    example: `<TimeseriesForecast
  lat={52.3676}
  lon={4.9041}
  locale="en"
  headerFormat={['EEEEEE d MMM', 'HH']}
  scrollToCurrentTime
/>`,
  },
  {
    id: 'timeseries-models-provider',
    name: 'TimeseriesModelsProvider',
    summary: 'Location-filtered models catalog.',
    description:
      'Required lat and lon. Fetches GET {basePath}/timeseries-models?lat=&lon=. Context is read-only: { models, loading, error, lat, lon, basePath }. There is no models setter.',
    importStatement: `import { TimeseriesModelsProvider, useTimeseriesModels } from '@infoplaza/platform/timeseries'`,
    notes: [
      'The catalog is API-only. Do not pass a models array into Provider or Forecast.',
      'useTimeseriesModels() throws outside this provider. useTimeseriesModelsContext() is nullable.',
    ],
    required: [
      { name: 'lat', type: 'number', description: 'Latitude.' },
      { name: 'lon', type: 'number', description: 'Longitude.' },
    ],
    optional: [
      {
        name: 'basePath',
        type: 'string',
        defaultValue: "'/api/platform'",
        description: 'Auth mount path. Trailing slashes are stripped.',
      },
      { name: 'children', type: 'ReactNode', description: 'Usually TimeseriesProvider.' },
    ],
  },
  {
    id: 'timeseries-provider',
    name: 'TimeseriesProvider',
    summary: 'Selection, blocks, and display settings.',
    description:
      'Must sit under TimeseriesModelsProvider. Holds model / run / elementGroup / directionView, loads chart rows, and exposes them to Toolbar, Builder, and Footer. No models, lat, or lon props — those live on the models provider.',
    importStatement: `import { TimeseriesProvider, useTimeseries } from '@infoplaza/platform/timeseries'`,
    notes: [
      'Selection is hybrid: model + onModelChange (controlled) or defaultModel / omit (provider-owned). Same for run, elementGroup, directionView.',
      'Unknown slugs are clamped to the fetched catalog.',
      'blocks wins over getBlocks wins over the default point-forecast fetch.',
      "run === 'all' fetches one point-forecast request per catalog runtime and returns one block per runtime.",
      'useTimeseries() throws outside the provider. useTimeseriesContext() is nullable.',
    ],
    required: [],
    optional: [
      {
        name: 'model / defaultModel / onModelChange',
        type: 'string',
        description: 'Selected catalog slug. Empty selection falls back to the first model.',
      },
      {
        name: 'run / defaultRun / onRunChange',
        type: "number | 'all'",
        description: 'Selected runtime. Invalid values fall back to the latest runtime or all.',
      },
      {
        name: 'elementGroups',
        type: 'TimeseriesElementGroup[]',
        defaultValue: 'DEFAULT_TIMESERIES_ELEMENT_GROUPS',
        description: 'Footer groups. Default keys include overview, temperature, wind, precipitation, and more.',
      },
      {
        name: 'blocks',
        type: 'TimeseriesBlock[]',
        description: 'When defined, skips fetching.',
      },
      {
        name: 'getBlocks',
        type: '(TimeseriesGetBlocksOptions) => TimeseriesBlock[]',
        description: 'Sync host override when blocks is omitted.',
      },
      {
        name: 'locale',
        type: 'string',
        defaultValue: "'en'",
        description: 'Date header locale.',
      },
      {
        name: 'timezone',
        type: 'string | null',
        defaultValue: 'null',
        description: 'IANA timezone for headers. Null uses the runtime default.',
      },
      {
        name: 'views',
        type: 'TimeseriesCellViewMap',
        description:
          "Override built-in cell views: VALUE, VALUE_ROUND, DIRECTION, PRECIPITATION_TYPE, ICON.",
      },
      {
        name: 'showPalette',
        type: 'boolean',
        description: 'Forwarded to the table. Defaults to true on TimeseriesTable.',
      },
    ],
  },
  {
    id: 'timeseries-toolbar',
    name: 'TimeseriesToolbar',
    summary: 'Model and run pills.',
    description:
      'Resolves props ?? context and returns null if models, model, handlers, or run are missing — it does not throw. Shows at most five model pills plus overflow. Adds an All run pill when the catalog has more than one runtime.',
    importStatement: `import { TimeseriesToolbar } from '@infoplaza/platform/timeseries'`,
    required: [],
    optional: [
      { name: 'model', type: 'string', description: 'Falls back to context.' },
      { name: 'onModelChange', type: '(slug: string) => void', description: 'Falls back to context.' },
      { name: 'run', type: "number | 'all'", description: 'Falls back to context.' },
      { name: 'onRunChange', type: "(run: number | 'all') => void", description: 'Falls back to context.' },
      { name: 'locale', type: 'string', description: "Falls back to context, then 'en'." },
    ],
  },
  {
    id: 'timeseries-builder',
    name: 'TimeseriesBuilder',
    summary: 'Maps blocks onto Chart. Does not fetch.',
    description:
      'Requires TimeseriesProvider. Shows a loading skeleton, then wraps each TimeseriesBlock in a block context and ScrollSync. Clone children once per block.',
    importStatement: `import { TimeseriesBuilder, TimeseriesChart } from '@infoplaza/platform/timeseries'`,
    required: [],
    optional: [
      {
        name: 'children',
        type: 'ReactNode',
        description: 'Typically <TimeseriesChart />. Repeated once per block.',
      },
    ],
    example: `<TimeseriesBuilder>
  <TimeseriesChart />
</TimeseriesBuilder>`,
  },
  {
    id: 'timeseries-chart',
    name: 'TimeseriesChart',
    summary: 'Bridge from block / provider context to TimeseriesTable.',
    description:
      'All props are optional Partial<TimeseriesTableProps>. Rows come from the prop, then the current block. Returns null if there are no rows.',
    importStatement: `import { TimeseriesChart } from '@infoplaza/platform/timeseries'`,
    required: [],
    optional: [
      {
        name: 'rows',
        type: 'TimeseriesRow[]',
        description: 'Explicit rows. Otherwise reads the current builder block.',
      },
    ],
  },
  {
    id: 'timeseries-footer',
    name: 'TimeseriesFooter',
    summary: 'Element-group pills.',
    description:
      'Resolves props ?? context. Loading renders a pulse skeleton. Returns null if there are no items or handler.',
    importStatement: `import { TimeseriesFooter } from '@infoplaza/platform/timeseries'`,
    required: [],
    optional: [
      { name: 'elementGroups', type: 'TimeseriesElementGroup[]', description: 'Falls back to context.' },
      { name: 'elementGroup', type: 'string', description: 'Selected group key.' },
      {
        name: 'onElementGroupChange',
        type: '(key: string) => void',
        description: 'Falls back to context.',
      },
    ],
  },
  {
    id: 'timeseries-table',
    name: 'TimeseriesTable',
    summary: 'Low-level forecast grid.',
    description:
      'Frozen labels, drag-scroll, grouped date headers, current-hour highlight, optional hidden-rows expander, and the cell-view registry. Used by TimeseriesChart; you can also render it standalone with rows.',
    importStatement: `import { TimeseriesTable } from '@infoplaza/platform/timeseries'`,
    required: [
      {
        name: 'rows',
        type: 'TimeseriesRow[]',
        description: 'Table rows. Each cell has timestamp, value, and color { background, text }.',
      },
    ],
    optional: [
      {
        name: 'headerFormat',
        type: '[string, string]',
        defaultValue: "['EEEEEE d MMM', 'HH']",
        description: 'date-fns format strings for the grouped header and the hour row.',
      },
      {
        name: 'scrollToCurrentTime',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Scroll the grid to the current hour on mount.',
      },
      {
        name: 'showPalette',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Apply cell background and text colors.',
      },
      {
        name: 'scrollbar',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Show the horizontal scrollbar.',
      },
      {
        name: 'hideEmptyRows',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Hide rows whose cells are all empty.',
      },
    ],
  },
]
