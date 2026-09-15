import type { ReactNode } from 'react'
import { DemoSidebar } from './demo-sidebar'

type DemoShellProps = {
  children: ReactNode
}

export function DemoShell({ children }: DemoShellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <DemoSidebar />
      <div data-demo-page className="min-h-0 min-w-0 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
