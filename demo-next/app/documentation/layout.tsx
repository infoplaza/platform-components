import type { ReactNode } from 'react'
import { DocsShell } from '../../components/documentation'

export default function DocumentationLayout({ children }: { children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>
}
