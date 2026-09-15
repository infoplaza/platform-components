import type { ReactNode } from 'react'

export function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-xs">{children}</code>
}

export function DocsCallout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-dark/80">
      {children}
    </div>
  )
}

export function DocsExternalLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a href={href} className="font-medium text-primary" rel="noreferrer" target="_blank">
      {children}
    </a>
  )
}

export function DocsGuideSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-3">
      <h2 className="m-0 text-xl font-bold tracking-tight text-dark">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-dark/70">{children}</div>
    </section>
  )
}
