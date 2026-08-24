'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isNavItemActive, NAV_ITEMS } from './nav-items'

export function TopNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full items-center justify-between gap-4 px-3 md:px-6">
      <Link className="inline-flex min-w-0 items-center gap-2.5 text-inherit no-underline" href="/">
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary"
          aria-hidden="true"
        >
          <img src="/logo.svg" alt="" className="h-5 w-5" />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">Infoplaza</span>
          <span className="hidden text-xs text-dark/60 sm:block">Platform Components</span>
        </span>
      </Link>
      <nav className="inline-flex shrink-0 items-center gap-1" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(item.href, pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? 'rounded-md px-2.5 py-1.5 text-sm font-medium text-primary'
                  : 'rounded-md px-2.5 py-1.5 text-sm font-medium text-dark/60 hover:text-primary'
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
