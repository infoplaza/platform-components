// One-shot codemod: prefixes every Tailwind utility token with the `ip:` prefix
// (Tailwind v4 `prefix(ip)` form) so the package's classes can never collide with
// a host application's own Tailwind utilities.
//
// It is AST-driven (via the bundled TypeScript compiler) so it only ever touches
// strings that are genuinely used as class lists — `className`-style JSX
// attributes, `twMerge(...)` arguments, the `classList.add` arrays in zoom.tsx and
// the `width`/`className` prop + default-parameter class strings. Non-class strings
// (storage keys, titles, aria labels, …) are left untouched.
//
// Run from the package root: `node scripts/prefix-classes.mjs`
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const FILES = [
  'src/components/controls/hud.tsx',
  'src/components/controls/timebars/timebar.tsx',
  'src/components/controls/element.tsx',
  'src/components/controls/element/card.tsx',
  'src/components/controls/element/modal.tsx',
  'src/components/controls/element/filter.tsx',
  'src/components/controls/element/group.tsx',
  'src/components/controls/zoom.tsx',
  'src/components/controls/level.tsx',
  'src/components/forms/dropdown.tsx',
  'src/components/modals/dialog.tsx',
]

// JSX attributes whose value is a class list in these components.
const CLASS_ATTRS = new Set([
  'className',
  'inputClassName',
  'trackClassName',
  'thumbClassName',
  'thumbActiveClassName',
  'markClassName',
  'width',
])

// Identifiers (variables / params) whose initializer is a class list.
const CLASS_BINDINGS = new Set([
  'CONTROL_GROUP_CLASSES',
  'CONTROL_BUTTON_CLASSES',
  'width',
  'className',
])

// Custom, non-Tailwind classes that must never be prefixed.
const DENYLIST = new Set(['slider-track', 'maplibre-themed-control'])

const PREFIX = 'ip:'

function prefixToken(token) {
  if (!token || DENYLIST.has(token) || token.startsWith(PREFIX)) {
    return token
  }
  return PREFIX + token
}

function prefixClassList(text) {
  return text
    .split(/(\s+)/)
    .map((part) => (/^\s+$/.test(part) || part === '' ? part : prefixToken(part)))
    .join('')
}

function run(file) {
  return fs.readFile(file, 'utf8').then((source) => {
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const edits = []

    // Pushes an edit that rewrites the literal text *inside* the delimiters of a
    // string / template part node (positions are relative to the whole source).
    function editInner(node, openLen, closeLen) {
      const start = node.getStart(sf) + openLen
      const end = node.getEnd() - closeLen
      const inner = source.slice(start, end)
      const next = prefixClassList(inner)
      if (next !== inner) {
        edits.push({ start, end, text: next })
      }
    }

    // Treats `node` as a value that resolves to a class list and rewrites every
    // string literal reachable from it.
    function collectClassValue(node) {
      if (!node) return

      if (ts.isStringLiteral(node)) {
        editInner(node, 1, 1)
        return
      }
      if (ts.isNoSubstitutionTemplateLiteral(node)) {
        editInner(node, 1, 1)
        return
      }
      if (ts.isTemplateExpression(node)) {
        editInner(node.head, 1, 2) // `...${
        for (const span of node.templateSpans) {
          collectClassValue(span.expression)
          const isTail = span.literal.kind === ts.SyntaxKind.TemplateTail
          editInner(span.literal, 1, isTail ? 1 : 2) // }...` or }...${
        }
        return
      }
      if (ts.isArrayLiteralExpression(node)) {
        node.elements.forEach(collectClassValue)
        return
      }
      if (ts.isConditionalExpression(node)) {
        collectClassValue(node.whenTrue)
        collectClassValue(node.whenFalse)
        return
      }
      if (ts.isParenthesizedExpression(node)) {
        collectClassValue(node.expression)
        return
      }
      if (ts.isBinaryExpression(node)) {
        collectClassValue(node.left)
        collectClassValue(node.right)
        return
      }
      if (ts.isCallExpression(node) && node.expression.getText(sf) === 'twMerge') {
        node.arguments.forEach(collectClassValue)
        return
      }
      // Identifiers, property accesses, etc. carry no inline class literals.
    }

    function visit(node) {
      if (ts.isJsxAttribute(node) && node.name && CLASS_ATTRS.has(node.name.getText(sf))) {
        const init = node.initializer
        if (init && ts.isStringLiteral(init)) {
          collectClassValue(init)
        } else if (init && ts.isJsxExpression(init) && init.expression) {
          collectClassValue(init.expression)
        }
        return
      }

      if (
        ts.isCallExpression(node) &&
        node.expression.getText(sf) === 'twMerge'
      ) {
        node.arguments.forEach(collectClassValue)
        return
      }

      if (
        ts.isVariableDeclaration(node) &&
        node.name &&
        ts.isIdentifier(node.name) &&
        CLASS_BINDINGS.has(node.name.text) &&
        node.initializer
      ) {
        collectClassValue(node.initializer)
        return
      }

      if (
        (ts.isParameter(node) || ts.isBindingElement(node)) &&
        node.name &&
        ts.isIdentifier(node.name) &&
        CLASS_BINDINGS.has(node.name.text) &&
        node.initializer
      ) {
        collectClassValue(node.initializer)
        return
      }

      ts.forEachChild(node, visit)
    }

    visit(sf)

    if (edits.length === 0) {
      return { file, count: 0 }
    }

    edits.sort((a, b) => b.start - a.start)
    let out = source
    for (const edit of edits) {
      out = out.slice(0, edit.start) + edit.text + out.slice(edit.end)
    }
    return fs.writeFile(file, out).then(() => ({ file, count: edits.length }))
  })
}

Promise.all(FILES.map((rel) => run(path.join(rootDir, rel))))
  .then((results) => {
    for (const { file, count } of results) {
      console.log(`prefix-classes: ${path.relative(rootDir, file)} (${count} edits)`)
    }
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
