import type { ReactNode } from 'react'

export function HomeBrowserFrame({
  url,
  children,
}: {
  url: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-dark/10 bg-white shadow-2xl shadow-dark/15 ring-1 ring-primary/15">
      <div className="flex items-center gap-2 border-b border-dark/10 bg-cloud-500 px-3 py-2">
        <span className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-dark/20" />
          <span className="size-2 rounded-full bg-dark/20" />
          <span className="size-2 rounded-full bg-dark/20" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-center font-mono text-2xs text-dark/50">
          {url}
        </span>
      </div>
      {children}
    </div>
  )
}
