import type { NpmVersion } from './npm-versions'
import { homeContainerClass, homeSectionClass } from '../home/home-styles'

const NPM_URL = 'https://www.npmjs.com/package/@infoplaza/platform'
const NPM_VERSIONS_URL = `${NPM_URL}?activeTab=versions`
const GITHUB_URL = 'https://github.com/infoplaza/platform-components'

function formatPublishedAt(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function AboutVersions({ versions }: { versions: NpmVersion[] | null }) {
  return (
    <section id="versions" className={`${homeSectionClass} bg-white`}>
      <div className={homeContainerClass}>
        <p className="m-0 text-2xs font-semibold uppercase tracking-widest text-primary">
          Version history
        </p>
        <h2 className="mt-2 mb-0 max-w-2xl text-2xl font-bold tracking-tight text-dark md:text-3xl">
          Published on npm as @infoplaza/platform.
        </h2>
        <p className="mt-3 mb-0 max-w-2xl text-sm leading-relaxed text-dark/60">
          Versions refresh from the npm registry. Source and issue history live on GitHub.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <a
            href={NPM_VERSIONS_URL}
            className="text-sm font-semibold text-primary no-underline hover:text-[#00a86a]"
            rel="noreferrer"
            target="_blank"
          >
            All npm versions
            <span aria-hidden="true"> →</span>
          </a>
          <a
            href={GITHUB_URL}
            className="text-sm font-semibold text-primary no-underline hover:text-[#00a86a]"
            rel="noreferrer"
            target="_blank"
          >
            GitHub repository
            <span aria-hidden="true"> →</span>
          </a>
        </div>

        {versions ? (
          <div className="mt-8 overflow-x-auto rounded-xl border border-dark/8">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <caption className="sr-only">@infoplaza/platform npm versions</caption>
              <thead className="bg-cloud">
                <tr>
                  <th className="px-4 py-3 font-semibold text-dark">Version</th>
                  <th className="px-4 py-3 font-semibold text-dark">Published</th>
                  <th className="px-4 py-3 font-semibold text-dark">npm</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((entry, index) => (
                  <tr key={entry.version} className="border-t border-dark/8">
                    <td className="px-4 py-3 font-mono text-xs text-dark">
                      <span className="inline-flex items-center gap-2">
                        {entry.version}
                        {index === 0 ? (
                          <span className="rounded-full bg-primary-10 px-2 py-0.5 font-sans text-2xs font-semibold uppercase tracking-widest text-primary">
                            Latest
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-dark/65">
                      {formatPublishedAt(entry.publishedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`${NPM_URL}/v/${entry.version}`}
                        className="font-semibold text-primary no-underline hover:text-[#00a86a]"
                        rel="noreferrer"
                        target="_blank"
                      >
                        View
                        <span aria-hidden="true"> →</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-8 mb-0 rounded-xl border border-dark/8 bg-cloud px-4 py-5 text-sm text-dark/65">
            Could not load versions from npm. See the{' '}
            <a
              href={NPM_VERSIONS_URL}
              className="font-semibold text-primary no-underline hover:text-[#00a86a]"
              rel="noreferrer"
              target="_blank"
            >
              npm version list
            </a>{' '}
            or the{' '}
            <a
              href={GITHUB_URL}
              className="font-semibold text-primary no-underline hover:text-[#00a86a]"
              rel="noreferrer"
              target="_blank"
            >
              GitHub repository
            </a>
            .
          </p>
        )}
      </div>
    </section>
  )
}
