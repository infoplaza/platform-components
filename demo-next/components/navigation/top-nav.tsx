'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isNavItemActive, NAV_ITEMS } from './nav-items'

export function TopNav() {
  const pathname = usePathname()

  return (
    <div className="top-nav">
      <Link className="top-nav__brand" href="/">
        <span className="top-nav__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M4 16.5 12 6l8 10.5H4Z"
              fill="currentColor"
              opacity="0.35"
            />
            <path d="M6.5 19 12 11.5 17.5 19H6.5Z" fill="currentColor" />
          </svg>
        </span>
        <span className="top-nav__titles">
          <span className="top-nav__name">Infoplaza</span>
          <span className="top-nav__product">Platform Components</span>
        </span>
      </Link>
      <nav className="top-nav__links" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(item.href, pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive ? 'top-nav__link top-nav__link--active' : 'top-nav__link'
              }
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
