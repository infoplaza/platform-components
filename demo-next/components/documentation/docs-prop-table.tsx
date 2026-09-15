export type DocsProp = {
  name: string
  type: string
  defaultValue?: string
  description: string
}

type DocsPropTableProps = {
  title: string
  props: DocsProp[]
  nameColumn?: string
  hideIfEmpty?: boolean
}

export function DocsPropTable({
  title,
  props,
  nameColumn = 'Prop',
  hideIfEmpty = false,
}: DocsPropTableProps) {
  if (props.length === 0) {
    if (hideIfEmpty) return null
    return (
      <div>
        <h3 className="m-0 mb-2 text-sm font-semibold text-dark">{title}</h3>
        <p className="m-0 text-sm text-dark/50">None.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-sm font-semibold text-dark">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-cloud/20">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead className="bg-cloud-500 text-2xs font-semibold uppercase tracking-widest text-dark/50">
            <tr>
              <th className="px-3 py-2 font-semibold">{nameColumn}</th>
              <th className="px-3 py-2 font-semibold">Type</th>
              <th className="px-3 py-2 font-semibold">Default</th>
              <th className="px-3 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop) => (
              <tr key={prop.name} className="border-t border-cloud/20 align-top">
                <td className="px-3 py-2.5 font-mono text-xs font-medium text-dark">
                  {prop.name}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-dark/70">
                  {prop.type}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-dark/50">
                  {prop.defaultValue ?? '—'}
                </td>
                <td className="px-3 py-2.5 text-sm leading-relaxed text-dark/70">
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
