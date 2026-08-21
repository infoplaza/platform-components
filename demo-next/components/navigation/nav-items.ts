export const NAV_ITEMS = [
  {
    href: '/',
    label: 'Demo',
    hint: 'BaseMap, weather layers and HUD',
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
