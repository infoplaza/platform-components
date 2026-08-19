import { GridLayer, GridStyle } from "@/src/layers/grid"
import type { TextureData } from '@/src/_utils/texture-data'
import type { LayerSettingsState } from '@/src/providers/settings/layer-settings'
import type { Legend } from '@/src/_utils/pixel-value'
import { ImageType } from '@/src/_utils/image-type'

interface LegendConfig {
    unit: string
    visualization: {
        databounds: (number | null)[]
        datalabels: string[]
        colors: unknown
    }
}

interface BarbLayerConfig {
    image: TextureData
    bounds: [number, number, number, number]
    legend?: LegendConfig
    grayscale?: boolean
    paletteImage?: TextureData | ImageData | null
    [key: string]: unknown
}

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

function getPaletteBounds(databounds: (number | null)[] | undefined): [number, number] {
    if (!databounds?.length) {
        return [0, 0]
    }
    const values = databounds.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    if (!values.length) {
        return [0, 0]
    }
    return [Math.min(...values), Math.max(...values)]
}

/**
 * Creates a GridLayer configured for the BARBS rendering type. Reads its
 * configuration exclusively from the per-layer BARB settings bucket so it
 * does not couple to the VALUES or DIRECTIONS settings.
 */
export function BarbLayerConnector(
    layer: BarbLayerConfig,
    state: LayerSettingsState,
    beforeId: string | null = null
): GridLayer | null {
    if (!layer.image ||
        !layer.image.data ||
        !layer.image.width ||
        !layer.image.height ||
        layer.image.width <= 0 ||
        layer.image.height <= 0) {
        console.error('❌ Invalid image data for BarbLayer:', layer.image);
        return null;
    }

    const { legend: legendConfig, ...gridLayerProps } = layer
    const paletteBounds = getPaletteBounds(legendConfig?.visualization?.databounds)

    const baseAlpha = state.barbIconColor.a
    const blendedAlpha = Math.max(0, Math.min(1, baseAlpha * state.barbIconOpacity))
    const iconColorRgba: [number, number, number, number] = [
        state.barbIconColor.r,
        state.barbIconColor.g,
        state.barbIconColor.b,
        Math.round(blendedAlpha * 255),
    ]

    return new GridLayer({
        ...gridLayerProps,
        style: GridStyle.WIND_BARB,
        imageType: ImageType.VECTOR,
        image: layer.image,
        bounds: layer.bounds,
        density: state.barbDensity,
        layout: state.barbLayout,
        iconSize: state.barbIconSize,
        iconColor: iconColorRgba,
        grayscale: layer.grayscale,
        pickingEnabled: false,
        imageMinValue: state.imageMinValue ?? -255,
        imageMaxValue: state.imageMaxValue ?? 255,
        // Only forward the palette texture when the user opted in. When
        // disabled, the GridLayer falls back to the flat `iconColor`.
        paletteTexture: state.barbIconUsePalette ? layer.paletteImage : null,
        paletteBounds: paletteBounds,
        imageInterpolation: 'NEAREST',
        ...((!layer.grayscale && legendConfig) ? {
            legend: legendConfig ? getCachedLegend(legendConfig) : undefined,
        } : {}),
        beforeId,
    })
}
