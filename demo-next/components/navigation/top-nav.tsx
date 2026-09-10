'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { isNavItemActive, NAV_ITEMS } from './nav-items'

const desktopNavClass =
  'hidden md:inline-flex shrink-0 items-center gap-1'
const mobilePanelClass =
  'fixed inset-x-0 top-14 z-40 border-b border-dark/10 bg-white px-3 py-2 shadow-md md:hidden'
const menuButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-dark hover:bg-dark/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:hidden'

function navLinkClass(isActive: boolean, variant: 'bar' | 'menu') {
  if (variant === 'bar') {
    return isActive
      ? 'rounded-md px-2.5 py-1.5 text-sm font-medium text-primary'
      : 'rounded-md px-2.5 py-1.5 text-sm font-medium text-dark/60 hover:text-primary'
  }

  return isActive
    ? 'block rounded-md px-3 py-2.5 text-sm font-medium bg-primary/10 text-primary'
    : 'block rounded-md px-3 py-2.5 text-sm font-medium text-dark/80 hover:bg-dark/5 hover:text-primary'
}

export function TopNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    const media = window.matchMedia('(min-width: 768px)')
    function onViewportChange() {
      if (media.matches) setMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    media.addEventListener('change', onViewportChange)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      media.removeEventListener('change', onViewportChange)
    }
  }, [menuOpen])

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

      <nav className={desktopNavClass} aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(item.href, pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(isActive, 'bar')}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        type="button"
        className={menuButtonClass}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-x-0 top-14 bottom-0 z-30 cursor-pointer border-0 bg-dark/20 p-0 md:hidden"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          />
          <nav id={menuId} className={mobilePanelClass} aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const isActive = isNavItemActive(item.href, pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(isActive, 'menu')}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </>
      ) : null}
    </div>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 8h18a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2Zm18 8H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2Zm0-5H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2Z"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59 7.71 6.29A1 1 0 0 0 6.29 7.71L10.59 12l-4.3 4.29a1 1 0 0 0 1.42 1.42L12 13.41l4.29 4.3a1 1 0 0 0 1.42-1.42Z"
      />
    </svg>
  )
}
