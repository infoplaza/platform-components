import type { DocsComponent } from '../docs-component-section'

export const ENSEMBLE_IMPORT = `import {
  EnsembleForecast,
  EnsembleModelsProvider,
  EnsembleProvider,
} from '@infoplaza/platform/ensemble'`

export const ENSEMBLE_COMPONENTS: DocsComponent[] = [
  {
    id: 'ensemble-forecast',
    name: 'EnsembleForecast',
    summary: 'Packaged plume charts with toolbar, chart, and footer.',
    description:
      'Wraps EnsembleModelsProvider and EnsembleProvider, then optional Toolbar, Builder + Chart, and Footer. lat and lon are required. Charts load from GET /api/platform/ensemble-point-forecast unless you pass charts or getCharts. Applies ip-platform for you.',
    importStatement: `import { EnsembleForecast } from '@infoplaza/platform/ensemble'`,
    notes: [
      'Do not pass a models array. The catalog is loaded from the auth route.',
      'When model / defaultModel are omitted, the provider selects ecmwfensembleglobal if it is in the catalog, otherwise the first model.',
      'showToolbar and showFooter default to true.',
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
        name: 'showToolbar',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Render the model / run pill toolbar.',
      },
      {
        name: 'showFooter',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Render element-group and Basic / Expert pills.',
      },
      {
        name: 'view / defaultView / onViewChange',
        type: "'basic' | 'expert'",
        defaultValue: "'basic'",
        description: 'Chart density. Expert shows more member detail.',
      },
      {
        name: 'charts',
        type: 'EnsembleChartBlock[]',
        description: 'Host-owned chart blocks. When defined, skips the point-forecast fetch.',
      },
      {
        name: 'getCharts',
        type: '(options) => EnsembleChartBlock[]',
        description:
          'Sync override when charts is omitted. Receives model, run, elementGroup, view, models, elementGroups, locale, timezone.',
      },
      {
        name: 'locale',
        type: 'string',
        defaultValue: "'en'",
        description: "Date axis labels: 'en' | 'nl' | 'de' | 'it' | 'es' | 'fr'.",
      },
      { name: 'className', type: 'string', description: 'Extra class on the root wrapper.' },
    ],
    example: `<EnsembleForecast
  lat={52.3676}
  lon={4.9041}
  locale="en"
/>`,
  },
  {
    id: 'ensemble-models-provider',
    name: 'EnsembleModelsProvider',
    summary: 'Location-filtered ensemble catalog.',
    description:
      'Required lat and lon. Fetches GET {basePath}/ensemble-models?lat=&lon=. Read-only context: { models, loading, error, lat, lon, basePath }. No models setter.',
    importStatement: `import { EnsembleModelsProvider, useEnsembleModels } from '@infoplaza/platform/ensemble'`,
    notes: [
      'Catalog is API-only. Never pass a models array into Provider or Forecast.',
      'useEnsembleModels() throws outside this provider. useEnsembleModelsContext() is nullable.',
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
        description: 'Auth mount path.',
      },
      { name: 'children', type: 'ReactNode', description: 'Usually EnsembleProvider.' },
    ],
  },
  {
    id: 'ensemble-provider',
    name: 'EnsembleProvider',
    summary: 'Selection, charts, and Basic / Expert view.',
    description:
      'Must sit under EnsembleModelsProvider. Holds model / run / elementGroup / view, loads chart blocks, and exposes them to Toolbar, Builder, and Footer. Extra vs timeseries: view is basic | expert.',
    importStatement: `import { EnsembleProvider, useEnsemble } from '@infoplaza/platform/ensemble'`,
    notes: [
      'charts wins over getCharts wins over the default point-forecast fetch.',
      "run === 'all' fetches one request per catalog runtime and sets each chart subtitle to the formatted runtime.",
      'useEnsemble() throws outside the provider. useEnsembleContext() is nullable.',
    ],
    required: [],
    optional: [
      {
        name: 'model / defaultModel / onModelChange',
        type: 'string',
        description: 'Selected catalog slug. Default DEFAULT_ENSEMBLE_MODEL when present in the catalog.',
      },
      {
        name: 'run / defaultRun / onRunChange',
        type: "number | 'all'",
        description: 'Selected runtime.',
      },
      {
        name: 'elementGroups',
        type: 'EnsembleElementGroup[]',
        defaultValue: 'DEFAULT_ENSEMBLE_ELEMENT_GROUPS',
        description: 'Footer groups (ENSEMBLE_TIMESERIES.groups).',
      },
      {
        name: 'view / defaultView / onViewChange',
        type: "'basic' | 'expert'",
        defaultValue: "'basic'",
        description: 'Chart mode.',
      },
      {
        name: 'charts',
        type: 'EnsembleChartBlock[]',
        description: 'Host override. Each block is a title plus Recharts config.',
      },
      {
        name: 'getCharts',
        type: '(EnsembleGetChartsOptions) => EnsembleChartBlock[]',
        description: 'Sync host override when charts is omitted.',
      },
      {
        name: 'locale',
        type: 'string',
        defaultValue: "'en'",
        description: 'Date axis locale.',
      },
    ],
  },
  {
    id: 'ensemble-toolbar',
    name: 'EnsembleToolbar',
    summary: 'Model and run pills.',
    description:
      'Resolves props ?? context and returns null if neither exists — it does not throw. Reuses timeseries pills internally, not map controls.',
    importStatement: `import { EnsembleToolbar } from '@infoplaza/platform/ensemble'`,
    required: [],
    optional: [
      { name: 'model', type: 'string', description: 'Falls back to context.' },
      { name: 'onModelChange', type: '(slug: string) => void', description: 'Falls back to context.' },
      { name: 'run', type: "number | 'all'", description: 'Falls back to context.' },
      { name: 'onRunChange', type: "(run: number | 'all') => void", description: 'Falls back to context.' },
    ],
  },
  {
    id: 'ensemble-builder',
    name: 'EnsembleBuilder',
    summary: 'Maps chart blocks onto Chart. Does not fetch.',
    description:
      'Requires EnsembleProvider. Loading skeleton, then one chart-block context per EnsembleChartBlock. Clone children once per block.',
    importStatement: `import { EnsembleBuilder, EnsembleChart } from '@infoplaza/platform/ensemble'`,
    required: [],
    optional: [
      {
        name: 'children',
        type: 'ReactNode',
        description: 'Typically <EnsembleChart />.',
      },
    ],
    example: `<EnsembleBuilder>
  <EnsembleChart />
</EnsembleBuilder>`,
  },
  {
    id: 'ensemble-chart',
    name: 'EnsembleChart',
    summary: 'Bridge from block context to EnsembleGraph.',
    description:
      'Reads the current chart block (or explicit graph props) and renders EnsembleGraph.',
    importStatement: `import { EnsembleChart } from '@infoplaza/platform/ensemble'`,
    required: [],
    optional: [
      {
        name: 'config',
        type: 'EnsembleGraphConfig',
        description: 'Explicit Recharts config. Otherwise reads the current builder block.',
      },
    ],
  },
  {
    id: 'ensemble-footer',
    name: 'EnsembleFooter',
    summary: 'Element-group pills and Basic / Expert view.',
    description:
      'Resolves props ?? context and returns null if neither exists. Falls back to DEFAULT_ENSEMBLE_ELEMENT_GROUPS when groups are missing.',
    importStatement: `import { EnsembleFooter } from '@infoplaza/platform/ensemble'`,
    required: [],
    optional: [
      { name: 'elementGroups', type: 'EnsembleElementGroup[]', description: 'Falls back to context.' },
      { name: 'view', type: "'basic' | 'expert'", description: 'Falls back to context.' },
      { name: 'onViewChange', type: "(view: 'basic' | 'expert') => void", description: 'Falls back to context.' },
    ],
  },
  {
    id: 'ensemble-graph',
    name: 'EnsembleGraph',
    summary: 'Low-level Recharts ComposedChart.',
    description:
      'Plume areas, member lines, and stacked bars. Used by EnsembleChart; you can also render it with an explicit config.',
    importStatement: `import { EnsembleGraph } from '@infoplaza/platform/ensemble'`,
    required: [
      {
        name: 'config',
        type: 'EnsembleGraphConfig',
        description: 'Recharts series, areas, and bars for one chart block.',
      },
    ],
    optional: [
      { name: 'id', type: 'string', description: 'DOM id for the chart wrapper.' },
      { name: 'title', type: 'string', description: 'Chart title.' },
      { name: 'titleExtra', type: 'string', description: 'Secondary title, e.g. latest.' },
      { name: 'subtitle', type: 'string', description: 'Shown under the title (e.g. formatted runtime).' },
      { name: 'fixedWidth', type: 'number', description: 'Optional fixed pixel width.' },
      { name: 'fixedHeight', type: 'number', description: 'Optional fixed pixel height.' },
    ],
  },
]
