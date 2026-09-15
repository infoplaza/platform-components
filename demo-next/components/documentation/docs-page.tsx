import type { ReactNode } from 'react'

type DocsPageProps = {
  title: string
  packageName?: string
  description: ReactNode
  children: ReactNode
}

export function DocsPage({
  title,
  packageName,
  description,
  children,
}: DocsPageProps) {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-10 p-4 md:p-8">
      <header>
        <p className="mb-1.5 text-2xs font-semibold uppercase tracking-widest text-primary">
          Documentation
        </p>
        <h1 className="m-0 text-2xl font-bold tracking-tight text-dark">{title}</h1>
        {packageName ? (
          <p className="m-0 mt-2 font-mono text-xs text-dark/50">{packageName}</p>
        ) : null}
        <div className="mt-3 text-sm leading-relaxed text-dark/60">{description}</div>
      </header>
      {children}
    </section>
  )
}
