'use client'

import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { MAP_DEMO_FILENAME, MAP_DEMO_SOURCE } from './map-example'

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
      <button type="button" className="view-code-button" onClick={() => setOpen(true)}>
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
            <div className="code-dialog">
              <button
                type="button"
                className="code-dialog__backdrop"
                aria-label="Close code dialog"
                onClick={() => setOpen(false)}
              />
              <div
                className="code-dialog__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <header className="code-dialog__header">
                  <div>
                    <h2 id={titleId}>Map code</h2>
                    <p>Composition used by this demo</p>
                  </div>
                  <div className="code-dialog__actions">
                    <button type="button" className="code-dialog__copy" onClick={copySource}>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      className="code-dialog__close"
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
                <div className="code-dialog__well">
                  <div className="code-dialog__filename">{MAP_DEMO_FILENAME}</div>
                  <pre className="code-dialog__source">
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
