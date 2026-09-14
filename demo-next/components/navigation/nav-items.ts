export const NAV_ITEMS = [
  {
    href: '/',
    label: 'Map',
    hint: 'PlatformMap shell (± WeatherLayers)',
  },
  {
    href: '/timeseries',
    label: 'Timeseries',
    hint: 'Forecast table',
  },
  {
    href: '/ensemble',
    label: 'Ensemble',
    hint: 'Ensemble plume charts',
  },
  {
    href: '/documentation',
    label: 'Documentation',
    hint: 'In progress',
  },
  {
    href: '/about',
    label: 'About',
    hint: 'In progress',
  },
] as const

export function isNavItemActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
