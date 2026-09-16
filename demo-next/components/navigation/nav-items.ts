import { INFOPLAZA_PLATFORM_EXAMPLES_URL, INFOPLAZA_PLATFORM_INTRO_URL } from '../../lib/infoplaza-platform'

export type NavItem = {
  href: string
  label: string
  hint: string
  external?: boolean
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: '/demo',
    label: 'Demo',
            hint: 'Map, timeseries, and ensemble examples',
  },
  {
    href: '/documentation',
    label: 'Documentation',
    hint: 'In progress',
  },
  {
    href: INFOPLAZA_PLATFORM_INTRO_URL,
    label: 'API keys',
    hint: 'Create and manage tokens',
    external: true,
  },
  {
    href: INFOPLAZA_PLATFORM_EXAMPLES_URL,
    label: 'Token usage',
    hint: 'API requests and credit cost',
    external: true,
  },
  {
    href: '/about',
    label: 'About',
    hint: 'SDK, versions, Infoplaza',
  },
]

export function isNavItemActive(href: string, pathname: string) {
  if (href.startsWith('http://') || href.startsWith('https://')) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
