import { DocsCodeBlock } from './docs-code-block'
import { DocsPropTable, type DocsProp } from './docs-prop-table'

export type DocsRelatedType = {
  name: string
  description: string
  fields: DocsProp[]
}

export type DocsComponent = {
  id: string
  name: string
  summary: string
  description: string
  importStatement: string
  kind?: 'component' | 'hook'
  deprecated?: boolean
  notes?: string[]
  required: DocsProp[]
  optional: DocsProp[]
  returns?: DocsProp[]
  relatedTypes?: DocsRelatedType[]
  example?: string
}

type DocsComponentSectionProps = {
  component: DocsComponent
}

export function DocsComponentSection({ component }: DocsComponentSectionProps) {
  const isHook = component.kind === 'hook'
  const requiredTitle = isHook ? 'Required arguments' : 'Required props'
  const optionalTitle = isHook ? 'Optional arguments' : 'Optional props'
  const hideEmptyArgs = isHook

  return (
    <article id={component.id} className="scroll-mt-6">
      <div className="flex flex-col gap-6 border-t border-cloud/20 pt-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 font-mono text-lg font-semibold tracking-tight text-dark">
              {component.name}
            </h2>
            {component.deprecated ? (
              <span className="rounded-md bg-gold/15 px-2 py-0.5 text-2xs font-semibold uppercase tracking-widest text-dark/70">
                Deprecated
              </span>
            ) : null}
          </div>
          <p className="m-0 mt-1 text-sm font-medium text-dark/80">{component.summary}</p>
          <p className="m-0 mt-2 text-sm leading-relaxed text-dark/60">
            {component.description}
          </p>
        </div>

        <DocsCodeBlock>{component.importStatement}</DocsCodeBlock>

        {component.notes && component.notes.length > 0 ? (
          <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-dark/60">
            {component.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}

        <DocsPropTable
          title={requiredTitle}
          props={component.required}
          hideIfEmpty={hideEmptyArgs}
        />
        <DocsPropTable
          title={optionalTitle}
          props={component.optional}
          hideIfEmpty={hideEmptyArgs}
        />
        {isHook && component.required.length === 0 && component.optional.length === 0 ? (
          <div>
            <h3 className="m-0 mb-2 text-sm font-semibold text-dark">Arguments</h3>
            <p className="m-0 text-sm text-dark/50">None.</p>
          </div>
        ) : null}

        {component.returns ? (
          <DocsPropTable
            title="Returns"
            props={component.returns}
            nameColumn="Name"
          />
        ) : null}

        {component.relatedTypes?.map((related) => (
          <div key={related.name} className="flex flex-col gap-2">
            <h3 className="m-0 text-sm font-semibold text-dark">
              <span className="font-mono">{related.name}</span>
            </h3>
            <p className="m-0 text-sm leading-relaxed text-dark/60">{related.description}</p>
            <DocsPropTable title="Fields" props={related.fields} nameColumn="Name" />
          </div>
        ))}

        {component.example ? (
          <div className="flex flex-col gap-2">
            <h3 className="m-0 text-sm font-semibold text-dark">Example</h3>
            <DocsCodeBlock>{component.example}</DocsCodeBlock>
          </div>
        ) : null}
      </div>
    </article>
  )
}
