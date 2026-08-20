import { TIMESTAMP_STATUS } from './config'
import type { Layer } from "@/@types/layer.types"
import type {
  AggregatedLayer,
  ElementInfo,
  ModelInfo,
  MapLayer,
  LayerData,
  TimestampInfo
} from '@/@types/weather.types'

const FREE_MODEL_SLUG = 'gfs'

type SelectableModel = {
  slug: string
  available?: boolean
}

export const resolveAvailableModel = <T extends SelectableModel>(
  models: T[] | null | undefined,
  requestedSlug: string | null | undefined,
): T | null => {
  if (!models?.length) {
    return null
  }

  const requestedModel = models.find(({ slug }) => slug === requestedSlug)
  if (requestedModel && requestedModel.available !== false) {
    return requestedModel
  }

  return (
    models.find(
      ({ slug, available }) => slug === FREE_MODEL_SLUG && available !== false,
    ) ??
    models.find(({ available }) => available !== false) ??
    null
  )
}

export const buildUnit = (
  layer: Layer,
  getUnit: (key: string) => { value: string },
): string => {
  let unit = layer.unit ?? layer.units?.[0] ?? ''

  if (layer.unitKey) {
    const resolvedUnit = getUnit(layer.unitKey).value
    const matches = layer.units?.some(
      (option) => option.toLowerCase() === resolvedUnit.toLowerCase(),
    )
    unit = matches ? resolvedUnit : layer.unit ?? ''
  }

  return unit
}

export const createLayerId = (
  viewKey: string,
  elementInfo: ElementInfo | null,
  element: string,
): string => {
  return `layer-${viewKey}${elementInfo?.slug ? `-${elementInfo.slug}` : ''}${element ? `-${element}` : ''}`
}

/**
 * Aggregates map layers by timestamp
 * @param layers - Map layers array
 * @returns Aggregated layers by timestamp
 */
export const aggregateMapLayers = (layers: MapLayer[] | undefined): Record<string, AggregatedLayer> | null => {
  if (!layers) return null

  return layers.reduce((acc, cur) => {
      cur?.data?.layers?.forEach((layer: LayerData) => {
          const { timestamp, url, datetime } = layer
          if (!acc[timestamp]) {
              acc[timestamp] = { timestamp, urls: url ? [url] : [], datetime }
          } else {
              if (!acc[timestamp]?.urls) acc[timestamp].urls = [url]
              acc[timestamp].urls.push(url)
          }
      })

      return acc
  }, {} as Record<string, AggregatedLayer>)
}

/**
* Builds timestamp information for UI
* @param aggregatedLayers - Aggregated map layers
* @param preloadedData - Preloaded data URLs
* @returns Timestamp information array
*/
export const buildTimestampsInfo = (
  aggregatedLayers: Record<string, AggregatedLayer> | null, 
  preloadedData: string[]
): TimestampInfo[] => {
  if (!aggregatedLayers) {
      return []
  }

  return Object.values(aggregatedLayers).map((ts, index) => {
      const urlList = ts?.urls.filter(Boolean)
      const isLoaded = urlList.some(url => preloadedData.includes(url))

      return {
          index,
          timestamp: ts.timestamp,
          active: urlList.length > 0,
          url: urlList.length > 0,
          procent: isLoaded ? TIMESTAMP_STATUS.LOADED : TIMESTAMP_STATUS.NOT_LOADED,
      }
  }) as unknown as TimestampInfo[]
}


export const findElementInfo = (
  modelInfo: ModelInfo | null,
  element: string,
): ElementInfo | null => {
  if (!modelInfo) {
    return null
  }

  const found = modelInfo.elementGroups
    ?.flatMap((group) => group.items.map((item) => ({ ...item, group })))
    ?.find((current) => current.slug === element)

  if (found) {
    return found
  }

  const fallbackGroup = modelInfo.elementGroups?.[0]
  const fallbackItem = fallbackGroup?.items?.[0]

  return fallbackItem ? { ...fallbackItem, group: fallbackGroup } : null
}

export const suggestModelRun = (
  modelInfo: ModelInfo | null,
  modelRun: string,
): string => {
  if (modelRun === 'latest') return modelInfo?.runtimes?.[0] ?? ''

  return modelInfo?.runtimes?.find((runtime) => runtime === modelRun) ?? modelInfo?.runtimes?.[0] ?? ''
}

export const suggestModelMember = (
  modelInfo: ModelInfo | null,
  modelMember: string | null,
): string => {
  return modelInfo?.members?.find((member) => member === modelMember) ?? modelInfo?.members?.[0] ?? ''
}

export const suggestModelLevel = (
  elementInfo: ElementInfo | null,
  modelLevel: string | null,
): string => {
  return elementInfo?.levels?.find((level) => level === modelLevel) ?? elementInfo?.levels?.[0] ?? ''
}
