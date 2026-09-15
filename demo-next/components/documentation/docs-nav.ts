import {
  INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL,
  INFOPLAZA_PLATFORM_EXAMPLES_MAPS_URL,
  INFOPLAZA_PLATFORM_EXAMPLES_URL,
  INFOPLAZA_PLATFORM_INTRO_URL,
} from '../../lib/infoplaza-platform'

export type DocsNavChild = {
  href: string
  label: string
  external?: boolean
}

export type DocsNavItem = {
  href: string
  label: string
  external?: boolean
  children?: readonly DocsNavChild[]
}

export type DocsNavGroup = {
  heading: string
  items: readonly DocsNavItem[]
}

export const DOCS_NAV_GROUPS: readonly DocsNavGroup[] = [
  {
    heading: 'Getting started',
    items: [
      { href: '/documentation', label: 'Introduction' },
      { href: '/documentation/install', label: 'Installation' },
      {
        href: INFOPLAZA_PLATFORM_INTRO_URL,
        label: 'API keys',
        external: true,
      },
      {
        href: INFOPLAZA_PLATFORM_EXAMPLES_URL,
        label: 'Token usage',
        external: true,
      },
      {
        href: '/documentation/auth',
        label: 'Server setup',
        children: [
          { href: '/documentation/auth#create-token', label: 'Create a token' },
        ],
      },
      { href: '/documentation/maplibre', label: 'MapLibre 6' },
      { href: '/documentation/styling', label: 'Styling' },
      { href: '/documentation/quick-start', label: 'Quick start' },
    ],
  },
  {
    heading: 'Components',
    items: [
      {
        href: '/documentation/map',
        label: 'Map',
        children: [
          { href: '/documentation/map#platform-map', label: 'PlatformMap' },
          { href: '/documentation/map#weather-layers', label: 'WeatherLayers' },
          { href: '/documentation/map#map-control-hud', label: 'MapControlHud' },
          { href: '/documentation/map#map-providers', label: 'Providers' },
          { href: '/documentation/map#map-layers', label: 'Layers' },
          { href: '/documentation/map#map-events', label: 'Events' },
          { href: '/documentation/map#deprecated', label: 'Deprecated' },
          {
            href: INFOPLAZA_PLATFORM_EXAMPLES_MAPS_URL,
            label: 'Token usage',
            external: true,
          },
        ],
      },
      {
        href: '/documentation/timeseries',
        label: 'Timeseries',
        children: [
          { href: '/documentation/timeseries#timeseries-forecast', label: 'TimeseriesForecast' },
          { href: '/documentation/timeseries#timeseries-models-provider', label: 'ModelsProvider' },
          { href: '/documentation/timeseries#timeseries-provider', label: 'Provider' },
          { href: '/documentation/timeseries#timeseries-table', label: 'Table' },
          {
            href: INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL,
            label: 'Token usage',
            external: true,
          },
        ],
      },
      {
        href: '/documentation/ensemble',
        label: 'Ensemble',
        children: [
          { href: '/documentation/ensemble#ensemble-forecast', label: 'EnsembleForecast' },
          { href: '/documentation/ensemble#ensemble-models-provider', label: 'ModelsProvider' },
          { href: '/documentation/ensemble#ensemble-provider', label: 'Provider' },
          { href: '/documentation/ensemble#ensemble-graph', label: 'Graph' },
          {
            href: INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL,
            label: 'Token usage',
            external: true,
          },
        ],
      },
    ],
  },
  {
    heading: 'Guides',
    items: [
      { href: '/documentation/map-styles', label: 'Map styles' },
      { href: '/documentation/migration', label: 'Migration' },
      { href: '/documentation/nextjs', label: 'Next.js' },
    ],
  },
]

export const DOCS_NAV_ITEMS = DOCS_NAV_GROUPS.flatMap((group) => group.items)

export function isDocsNavItemActive(href: string, pathname: string) {
  if (href.startsWith('http://') || href.startsWith('https://')) return false
  if (href === '/documentation') return pathname === '/documentation'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isDocsNavChildActive(href: string, pathname: string, hash: string) {
  const [path, itemHash] = href.split('#')
  if (pathname !== path) return false
  if (itemHash) return hash === `#${itemHash}`
  return !hash
}
