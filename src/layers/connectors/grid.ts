import { GridLayer, GridStyle } from "@/src/layers/grid"
import { ClipExtension } from "@deck.gl/extensions"
import type { TextureData } from '@/src/_utils/texture-data'
import type { LayerSettingsState } from '@/src/providers/settings/layer-settings'
import type { Legend } from '@/src/_utils/pixel-value'
import { GRID_ICON_STYLES } from "../grid/style"
import { getImageUnscaleFromDatabounds } from "../../_utils/image-unscale"

/**
 * Legend configuration for GridLayer
 */
interface LegendConfig {
    unit: string
    visualization: {
        databounds: (number | null)[]
        datalabels: string[]
        colors: unknown
    }
}

/**
 * Layer configuration for GridLayer creation
 */
interface GridLayerConfig {
    style?: GridStyle
    image: TextureData
    bounds: [number, number, number, number]
    legend?: LegendConfig
    grayscale?: boolean
    isLogScale?: boolean
    paletteImage?: TextureData | ImageData | null
    [key: string]: unknown
}

/** Cache for normalized legend configs; keyed by JSON of source legend to avoid re-processing when data is unchanged */
const legendCache = new Map<string, Legend>();

function getCachedLegend(legendConfig: LegendConfig): Legend {
    const key = JSON.stringify(legendConfig);
    let cached = legendCache.get(key);
    if (cached) return cached;
    const legend: Legend = {
        unit: legendConfig.unit,
        visualization: {
            databounds: legendConfig.visualization.databounds,
            datalabels: legendConfig.visualization.datalabels.map(label => typeof label === 'string' ? parseFloat(label) : label) as number[],
            colors: legendConfig.visualization.colors as string[],
            labels: (legendConfig.visualization as { labels?: string[] }).labels ||
                (Array.isArray(legendConfig.visualization.datalabels) && legendConfig.visualization.datalabels.every(l => typeof l === 'string')
                    ? legendConfig.visualization.datalabels
                    : undefined)
        }
    };
    legendCache.set(key, legend);
    return legend;
}

function getPaletteBounds(databounds: (number | null)[]): [number, number] {
    if (!databounds) {
        return [0, 0]
    }
    const values = databounds.filter((value): value is number => value !== null)
    if (values.length === 0) {
        return [0, 0]
    }
    return [Math.min(...values), Math.max(...values)]
}

/**
 * Context passed to each text-format rule. Extend this when new inputs are needed
 * (e.g. unit, level) so individual rules can stay focused and testable.
 */
interface TextFormatContext {
    element: string | undefined
    fallbackDecimals: number
}

/**
 * A rule formats a value into its display string, or returns `null` to defer
 * to the next rule. Rules are evaluated in order; the first non-null wins.
 */
type TextFormatRule = (value: number, ctx: TextFormatContext) => string | null

/** Elements that share the "precipitation-style" formatting (sub-1 → 1 decimal, ≥1 → integer). */
const PRECIPITATION_ELEMENTS = new Set<string>([
    'precipitation',
    'precipitationaccumulation',
])

const precipitationRule: TextFormatRule = (value, { element }) => {
    if (!element || !PRECIPITATION_ELEMENTS.has(element)) return null
    return value < 1 ? value.toFixed(1) : value.toFixed(0)
}

const defaultDecimalsRule: TextFormatRule = (value, { fallbackDecimals }) => {
    return value.toFixed(fallbackDecimals)
}

/**
 * Ordered list of formatting rules. Add new element-specific rules above the
 * default fallback to extend behaviour without touching call sites.
 */
const TEXT_FORMAT_RULES: TextFormatRule[] = [
    precipitationRule,
    defaultDecimalsRule,
]

function formatGridText(value: number, ctx: TextFormatContext): string {
    for (const rule of TEXT_FORMAT_RULES) {
        const result = rule(value, ctx)
        if (result !== null) return result
    }
    return String(value)
}

/**
 * Creates a GridLayer for VALUES rendering type
 * @param layer - Layer configuration object
 * @param state - Layer settings state
 * @returns Created GridLayer or null if validation fails
 */
export function GridLayerConnector(
    layer: GridLayerConfig,
    state: LayerSettingsState,
    beforeId: string | null = null
): GridLayer | null {
    // Validate image data before creating layer
    // GridLayer expects TextureData format: {data, width, height}
    if (!layer.image || 
        !layer.image.data || 
        !layer.image.width || 
        !layer.image.height || 
        layer.image.width <= 0 || 
        layer.image.height <= 0) {
        console.error('❌ Invalid image data for GridLayer:', layer.image);
        return null;
    }
    
    const { legend: legendConfig, ...gridLayerProps } = layer
    const paletteBounds = getPaletteBounds(legendConfig?.visualization?.databounds ?? [])

    // const generatedPaletteImage = layer.isLogScale
    //     ? buildPaletteImageFromLegend(legendConfig)
    //     : null
    // const paletteTexture = (generatedPaletteImage ?? layer.paletteImage) as TextureData | null
    const imageUnscale = getImageUnscaleFromDatabounds(legendConfig?.visualization?.databounds)
    return new GridLayer({
        ...gridLayerProps,
        id: `${layer.id}-values`,
        image: layer.image,
        bounds: layer.bounds,
        density: state.density,
        textColor: [state.textColor.r, state.textColor.g, state.textColor.b, Math.round(state.textColor.a * 255)],
        textSize: state.textSize,
        iconSize: state.textSize * 2.5,
        iconColor: [state.textColor.r, state.textColor.g, state.textColor.b, Math.round(state.textColor.a * 255)],
        layout: state.layout,
        // paletteScale: false,
        grayscale: layer.grayscale,
        pickingEnabled: false,
        textFormatFunction: (value) => formatGridText(value, {
            element: layer.element as string | undefined,
            fallbackDecimals: Number.isFinite(state.textDecimals) ? state.textDecimals : 0,
        }),
        isLogScale: layer.isLogScale,
        imageUnscale,
        imageMinValue: state.imageMinValue ?? -255,
        imageMaxValue: state.imageMaxValue ?? 255,
        paletteTexture: layer.paletteImage,
        paletteBounds: paletteBounds,
        imageInterpolation: 'NEAREST',
        textFontFamily: state.textFontFamily,
        ...((layer.style === GridStyle.VALUE && layer.isLogScale) || (!layer.grayscale && legendConfig) ? { 
            legend: legendConfig ? getCachedLegend(legendConfig) : undefined,
        } : {}),
        beforeId,
    })
}

