export type NpmVersion = {
  version: string
  publishedAt: string
}

type NpmRegistryPackage = {
  time?: Record<string, string>
}

function compareSemver(a: string, b: string) {
  const pa = a.split('.').map((part) => Number.parseInt(part, 10) || 0)
  const pb = b.split('.').map((part) => Number.parseInt(part, 10) || 0)
  const length = Math.max(pa.length, pb.length)

  for (let i = 0; i < length; i += 1) {
    const da = pa[i] ?? 0
    const db = pb[i] ?? 0
    if (da !== db) return da - db
  }

  return 0
}

export async function fetchNpmVersions(): Promise<NpmVersion[] | null> {
  try {
    const response = await fetch('https://registry.npmjs.org/@infoplaza/platform', {
      next: { revalidate: 3600 },
    })

    if (!response.ok) return null

    const data = (await response.json()) as NpmRegistryPackage
    if (!data.time) return null

    const versions = Object.entries(data.time)
      .filter(([key]) => key !== 'created' && key !== 'modified')
      .map(([version, publishedAt]) => ({ version, publishedAt }))
      .sort((a, b) => compareSemver(b.version, a.version))

    return versions.length > 0 ? versions : null
  } catch {
    return null
  }
}
