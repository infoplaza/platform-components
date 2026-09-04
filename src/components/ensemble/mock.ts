import type {
  EnsembleChartBlock,
  EnsembleElementGroup,
  EnsembleElementItem,
  EnsembleGetChartsOptions,
  EnsembleModel,
  EnsembleRow,
  EnsembleRun,
  EnsembleView,
} from './types'
import { DEFAULT_ENSEMBLE_ELEMENT_GROUPS } from './defaults'
import ensembleUtil from './utils/ensemble'

const MEMBER_COUNT = 10
const HOURS = 48

function padMember(index: number): string {
  return `member${String(index).padStart(3, '0')}`
}

const FALLBACK_MEMBER_KEYS = Array.from({ length: MEMBER_COUNT }, (_, i) =>
  padMember(i + 1),
)

function memberKeysFromModel(model: EnsembleModel): string[] {
  const fromModel = (model.members ?? []).filter((item) =>
    item.startsWith('member'),
  )
  return fromModel.length > 0 ? fromModel : FALLBACK_MEMBER_KEYS
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

type SeriesKind =
  | 'temperature'
  | 'precipitation'
  | 'accumulation'
  | 'wind'
  | 'direction'
  | 'cloud'
  | 'precipType'

function seriesKind(element: string): SeriesKind {
  if (element === 'precipitationaccumulation') return 'accumulation'
  if (element === 'precipitation' || element === 'precipitationrate') {
    return 'precipitation'
  }
  if (element === 'precipitationtype') return 'precipType'
  if (
    element === 'windspeed' ||
    element === 'windgust' ||
    element === 'probability_storm'
  ) {
    return 'wind'
  }
  if (element.includes('direction')) return 'direction'
  if (
    element.includes('cloud') ||
    element === 'relativehumidity' ||
    element === 'snowdepth'
  ) {
    return 'cloud'
  }
  return 'temperature'
}

function baseValue(kind: SeriesKind, hour: number, seed: number): number {
  const phase = (hour / 24) * Math.PI * 2
  switch (kind) {
    case 'temperature':
      return 11 + 6 * Math.sin(phase - 0.8) + (seed % 3)
    case 'precipitation':
      return Math.max(0, 1.4 * Math.sin(phase * 2 + seed) - 0.4)
    case 'accumulation':
      return Math.max(0, hour * 0.15 + Math.sin(phase + seed) * 0.4)
    case 'wind':
      return 5 + 3 * Math.sin(phase + 0.4) + (seed % 2)
    case 'direction':
      return (220 + 40 * Math.sin(phase) + seed) % 360
    case 'cloud':
      return clamp(45 + 30 * Math.sin(phase + 1) + (seed % 10), 0, 100)
    case 'precipType':
      return hour % 11 === 0 ? 5 : hour % 7 === 0 ? 1 : 0
    default:
      return 10
  }
}

function spreadFor(kind: SeriesKind): number {
  switch (kind) {
    case 'temperature':
      return 2.4
    case 'precipitation':
      return 0.8
    case 'accumulation':
      return 1.2
    case 'wind':
      return 1.8
    case 'direction':
      return 25
    case 'cloud':
      return 18
    case 'precipType':
      return 0
    default:
      return 1
  }
}

function clampKind(kind: SeriesKind, value: number): number {
  switch (kind) {
    case 'precipitation':
    case 'accumulation':
    case 'wind':
      return Math.max(0, value)
    case 'cloud':
      return clamp(value, 0, 100)
    case 'direction':
      return ((value % 360) + 360) % 360
    case 'precipType':
      return value
    default:
      return value
  }
}

function generateRows(
  item: EnsembleElementItem,
  run: number,
  model: EnsembleModel,
): EnsembleRow[] {
  const kind = seriesKind(item.element)
  const seed = hashString(`${model.slug}:${item.slug}:${run}`) % 17
  const startMs = run * 1000
  const spread = spreadFor(kind)
  const memberKeys = memberKeysFromModel(model)
  let previousAccum = 0

  return Array.from({ length: HOURS }, (_, hour) => {
    const datetimeMs = startMs + hour * 3600 * 1000
    const iso = new Date(datetimeMs).toISOString()
    const center = baseValue(kind, hour, seed)
    const members = memberKeys.map((_key, index) => {
      const offset =
        ((index - (memberKeys.length - 1) / 2) / memberKeys.length) *
        spread *
        2
      const wobble = Math.sin(hour / 3 + index) * spread * 0.25
      return clampKind(kind, center + offset + wobble)
    })
    const sorted = [...members].sort((a, b) => a - b)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const median = percentile(sorted, 0.5)
    const control = members[0]
    const record: EnsembleRow = {
      datetime: iso,
      min,
      max,
      median,
      control,
      percentile10: percentile(sorted, 0.1),
      percentile25: percentile(sorted, 0.25),
      percentile50: median,
      percentile75: percentile(sorted, 0.75),
      percentile90: percentile(sorted, 0.9),
      metadata: {
        datetime: iso,
        epoch: Math.floor(datetimeMs / 1000),
        sequence: 1,
        rawValue: members,
      },
    }
    memberKeys.forEach((key, index) => {
      record[key] = members[index]
    })
    if (kind === 'accumulation') {
      previousAccum += Math.max(0, center * 0.2)
      record.metadata.rawValue = members.map((value) => value + previousAccum)
      memberKeys.forEach((key, index) => {
        record[key] = record.metadata.rawValue[index]
      })
    }
    return record
  })
}

function resolveRun(run: EnsembleRun, model: EnsembleModel): number | null {
  if (!model.runtimes.length) {
    return null
  }
  if (typeof run === 'number' && model.runtimes.includes(run)) {
    return run
  }
  return Math.max(...model.runtimes)
}

function buildChart(
  item: EnsembleElementItem,
  view: EnsembleView,
  model: EnsembleModel,
  run: number,
  locale: string,
  timezone: string | null,
): EnsembleChartBlock | null {
  const scenario = item.scenario[view]
  if (!scenario || !item.scenario.available.includes(view)) {
    return null
  }

  let rows = generateRows(item, run, model)
  if (scenario.adapter) {
    rows = scenario.adapter({ data: rows })
  }

  const config = ensembleUtil[view].graph({
    slug: item.slug,
    title: item.title,
    titleExtra: item.level,
    subtitle: item.subtitle,
    unit: item.unit,
    config: scenario,
    rows,
    members: [...memberKeysFromModel(model), 'median', 'control'],
    model: model.title,
    run,
    language: locale,
    utcTimezone: timezone === 'UTC',
    timezone,
  })

  return {
    title: item.title,
    subtitle: item.subtitle,
    titleExtra: item.level,
    config,
  }
}

export function getMockEnsembleCharts({
  model,
  run,
  elementGroup,
  view,
  models,
  elementGroups,
  locale,
  timezone,
}: EnsembleGetChartsOptions): EnsembleChartBlock[] {
  const selected =
    models.find((entry) => entry.slug === model) ?? models[0]
  if (!selected) return []

  const groups = elementGroups.length
    ? elementGroups
    : DEFAULT_ENSEMBLE_ELEMENT_GROUPS
  const group =
    groups.find((entry) => entry.key === elementGroup) ?? groups[0]
  if (!group) return []

  const runtime = resolveRun(run, selected)
  if (runtime == null) return []
  return group.items
    .map((entry) =>
      buildChart(entry, view, selected, runtime, locale, timezone),
    )
    .filter((block): block is EnsembleChartBlock => block != null)
}

