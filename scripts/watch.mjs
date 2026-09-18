// Incremental library rebuild: JS (rollup --watch), declarations (tsc --watch
// + fix-dts), and both CSS bundles (tailwind --watch). Does not wipe `dist`.
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')
const bin = (name) => path.join(rootDir, 'node_modules', '.bin', name)

mkdirSync(distDir, { recursive: true })

const children = []
let shuttingDown = false
let fixDtsTimer = null
let fixDtsRunning = false
let fixDtsQueued = false

function prefixLines(label, chunk, stream) {
  const text = chunk.toString()
  const endsWithNewline = text.endsWith('\n')
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (i === lines.length - 1 && !endsWithNewline) {
      stream.write(line)
      continue
    }
    stream.write(line.length === 0 ? '\n' : `[${label}] ${line}\n`)
  }
}

function start(label, command, args, { onLine } = {}) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push(child)

  let stdoutBuf = ''
  child.stdout.on('data', (chunk) => {
    prefixLines(label, chunk, process.stdout)
    if (!onLine) return
    stdoutBuf += chunk.toString()
    const parts = stdoutBuf.split('\n')
    stdoutBuf = parts.pop() ?? ''
    for (const line of parts) onLine(line)
  })
  child.stderr.on('data', (chunk) => prefixLines(label, chunk, process.stderr))

  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`
    console.error(`[watch] ${label} exited (${reason})`)
    shutdown(code === 0 ? 1 : code ?? 1)
  })

  return child
}

function runFixDts() {
  if (fixDtsRunning) {
    fixDtsQueued = true
    return
  }
  fixDtsRunning = true
  const child = spawn(process.execPath, [path.join(rootDir, 'scripts', 'fix-dts.mjs')], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout.on('data', (chunk) => prefixLines('dts', chunk, process.stdout))
  child.stderr.on('data', (chunk) => prefixLines('dts', chunk, process.stderr))
  child.on('exit', () => {
    fixDtsRunning = false
    if (fixDtsQueued) {
      fixDtsQueued = false
      runFixDts()
    }
  })
}

function scheduleFixDts(line) {
  if (!line.includes('Watching for file changes')) return
  clearTimeout(fixDtsTimer)
  fixDtsTimer = setTimeout(runFixDts, 150)
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true
  clearTimeout(fixDtsTimer)
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
  process.exit(exitCode)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

console.log(
  '[watch] rebuilding JS, types, and CSS on change. Pair with `npm run demo:next` in another terminal.',
)

start('rollup', bin('rollup'), ['-c', '--watch'])
start(
  'tsc',
  bin('tsc'),
  [
    '-p',
    'tsconfig.json',
    '--emitDeclarationOnly',
    '--ignoreDeprecations',
    '6.0',
    '--watch',
    '--preserveWatchOutput',
  ],
  { onLine: scheduleFixDts },
)
start('css', bin('tailwindcss'), [
  '-i',
  './src/styles/tailwind.css',
  '-o',
  './dist/styles.css',
  '--watch=always',
])
start('css:embed', bin('tailwindcss'), [
  '-i',
  './src/styles/tailwind.embed.css',
  '-o',
  './dist/styles.embed.css',
  '--watch=always',
])
