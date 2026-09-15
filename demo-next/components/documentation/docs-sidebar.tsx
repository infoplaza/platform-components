'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  DOCS_NAV_GROUPS,
  DOCS_NAV_ITEMS,
  isDocsNavChildActive,
  isDocsNavItemActive,
  type DocsNavItem,
} from './docs-nav'

function parentLinkClass(isActive: boolean, variant: 'sidebar' | 'bar') {
  if (variant === 'sidebar') {
    return isActive
      ? 'rounded-md bg-primary/10 px-2.5 py-1.5 text-sm font-medium text-primary'
      : 'rounded-md px-2.5 py-1.5 text-sm font-medium text-dark/70 hover:bg-dark/5 hover:text-primary'
  }

  return isActive
    ? 'shrink-0 rounded-md bg-primary/10 px-2.5 py-1.5 text-sm font-medium text-primary'
    : 'shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium text-dark/70 hover:bg-dark/5 hover:text-primary'
}

function childLinkClass(isActive: boolean) {
  return isActive
    ? 'rounded-md bg-primary/10 px-2.5 py-1 text-[13px] font-medium text-primary'
    : 'rounded-md px-2.5 py-1 text-[13px] font-medium text-dark/60 hover:bg-dark/5 hover:text-primary'
}

function DocsParentLink({
  item,
  isActive,
  variant,
  hash,
  onInternalClick,
}: {
  item: DocsNavItem
  isActive: boolean
  variant: 'sidebar' | 'bar'
  hash?: string
  onInternalClick?: () => void
}) {
  const className = parentLinkClass(isActive, variant)

  if (item.external) {
    return (
      <a href={item.href} className={className} rel="noreferrer" target="_blank">
        {item.label}
      </a>
    )
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-current={isActive && !hash ? 'page' : undefined}
      onClick={onInternalClick}
    >
      {item.label}
    </Link>
  )
}

export function DocsSidebar() {
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [pathname])

  return (
    <>
      <aside className="hidden h-full w-56 shrink-0 overflow-auto border-r border-dark/10 bg-white md:block">
        <nav className="flex flex-col gap-4 p-3" aria-label="Documentation">
          {DOCS_NAV_GROUPS.map((group) => (
            <div key={group.heading} className="flex flex-col gap-1">
              <p className="mb-0.5 px-2.5 text-2xs font-semibold uppercase tracking-widest text-dark/50">
                {group.heading}
              </p>
              {group.items.map((item) => {
                const isActive = isDocsNavItemActive(item.href, pathname)
                return (
                  <div key={item.href} className="flex flex-col gap-0.5">
                    <DocsParentLink
                      item={item}
                      isActive={isActive}
                      variant="sidebar"
                      hash={hash}
                      onInternalClick={() => {
                        setHash('')
                        if (pathname === item.href) {
                          document
                            .querySelector('[data-docs-page]')
                            ?.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      }}
                    />
                    {isActive && item.children ? (
                      <div className="mb-1 ml-2 flex flex-col gap-0.5 border-l border-dark/10 pl-2">
                        {item.children.map((child) => {
                          if (child.external) {
                            return (
                              <a
                                key={child.href}
                                href={child.href}
                                className={childLinkClass(false)}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {child.label}
                              </a>
                            )
                          }

                          const childActive = isDocsNavChildActive(
                            child.href,
                            pathname,
                            hash,
                          )
                          const childHash = child.href.split('#')[1]
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={childLinkClass(childActive)}
                              aria-current={childActive ? 'page' : undefined}
                              onClick={() => {
                                setHash(childHash ? `#${childHash}` : '')
                                if (childHash) {
                                  requestAnimationFrame(() => {
                                    document
                                      .getElementById(childHash)
                                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                  })
                                }
                              }}
                            >
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      <nav
        className="flex gap-1 overflow-x-auto border-b border-dark/10 bg-white px-3 py-2 md:hidden"
        aria-label="Documentation"
      >
        {DOCS_NAV_ITEMS.map((item) => (
          <DocsParentLink
            key={item.href}
            item={item}
            isActive={isDocsNavItemActive(item.href, pathname)}
            variant="bar"
          />
        ))}
      </nav>
    </>
  )
}
