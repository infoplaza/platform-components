import { ContourLayer } from '@/src/layers/contour'
import type { ContourLayerProps } from '@/src/layers/contour'
import { ClipExtension } from '@deck.gl/extensions'
import type { TextureData } from '@/src/_utils/texture-data'
import { ImageInterpolation } from '@/src/_utils/image-interpolation'
import { ImageType } from '@/src/_utils/image-type'
import type { Legend } from '@/src/_utils/pixel-value'
import type { Palette } from '@/src/_utils/palette'
import type { ImageFillValue } from '@/src/_utils/image-fill-value'
import { MERCATOR_BOUNDS } from '@/src/_utils/bounds'
import type { LayerSettingsState } from '@/src/providers/settings/layer-settings'

interface LegendConfig {
    unit?: string
    visualization: {
        databounds: number[] | (number | null)[]
        datalabels: Array<string | number>
        colors: unknown
        labels?: string[]
    }
}

interface ContourLayerConfig {
    image: TextureData
    bounds: [number, number, number, number]
    rendering?: string | string[]
    legend?: LegendConfig
    palette?: Palette
    contourinterval?: number
    interval?: number | null
    opacity?: number
    beforeId?: string
    imageFillValue?: ImageFillValue
    isAlphaImage?: boolean
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
            datalabels: legendConfig.visualization.datalabels.map((label) =>
                typeof label === 'string' ? parseFloat(label) : label
            ) as number[],
            colors: legendConfig.visualization.colors as string[],
            labels:
                (legendConfig.visualization as { labels?: string[] }).labels ||
                (Array.isArray(legendConfig.visualization.datalabels) &&
                legendConfig.visualization.datalabels.every((l) => typeof l === 'string')
                    ? legendConfig.visualization.datalabels
                    : undefined),
        },
    };
    legendCache.set(key, legend);
    return legend;
}

function toUint8Alpha(value: number) {
    return Math.round(Math.max(0, Math.min(1, value)) * 255);
}

function databoundsToUnscale(databounds: unknown): [number, number] | null {
    if (!Array.isArray(databounds) || databounds.length < 2) return null;
    const a = Number(databounds[0]);
    const b = Number(databounds[1]);
    if (Number.isFinite(a) && Number.isFinite(b) && a < b) {
        return [a, b];
    }
    return null;
}

function legendToPalette(legend: Legend): Palette | null {
    const { databounds, colors } = legend.visualization;
    if (!databounds?.length || !colors?.length) return null;
    const entries: [number, string][] = [];
    const n = Math.min(databounds.length, colors.length);
    for (let i = 0; i < n; i++) {
        const b = databounds[i];
        if (b == null || Number.isNaN(Number(b))) continue;
        const c = colors[i];
        if (typeof c !== 'string') continue;
        entries.push([Number(b), c]);
    }
    return entries.length >= 2 ? entries : null;
}

export function ContourLayerConnector(
    layer: ContourLayerConfig,
    beforeId: string | undefined,
    state: LayerSettingsState
): ContourLayer | null {
    if (
        !layer.image?.data ||
        !layer.image.width ||
        !layer.image.height ||
        layer.image.width <= 0 ||
        layer.image.height <= 0
    ) {
        console.error('❌ Invalid image data for ContourLayer:', layer.image);
        return null;
    }

    if (!state.contourEnabled) {
        return null;
    }

    const interval = Math.max(Number(state.contourInterval) || 1, 1e-6);
    const majorInterval = Math.max(Number(state.contourMajorInterval) || 0, 0);
    const width = Math.max(Number(state.contourWidth) || 1, 0.1);
    const opacity = Math.max(0, Math.min(1, Number(state.contourOpacity)));

    const legend = layer.legend ? getCachedLegend(layer.legend) : undefined;
    const databounds = layer.legend?.visualization?.databounds;
    const imageUnscale = databoundsToUnscale(databounds);

    const palette: Palette | null = state.contourUsePalette
        ? layer.palette ?? (legend ? legendToPalette(legend) : null)
        : null;
    const color: [number, number, number, number] = [
        state.contourColor.r,
        state.contourColor.g,
        state.contourColor.b,
        toUint8Alpha(state.contourColor.a),
    ];

    try {
        return new ContourLayer({
            id: layer.id,
            image: layer.image,
            bounds: layer.bounds,
            extensions: [new ClipExtension()],
            clipBounds: [...MERCATOR_BOUNDS] as [number, number, number, number],
            opacity,
            beforeId: layer.beforeId ?? beforeId,
            minZoom: null,
            maxZoom: null,
            imageInterpolation: ImageInterpolation.CUBIC,
            imageType: ImageType.VECTOR,
            imageUnscale: imageUnscale ?? undefined,
            imageFillValue: layer.imageFillValue ?? null,
            isAlphaImage: layer.isAlphaImage ?? false,
            interval,
            majorInterval,
            width,
            palette,
            color,
            imageSmoothing: 3,
        } as unknown as ContourLayerProps);
    } catch (e) {
        console.error('Error creating ContourLayer:', e);
        return null;
    }
}
