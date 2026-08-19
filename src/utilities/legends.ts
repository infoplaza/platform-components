import type { EnrichedMapLayer } from '@/@types/weather.types'

export interface Visualization {
    databounds: (number | null)[]
    datalabels: number[]
    colors: string[]
    labels?: string[]
}

export interface RowVisualization {
    colors: string[]
    databounds: (number | null)[]
    datalabels: number[]
    labels?: string[]
}

export interface Label {
    location: number
    text: string
}

export interface LegendComponentProps {
    small?: boolean
    height?: number
    className?: string
    vertical?: boolean
}

export interface LegendInfo {
    i18n: string
    slug: string
    unitKey?: string
    unit: string
    visualization: Visualization
}

interface LegendLayer extends EnrichedMapLayer {
    element?: string
    unit?: string
    unitKey?: string
    i18n?: string
}

export function getLegendsFromLayers(layers: LegendLayer[]): LegendInfo[] {
    const seen = new Set<string>()

    return layers.flatMap((layer) => {
        const visualization = getLegendVisualization(layer)

        if (!visualization) {
            return []
        }

        const slug = layer.element ?? ''
        const unit = layer.data?.element?.unit ?? layer.data?.elementdescription?.unit ?? layer.unit ?? ''
        const key = `${slug}|${layer.unitKey ?? ''}|${unit}`

        if (seen.has(key)) {
            return []
        }
        seen.add(key)

        return [{
            i18n: layer.i18n ?? '',
            slug,
            unitKey: layer.unitKey,
            unit,
            visualization,
        }]
    })
}

function getLegendVisualization(layer: LegendLayer): Visualization | null {
    const element = layer.data?.element
    if (element?.visualization) {
        return normalizeVisualization({
            databounds: element.databounds,
            labels: element.labels,
            datalabels: element.datalabels,
            colors: element.visualization,
        })
    }

    const elementDescriptionVisualization = layer.data?.elementdescription?.visualization
    if (!elementDescriptionVisualization) {
        return null
    }

    return normalizeVisualization({
        databounds: elementDescriptionVisualization.databounds,
        labels: elementDescriptionVisualization.labels,
        datalabels: elementDescriptionVisualization.datalabels,
        colors: elementDescriptionVisualization.colors,
    })
}

function normalizeVisualization(raw: {
    databounds?: unknown
    labels?: unknown
    datalabels?: unknown
    colors?: unknown
}): Visualization | null {
    const colors = Array.isArray(raw.colors)
        ? raw.colors.filter((color): color is string => typeof color === 'string')
        : []

    if (colors.length === 0) {
        return null
    }

    const databounds = Array.isArray(raw.databounds)
        ? raw.databounds.map((bound) => (bound == null || bound === '' ? null : Number(bound)))
        : []

    const datalabels = Array.isArray(raw.datalabels)
        ? raw.datalabels.map((label) => Number(label)).filter((label) => !Number.isNaN(label))
        : []

    const labels = Array.isArray(raw.labels)
        ? raw.labels.filter((label): label is string => typeof label === 'string')
        : undefined

    return {
        databounds,
        datalabels,
        colors,
        labels,
    }
}
