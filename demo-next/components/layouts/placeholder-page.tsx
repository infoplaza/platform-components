type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="m-0 text-lg font-semibold tracking-tight text-dark">{title}</h1>
      <p className="m-0 text-sm text-dark/60">… in progress</p>
    </section>
  )
}
