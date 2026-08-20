import { useCallback, useRef } from "react"

import { hasRendering } from "@/src/_utils/type"
import { useLayerSettings } from "@/src/providers/settings/layer-settings"
import { getLayerSettingsKey } from "@/src/providers/settings/layer-key"
import type { EnrichedMapLayer } from "@/@types/weather.types"
import type {
    ConfigColor,
    LayerContourGeoJsonSettings,
    LayerBarbSettings,
    LayerContourSettings,
    LayerDirectionSettings,
    LayerGradeSettings,
    LayerImageSettings,
    LayerValueSettings,
} from "@/@types/layer.types"

interface RGBAColor { r: number; g: number; b: number; a: number }

function hexToRgba(hex: string): RGBAColor | null {
    const clean = hex.trim().replace(/^#/, '')
    let r = 0, g = 0, b = 0, a = 1
    if (clean.length === 3 || clean.length === 4) {
        r = parseInt(clean[0] + clean[0], 16)
        g = parseInt(clean[1] + clean[1], 16)
        b = parseInt(clean[2] + clean[2], 16)
        if (clean.length === 4) a = parseInt(clean[3] + clean[3], 16) / 255
    } else if (clean.length === 6 || clean.length === 8) {
        r = parseInt(clean.substring(0, 2), 16)
        g = parseInt(clean.substring(2, 4), 16)
        b = parseInt(clean.substring(4, 6), 16)
        if (clean.length === 8) a = parseInt(clean.substring(6, 8), 16) / 255
    } else {
        return null
    }
    if ([r, g, b].some(Number.isNaN) || Number.isNaN(a)) return null
    return { r, g, b, a }
}

function toRgba(color: ConfigColor): RGBAColor | null {
    return typeof color === 'string' ? hexToRgba(color) : color
}

function normalizeValueSettings(input: LayerValueSettings): Record<string, unknown> {
    const out: Record<string, unknown> = { ...input }
    if (input.textColor !== undefined) {
        const c = toRgba(input.textColor)
        if (c) out.textColor = c; else delete out.textColor
    }
    return out
}

function normalizeImageSettings(input: LayerImageSettings): Record<string, unknown> {
    return { ...input }
}

function normalizeContourSettings(input: LayerContourSettings): Record<string, unknown> {
    const out: Record<string, unknown> = { ...input }
    if (input.contourColor !== undefined) {
        const c = toRgba(input.contourColor)
        if (c) out.contourColor = c; else delete out.contourColor
    }
    return out
}

function normalizeContourGeoJsonSettings(input: LayerContourGeoJsonSettings): Record<string, unknown> {
    const out: Record<string, unknown> = { ...input }
    if (input.contourGeoJsonColor !== undefined) {
        const c = toRgba(input.contourGeoJsonColor)
        if (c) out.contourGeoJsonColor = c; else delete out.contourGeoJsonColor
    }
    if (input.contourGeoJsonLabelColor !== undefined) {
        const c = toRgba(input.contourGeoJsonLabelColor)
        if (c) out.contourGeoJsonLabelColor = c; else delete out.contourGeoJsonLabelColor
    }
    return out
}

function normalizeDirectionSettings(input: LayerDirectionSettings): Record<string, unknown> {
    const out: Record<string, unknown> = { ...input }
    if (input.directionIconColor !== undefined) {
        const c = toRgba(input.directionIconColor)
        if (c) out.directionIconColor = c; else delete out.directionIconColor
    }
    return out
}

function normalizeBarbSettings(input: LayerBarbSettings): Record<string, unknown> {
    const out: Record<string, unknown> = { ...input }
    if (input.barbIconColor !== undefined) {
        const c = toRgba(input.barbIconColor)
        if (c) out.barbIconColor = c; else delete out.barbIconColor
    }
    return out
}

function normalizeGradeSettings(input: LayerGradeSettings): Record<string, unknown> {
    const out: Record<string, unknown> = { ...input }
    if (input.gradeTextColor !== undefined) {
        const c = toRgba(input.gradeTextColor)
        if (c) out.gradeTextColor = c; else delete out.gradeTextColor
    }
    return out
}

/**
 * Returns a stable callback that pushes derived layer settings into the
 * layer-settings store after a fetch:
 *
 * - palette URL and databounds-derived min/max for `IMAGE_V2` layers (from
 *   the API response);
 * - per-layer config overrides declared on `layer.settings.{value,image,
 *   contour}` in `forecast.ts`. These are applied once per (layer, bucket)
 *   so subsequent fetches do not clobber user edits.
 *
 * Callback identity changes only when the underlying setters change, so it
 * is safe to use directly as a `useEffect` dependency.
 */
export function useApplyImageSettings() {
    const { hasLayerState, setImageState, setValuesState, setContourState, setContourGeoJsonState, setDirectionState, setBarbState, setGradeState } = useLayerSettings()
    const appliedRef = useRef<Set<string>>(new Set())

    return useCallback((layers: EnrichedMapLayer[]) => {
        for (const layer of layers) {
            const cfg = layer.settings

            if (hasRendering(layer, 'IMAGE_V2')) {
                const hasImageState = hasLayerState(layer, 'IMAGE_V2')
                const partial: Parameters<typeof setImageState>[1] = {}

                const palette = layer.data?.element?.palette
                if (palette) {
                    partial.imagePalette = `${layer.layersApi}${palette.png}`
                }

                // imageMinValue and imageMaxValue are independent: each can be
                // set in the layer config, and any axis the config omits falls
                // back to databounds. Handled here (not in the cfg.image bundle
                // below) so this is the single source of truth for min/max.
                if (!hasImageState) {
                    const cfgMin = cfg?.image?.imageMinValue
                    const cfgMax = cfg?.image?.imageMaxValue
                    const databounds = layer.data?.element?.databounds
                    if (cfgMin !== undefined) {
                        partial.imageMinValue = cfgMin
                    } else if (databounds) {
                        partial.imageMinValue = Math.floor(Math.min(...databounds))
                    }
                    if (cfgMax !== undefined) {
                        partial.imageMaxValue = cfgMax
                    } else if (databounds) {
                        partial.imageMaxValue = Math.ceil(Math.max(...databounds))
                    }
                }

                if (Object.keys(partial).length > 0) {
                    setImageState(layer, partial)
                }
            }

            if (!cfg) continue

            if (cfg.value && hasRendering(layer, 'VALUES')) {
                const key = getLayerSettingsKey(layer, 'VALUES')
                if (!hasLayerState(layer, 'VALUES') && !appliedRef.current.has(key)) {
                    appliedRef.current.add(key)
                    setValuesState(layer, normalizeValueSettings(cfg.value) as Parameters<typeof setValuesState>[1])
                }
            }
            if (cfg.image && hasRendering(layer, 'IMAGE_V2')) {
                const key = getLayerSettingsKey(layer, 'IMAGE_V2')
                if (!hasLayerState(layer, 'IMAGE_V2') && !appliedRef.current.has(key)) {
                    // Min/max are applied above and treated independently;
                    // exclude them from the bundled apply so they have one
                    // source of truth.
                    const { imageMinValue: _min, imageMaxValue: _max, ...rest } = cfg.image
                    if (Object.keys(rest).length > 0) {
                        appliedRef.current.add(key)
                        setImageState(layer, normalizeImageSettings(rest) as Parameters<typeof setImageState>[1])
                    }
                }
            }
            if (cfg.contour && hasRendering(layer, 'CONTOURS')) {
                const key = getLayerSettingsKey(layer, 'CONTOURS')
                if (!hasLayerState(layer, 'CONTOURS') && !appliedRef.current.has(key)) {
                    appliedRef.current.add(key)
                    setContourState(layer, normalizeContourSettings(cfg.contour) as Parameters<typeof setContourState>[1])
                }
            }
            if (cfg.contourGeoJson && hasRendering(layer, 'CONTOURGEOJSON')) {
                const key = getLayerSettingsKey(layer, 'CONTOURGEOJSON')
                if (!hasLayerState(layer, 'CONTOURGEOJSON') && !appliedRef.current.has(key)) {
                    appliedRef.current.add(key)
                    setContourGeoJsonState(layer, normalizeContourGeoJsonSettings(cfg.contourGeoJson) as Parameters<typeof setContourGeoJsonState>[1])
                }
            }
            if (cfg.direction && hasRendering(layer, 'DIRECTIONS')) {
                const key = getLayerSettingsKey(layer, 'DIRECTIONS')
                if (!hasLayerState(layer, 'DIRECTIONS') && !appliedRef.current.has(key)) {
                    appliedRef.current.add(key)
                    setDirectionState(layer, normalizeDirectionSettings(cfg.direction) as Parameters<typeof setDirectionState>[1])
                }
            }
            if (cfg.barb && hasRendering(layer, 'BARBS')) {
                const key = getLayerSettingsKey(layer, 'BARBS')
                if (!hasLayerState(layer, 'BARBS') && !appliedRef.current.has(key)) {
                    appliedRef.current.add(key)
                    setBarbState(layer, normalizeBarbSettings(cfg.barb) as Parameters<typeof setBarbState>[1])
                }
            }
            if (cfg.grade && hasRendering(layer, 'GRADES')) {
                const key = getLayerSettingsKey(layer, 'GRADES')
                if (!hasLayerState(layer, 'GRADES') && !appliedRef.current.has(key)) {
                    appliedRef.current.add(key)
                    setGradeState(layer, normalizeGradeSettings(cfg.grade) as Parameters<typeof setGradeState>[1])
                }
            }
        }
    }, [hasLayerState, setImageState, setValuesState, setContourState, setContourGeoJsonState, setDirectionState, setBarbState, setGradeState])
}
