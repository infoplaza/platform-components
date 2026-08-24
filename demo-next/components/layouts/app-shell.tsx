import type { ReactNode } from 'react'

type AppShellProps = {
  header: ReactNode
  children: ReactNode
}

export function AppShell({ header, children }: AppShellProps) {
  return (
    <div className="grid h-full min-h-full grid-rows-[3.5rem_1fr]">
      <header className="z-20 border-b border-dark/10 bg-white">{header}</header>
      <main className="min-h-0 min-w-0 overflow-hidden">{children}</main>
    </div>
  )
}
