type DocsPlaceholderProps = {
  title: string
}

export function DocsPlaceholder({ title }: DocsPlaceholderProps) {
  return (
    <section className="p-4 md:p-8">
      <p className="mb-1.5 text-2xs font-semibold uppercase tracking-widest text-primary">
        Documentation
      </p>
      <h1 className="m-0 text-2xl font-bold tracking-tight text-dark">{title}</h1>
      <p className="m-0 mt-2 text-sm leading-relaxed text-dark/60">… in progress</p>
    </section>
  )
}
