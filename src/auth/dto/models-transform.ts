import FORECAST from '@/src/config/forecast'
import type { Item, Layer, LayerGroup } from '@/@types/layer.types'
import type { TransformedModel } from '@/@types/model.types'

/**
 * Returns the distinct `element` names referenced by a set of layers, preserving
 * their first-seen order. Used to describe items that combine multiple elements.
 */
export const getElementLayers = (layers: any[]): string[] => {
  const seen = new Set<string>()
  const elements: string[] = []

  ;(layers ?? []).forEach((layer: any) => {
    if (layer?.element && !seen.has(layer.element)) {
      seen.add(layer.element)
      elements.push(layer.element)
    }
  })

  return elements
}

/**
 * True when an item is composed of layers that reference more than one element
 * (e.g. temperature + windvector), which the UI surfaces as "mixed layers".
 */
export const isMixedLayers = (layers: any[]): boolean =>
  getElementLayers(layers).length > 1

/**
 * Cross-references the static FORECAST layer configuration with the live model
 * data returned by the upstream `/models` endpoint. Items are kept only when the
 * model actually exposes their (non-optional) layers, and each surviving layer is
 * enriched with the units, defaults, fill values and offsets reported by the
 * model. The result mirrors `ModelInfo['elementGroups']`.
 */
type ModelLevels = string[] | Record<string, unknown>

interface ModelElementData {
  id: string
  units?: string[]
  unit?: string
  fillvalue?: number | null
  firstoffset?: number
  levels?: ModelLevels
  members?: string[]
}

interface ModelData {
  elements?: ModelElementData[]
  modeldescription?: {
    maxzoom?: number
  }
}

type EnrichedLayer = Layer & {
  maxzoom?: number
  unitDefault?: string | null
  fillvalue?: number
}

type LayerResolution =
  | {
      status: 'available'
      layer: EnrichedLayer
      offset: number
      members?: string[]
    }
  | {
      status: 'unavailable'
      required: boolean
    }

interface ModelContext {
  elementsById: Map<string, ModelElementData>
  maxzoom: number
}

const CONTOUR_RENDERINGS = new Set([
  'CONTOURS_BLACK',
  'CONTOURS_WHITE',
  'CONTOURS_COLOR',
])

function hasLevel(levels: ModelLevels, level: string): boolean {
  return Array.isArray(levels) ? levels.includes(level) : Boolean(levels[level])
}

/**
 * True when the model actually enumerates levels. An empty list (common for
 * `windvector`) means "no restriction", not "no levels available".
 */
function hasRestrictedLevels(levels: ModelLevels | undefined): levels is ModelLevels {
  if (!levels) return false
  return Array.isArray(levels) ? levels.length > 0 : Object.keys(levels).length > 0
}

/**
 * Item `levels` apply to layers that opt in with `selectableLevel`, and to
 * layers that have no fixed `level` (the historical default). A layer with a
 * configured `level` and no `selectableLevel` keeps that level as-is.
 */
function usesSelectableLevel(layer: Layer): boolean {
  return layer.selectableLevel === true || layer.level == null
}

function getSupportedLevels(
  item: Item,
  elementsById: Map<string, ModelElementData>,
): string[] | undefined {
  if (!item.levels) return undefined

  return item.layers
    .filter(layer => layer.optional !== true && usesSelectableLevel(layer))
    .reduce((levels, layer) => {
      const modelLevels = elementsById.get(layer.element)?.levels
      return hasRestrictedLevels(modelLevels)
        ? levels.filter(level => hasLevel(modelLevels, level))
        : levels
    }, [...item.levels])
}

function enrichLayer(
  layer: Layer,
  element: ModelElementData,
  maxzoom: number,
): EnrichedLayer {
  const units = element.units ?? []
  const enriched: EnrichedLayer = {
    ...layer,
    units,
    unitDefault: element.unit ?? units[0] ?? null,
  }

  if (typeof layer.rendering === 'string' && CONTOUR_RENDERINGS.has(layer.rendering)) {
    enriched.maxzoom = enriched.maxzoom ?? maxzoom
  }

  if (element.fillvalue != null) {
    enriched.fillvalue = element.fillvalue
  }

  return enriched
}

function resolveLayer(
  layer: Layer,
  element: ModelElementData | undefined,
  itemLevels: string[] | undefined,
  maxzoom: number,
): LayerResolution {
  const unavailable = (): LayerResolution => ({
    status: 'unavailable',
    required: layer.optional !== true,
  })

  if (!element) return unavailable()

  const modelLevels = element.levels
  if (
    usesSelectableLevel(layer) &&
    itemLevels?.length &&
    hasRestrictedLevels(modelLevels)
  ) {
    const hasSupportedLevel = itemLevels.some(level => hasLevel(modelLevels, level))
    if (!hasSupportedLevel) return unavailable()
  }

  return {
    status: 'available',
    layer: enrichLayer(layer, element, maxzoom),
    offset: element.firstoffset ?? 0,
    members: element.members,
  }
}

function isAvailable(
  resolution: LayerResolution,
): resolution is Extract<LayerResolution, { status: 'available' }> {
  return resolution.status === 'available'
}

function resolveItem(item: Item, context: ModelContext): Item | null {
  const levels = getSupportedLevels(item, context.elementsById)
  if (item.levels?.length && levels?.length === 0) return null

  const resolutions = item.layers.map(layer =>
    resolveLayer(
      layer,
      context.elementsById.get(layer.element),
      levels,
      context.maxzoom,
    ),
  )

  if (resolutions.some(result => result.status === 'unavailable' && result.required)) {
    return null
  }

  const availableLayers = resolutions.filter(isAvailable)
  if (availableLayers.length === 0) return null

  const offset = Math.max(0, ...availableLayers.map(result => result.offset))
  const members = availableLayers.reduce<string[] | undefined>(
    (current, result) => result.members ?? current,
    item.members,
  )

  return {
    ...item,
    ...(levels ? { levels } : {}),
    ...(members ? { members } : {}),
    layers: availableLayers.map(result => result.layer),
    isMixedLayers: isMixedLayers(item.layers),
    uniqueElements: getElementLayers(item.layers),
    timestampFilter: item.timestampFilter ?? { hours: 1, start: offset },
  }
}

function resolveGroup(group: LayerGroup, context: ModelContext): LayerGroup | null {
  const items = group.items
    .map(item => resolveItem(item, context))
    .filter((item): item is Item => item !== null)

  return items.length > 0 ? { name: group.name, items } : null
}

export const filterElementGroups = (modelData: ModelData): LayerGroup[] => {
  const context: ModelContext = {
    elementsById: new Map(
      (modelData.elements ?? []).map(element => [element.id, element]),
    ),
    maxzoom: modelData.modeldescription?.maxzoom ?? 20,
  }

  return FORECAST.layers
    .map(group => resolveGroup(group, context))
    .filter((group): group is LayerGroup => group !== null)
}

/**
 * Extracts the raw model list from an upstream `/models` payload, tolerating the
 * shapes we've seen in the wild (`{ data: [...] }`, `{ data: { models: [...] } }`
 * or `{ models: [...] }`).
 */
function extractModels(payload: any): any[] {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.models)) return payload.data.models
  if (Array.isArray(payload?.models)) return payload.models
  return []
}

/**
 * Enriches each model in the upstream `/models` response with a computed
 * `elementGroups` collection (derived from the FORECAST config) and returns the
 * payload reshaped as `{ data: { models } }` for consumers.
 */
export function transformModelsResponse(payload: unknown): unknown {
  const models: TransformedModel[] = extractModels(payload).map((model: any) => ({
    ...model,
    slug: model.id,
    elementGroups: filterElementGroups(model),
    format: 'forecast',
    runtimes: model.runtimes.sort((a: string, b: string) => parseInt(b) - parseInt(a)),
  }))

  return models
}
