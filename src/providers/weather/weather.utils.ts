import type {
  ElementInfo,
  LayerInfoBase,
  ModelInfo,
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
  layer: LayerInfoBase,
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
