import FORECAST from '@/src/config/forecast'
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
export const filterElementGroups = (modelData: any) => {
  const groups: any[] = []

  FORECAST.layers.forEach(group => {
    const items: any[] = []

    group.items.forEach((i: any) => {
      let offset = 0

      const isMixedLayersValue = isMixedLayers(i.layers)
      const item: any = {
        ...i,
        isMixedLayers: isMixedLayersValue,
        uniqueElements: getElementLayers(i.layers),
      }

      let found = true
      const newLayers: any[] = []

      item.layers.forEach((l: any) => {
        const layer = { ...l }

        let layerData: any
        try {
          // const latestRuntime = Math.max(...modelData.runtimes)
          layerData = modelData.elements.find((element: any) => element.id === layer.element)
        } catch (error) {
          console.error('Error accessing layerData', error)
          layerData = null
        }

        if (!layerData) {
          if (layer.optional !== true) {
            found = false
          }
        } else {
          if (
            layer.rendering === 'CONTOURS_BLACK' ||
            layer.rendering === 'CONTOURS_WHITE' ||
            layer.rendering === 'CONTOURS_COLOR'
          ) {
            layer.maxzoom = layer.maxzoom ?? modelData?.modeldescription?.maxzoom ?? 20
          }

          layer.units = layerData.units ?? []
          layer.unitDefault = layerData.unit ?? (layer.units.length > 0 ? layer.units[0] : null)

          if (layerData.fillvalue != null) {
            layer.fillvalue = layerData.fillvalue
          }

          if (layerData.firstoffset > offset) {
            offset = layerData.firstoffset
          }

          if (item.levels && layerData.levels) {
            const newLevels: any[] = []
            item.levels.forEach((level: any) => {
              if (layerData.levels[level]) {
                newLevels.push(level)
              }
            })

            if (newLevels.length === 0 && item.levels.length > 0) {
              if (layer.optional !== true) found = false
            } else {
              if (item.levels.length !== newLevels.length) {
                item.levels = newLevels
              }

              newLayers.push(layer)
            }
          } else {
            newLayers.push(layer)
          }

          if (layerData?.members) {
            item.members = layerData.members
          }
        }
      })

      if (found && newLayers.length > 0) {
        if (!item.timestampFilter) {
          item.timestampFilter = { hours: 1, start: offset }
        }

        items.push({
          ...item,
          layers: newLayers,
        })
      }
    })

    if (items.length > 0) {
      groups.push({
        name: group.name,
        items: items,
      })
    }
  })

  return groups
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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
  }))

  const base = isPlainObject(payload) ? payload : {}

  return { ...base, data: { models } }
}
