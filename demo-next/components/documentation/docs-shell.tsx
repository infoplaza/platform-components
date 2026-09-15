import type { ReactNode } from 'react'
import { DocsSidebar } from './docs-sidebar'

type DocsShellProps = {
  children: ReactNode
}

export function DocsShell({ children }: DocsShellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <DocsSidebar />
      <div data-docs-page className="min-h-0 min-w-0 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
