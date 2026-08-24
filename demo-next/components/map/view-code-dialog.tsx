'use client'

import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { MAP_DEMO_FILENAME, MAP_DEMO_SOURCE } from './map-example'

const actionButtonClass =
  'inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'

export function ViewCodeButton() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function copySource() {
    await navigator.clipboard.writeText(MAP_DEMO_SOURCE)
    setCopied(true)
  }

  return (
    <>
      <button type="button" className={actionButtonClass} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path
            d="M5.5 3.5 1.75 8 5.5 12.5M10.5 3.5 14.25 8 10.5 12.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        View code
      </button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
              <button
                type="button"
                className="absolute inset-0 cursor-pointer border-0 bg-dark/40 p-0"
                aria-label="Close code dialog"
                onClick={() => setOpen(false)}
              />
              <div
                className="relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <header className="flex shrink-0 items-start justify-between gap-4 p-4">
                  <div>
                    <h2 id={titleId} className="m-0 text-base font-semibold tracking-tight text-dark">
                      Map code
                    </h2>
                    <p className="m-0 text-sm text-dark/60">Composition used by this demo</p>
                  </div>
                  <div className="inline-flex shrink-0 items-center gap-2">
                    <button type="button" className={actionButtonClass} onClick={copySource}>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-dark/50 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      onClick={() => setOpen(false)}
                      aria-label="Close"
                    >
                      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                        <path
                          d="M4 4l8 8M12 4l-8 8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </header>
                <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-dark/10 bg-cloud">
                  <div className="shrink-0 border-b border-dark/10 bg-white px-3.5 py-2 text-xs font-semibold text-dark/60">
                    {MAP_DEMO_FILENAME}
                  </div>
                  <pre className="m-0 min-h-0 flex-1 overflow-auto p-3.5 font-mono text-xs leading-relaxed text-dark">
                    <code>{MAP_DEMO_SOURCE}</code>
                  </pre>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
