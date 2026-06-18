import type { LayerRendering } from '@/@types/layer.types'

export type ScopedRendering = Extract<LayerRendering, 'IMAGE_V2' | 'VALUES' | 'CONTOURS' | 'CONTOURGEOJSON' | 'DIRECTIONS' | 'BARBS' | 'GRADES'>

export const SCOPED_RENDERINGS: ScopedRendering[] = ['IMAGE_V2', 'VALUES', 'CONTOURS', 'CONTOURGEOJSON', 'DIRECTIONS', 'BARBS', 'GRADES']

export interface LayerKeyInput {
    element?: string
    level?: string | null
    i18n?: string
}

/**
 * Builds a composite, stable key identifying a layer's settings bucket.
 * Composed of element + level + rendering so settings persist across
 * model/run refreshes for the same conceptual layer, while keeping IMAGE_V2 /
 * VALUES / CONTOURS / DIRECTIONS / BARBS / GRADES settings independent for layers that
 * emit multiple rendering types.
 */
export function getLayerSettingsKey(layer: LayerKeyInput, rendering: ScopedRendering): string {
    return `${layer?.element ?? ''}|${layer?.level ?? ''}|${rendering}`
}

export function isScopedRendering(value: unknown): value is ScopedRendering {
    return typeof value === 'string' && SCOPED_RENDERINGS.includes(value as ScopedRendering)
}
