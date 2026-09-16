import {
  INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL,
  INFOPLAZA_PLATFORM_EXAMPLES_MAPS_URL,
} from '../../lib/infoplaza-platform'

export type DemoNavChild = {
  href: string
  label: string
  external?: boolean
}

export type DemoNavItem = {
  href: string
  label: string
  children?: readonly DemoNavChild[]
}

export const DEMO_NAV_ITEMS: readonly DemoNavItem[] = [
  {
    href: '/demo',
    label: 'Map',
    children: [
      { href: '/demo#base-map', label: 'Base Map' },
      { href: '/demo#map-with-weather', label: 'Map with weather' },
      { href: '/demo#composed-stack', label: 'Composed stack' },
      { href: '/demo#custom-hud', label: 'Custom HUD' },
      { href: '/demo#palette', label: 'Palette' },
      {
        href: INFOPLAZA_PLATFORM_EXAMPLES_MAPS_URL,
        label: 'Token usage',
        external: true,
      },
    ],
  },
  {
    href: '/demo/timeseries',
    label: 'Timeseries',
    children: [
      { href: '/demo/timeseries#packaged', label: 'Packaged' },
      { href: '/demo/timeseries#palette', label: 'Palette' },
      { href: '/demo/timeseries#custom-location', label: 'Custom location' },
      { href: '/demo/timeseries#chart-only', label: 'Chart only' },
      { href: '/demo/timeseries#composed', label: 'Composed' },
      {
        href: INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL,
        label: 'Token usage',
        external: true,
      },
    ],
  },
  {
    href: '/demo/timeseries-charts',
    label: 'Timeseries charts',
    children: [
      { href: '/demo/timeseries-charts#packaged', label: 'Packaged' },
      { href: '/demo/timeseries-charts#marine', label: 'Marine' },
      { href: '/demo/timeseries-charts#chart-only', label: 'Chart only' },
      { href: '/demo/timeseries-charts#composed', label: 'Composed' },
      { href: '/demo/timeseries-charts#custom-elements', label: 'Custom elements' },
      {
        href: INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL,
        label: 'Token usage',
        external: true,
      },
    ],
  },
  {
    href: '/demo/ensemble',
    label: 'Ensemble',
    children: [
      { href: '/demo/ensemble#packaged', label: 'Packaged' },
      { href: '/demo/ensemble#chart-only', label: 'Chart only' },
      { href: '/demo/ensemble#composed', label: 'Composed' },
      {
        href: INFOPLAZA_PLATFORM_EXAMPLES_CHARTS_URL,
        label: 'Token usage',
        external: true,
      },
    ],
  },
]

export function isDemoNavItemActive(href: string, pathname: string) {
  if (href === '/demo') return pathname === '/demo'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isDemoNavChildActive(href: string, pathname: string, hash: string) {
  const [path, itemHash] = href.split('#')
  if (!itemHash || pathname !== path) return false
  return hash === `#${itemHash}`
}
