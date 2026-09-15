import type { ReactNode } from 'react'
import { DocsCodeBlock } from './docs-code-block'
import { DocsComponentSection, type DocsComponent } from './docs-component-section'

type DocsPackageSectionProps = {
  id: string
  title: string
  packageName?: string
  description: ReactNode
  importStatement?: string
  typesNote?: ReactNode
  items: DocsComponent[]
}

export function DocsPackageSection({
  id,
  title,
  packageName,
  description,
  importStatement,
  typesNote,
  items,
}: DocsPackageSectionProps) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-10">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="m-0 text-xl font-bold tracking-tight text-dark">{title}</h2>
          {packageName ? (
            <p className="m-0 mt-1 font-mono text-xs text-dark/50">{packageName}</p>
          ) : null}
        </div>
        <div className="text-sm leading-relaxed text-dark/60">{description}</div>
        {importStatement ? <DocsCodeBlock>{importStatement}</DocsCodeBlock> : null}
        {typesNote ? (
          <p className="m-0 text-sm leading-relaxed text-dark/60">{typesNote}</p>
        ) : null}
        <nav className="flex flex-wrap gap-2" aria-label={`${title} exports`}>
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md bg-primary/10 px-2.5 py-1.5 font-mono text-xs font-medium text-primary no-underline hover:bg-primary/20"
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      {items.map((item) => (
        <DocsComponentSection key={item.id} component={item} />
      ))}
    </section>
  )
}
