import type { EnrichedMapLayer } from '@/@types/weather.types'

export interface LegendVisualization {
    databounds?: number[]
    labels?: string[]
    datalabels?: string[]
    colors: unknown
}

export interface LegendInfo {
    i18n: string
    slug: string
    unitKey?: string
    unit: string
    visualization: LegendVisualization
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

function getLegendVisualization(layer: LegendLayer): LegendVisualization | null {
    const element = layer.data?.element
    if (element?.visualization) {
        return {
            databounds: element.databounds,
            labels: element.labels,
            datalabels: element.datalabels,
            colors: element.visualization,
        }
    }

    const elementDescriptionVisualization = layer.data?.elementdescription?.visualization
    if (!elementDescriptionVisualization) {
        return null
    }

    return {
        databounds: elementDescriptionVisualization.databounds,
        labels: elementDescriptionVisualization.labels,
        datalabels: elementDescriptionVisualization.datalabels,
        colors: elementDescriptionVisualization.colors,
    }
}
