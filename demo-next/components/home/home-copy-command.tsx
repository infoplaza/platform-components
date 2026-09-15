'use client'

import { useEffect, useState } from 'react'

export function HomeCopyCommand({
  command,
  tone = 'light',
}: {
  command: string
  tone?: 'light' | 'dark'
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function copyCommand() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
  }

  return (
    <div
      className={
        tone === 'dark'
          ? 'flex w-full min-w-0 items-center gap-2 rounded-md border border-white/10 bg-white/5 py-1.5 pr-1.5 pl-3 font-mono text-xs text-cloud'
          : 'flex w-full min-w-0 items-center gap-2 rounded-md border border-dark/10 bg-white py-1.5 pr-1.5 pl-3 font-mono text-xs text-dark shadow-sm'
      }
    >
      <span className="min-w-0 truncate">
        <span className="text-primary">$</span> {command}
      </span>
      <button
        type="button"
        className={
          tone === 'dark'
            ? 'inline-flex shrink-0 items-center rounded-md px-2 py-1 text-2xs font-medium text-white/60 hover:bg-white/10 hover:text-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
            : 'inline-flex shrink-0 items-center rounded-md px-2 py-1 text-2xs font-medium text-dark/60 hover:bg-dark/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
        }
        onClick={copyCommand}
        aria-label={copied ? 'Install command copied' : 'Copy install command'}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
