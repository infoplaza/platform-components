import type { ReactNode } from 'react'
import { DemoShell } from '../../components/demo'

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <DemoShell>{children}</DemoShell>
}
