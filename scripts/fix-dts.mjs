// Post-processes emitted declaration files so the published package contains no
// internal TypeScript path aliases (`@/src/*`, `@/@types/*`, `@/config/*`).
//
// `tsc` does not rewrite `paths` aliases when emitting declarations, so without
// this step consumers receive `.d.ts` files that import from `@/src/...` /
// `@/@types/...` which they cannot resolve. We:
//   1. copy the ambient `@types` declarations into `dist/@types`
//   2. rewrite every alias import in `dist/**/*.d.ts` to a relative path
//   3. fix the (originally repo-root-relative) imports inside the copied types
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')
const typesSrcDir = path.join(rootDir, '@types')
const typesOutDir = path.join(distDir, '@types')

// Maps an alias prefix to its on-disk location inside `dist`.
const aliasTargets = {
  '@/src': distDir,
  '@/@types': typesOutDir,
  '@/config': path.join(distDir, 'config'),
}

const ALIAS_RE = /(['"])(@\/(?:src|@types|config))((?:\/[^'"]*)?)\1/g

function toRelative(fromDir, target) {
  let rel = path.relative(fromDir, target)
  if (!rel.startsWith('.')) {
    rel = `./${rel}`
  }
  return rel.split(path.sep).join('/')
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) return walk(full)
      return entry.isFile() && full.endsWith('.d.ts') ? [full] : []
    }),
  )
  return files.flat()
}

async function copyTypes() {
  await fs.mkdir(typesOutDir, { recursive: true })
  let entries = []
  try {
    entries = await fs.readdir(typesSrcDir)
  } catch {
    return
  }
  for (const name of entries) {
    if (name.endsWith('.d.ts')) {
      await fs.copyFile(path.join(typesSrcDir, name), path.join(typesOutDir, name))
    }
  }
}

async function rewriteFile(file) {
  const dir = path.dirname(file)
  let code = await fs.readFile(file, 'utf8')

  code = code.replace(ALIAS_RE, (_match, quote, alias, rest) => {
    const target = rest
      ? path.join(aliasTargets[alias], rest.slice(1))
      : aliasTargets[alias]
    return `${quote}${toRelative(dir, target)}${quote}`
  })

  // The copied ambient types were authored relative to the repo root, fix those
  // up so they resolve from `dist/@types`.
  if (dir === typesOutDir) {
    code = code
      .replace(/(['"])\.\.\/\.\.\/connections\//g, `$1../connections/`)
      .replace(/(['"])\.\/layer\1/g, `$1./layer.types$1`)
  }

  await fs.writeFile(file, code)
}

async function main() {
  await copyTypes()
  const files = await walk(distDir)
  await Promise.all(files.map(rewriteFile))
  console.log(`fix-dts: rewrote ${files.length} declaration files`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
