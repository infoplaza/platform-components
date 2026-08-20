import { ClipExtension } from "@deck.gl/extensions"

import { ImageLayer } from '../image'
import { ImageType } from '@/src/_utils/image-type'
import { ImageInterpolation } from '@/src/_utils/image-interpolation'
import { getPaletteBounds } from '@/src/_utils/image-unscale'

// ** Types import **
import type { TextureData } from '@/src/_utils/texture-data'
import type { Color } from '@deck.gl/core'
import type { ImageFillValue } from '@/src/_utils/image-fill-value'
import type { Legend } from '@/src/_utils/pixel-value'
import type { LayerSettingsState } from '@/src/providers/settings/layer-settings'

/**
 * Layer configuration for BitmapLayer creation
 */
interface BitmapLayerConfig {
    image: TextureData | ImageData
    bounds: [number, number, number, number]
    palette?: any | null
    opacity?: number
    imageUnscale?: [number, number]
    imageSmoothing?: number
    imageInterpolation?: ImageInterpolation
    imageWeight?: number
    imageType?: ImageType
    imageMinValue?: number
    imageMaxValue?: number
    borderEnabled?: boolean
    borderWidth?: number
    borderColor?: Color
    gridEnabled?: boolean
    gridSize?: number
    gridColor?: Color
    legend?: Legend
    isLogScale?: boolean
    paletteImage?: TextureData | ImageData
    pickable?: boolean
    grayscale?: boolean
    imageStride?: number
    imageFillValue?: ImageFillValue
    isAlphaImage?: boolean
    imageBanded?: boolean
    [key: string]: unknown
}

const DEFAULT_IMAGE_SMOOTHING = 0
const DEFAULT_IMAGE_INTERPOLATION = ImageInterpolation.NEAREST
const DEFAULT_IMAGE_OPACITY = 0.18

/**
 * Type guard to validate image data for BitmapLayer
 */
function isValidImageData(image: TextureData | ImageData | unknown): image is TextureData | ImageData {
    if (!image || typeof image !== 'object') {
        return false
    }
    const img = image as { width?: number; height?: number }
    return (
        typeof img.width === 'number' &&
        typeof img.height === 'number' &&
        img.width > 0 &&
        img.height > 0
    )
}

/**
 * Creates a BitmapLayer for IMAGE_V2 rendering type
 * @param layer - Layer configuration object
 * @param beforeId - ID of the layer to insert before
 * @returns Created BitmapLayer or null if validation fails
 */

export function ImageLayerConnector(
    layer: BitmapLayerConfig,
    state: LayerSettingsState,
    beforeId?: string
): ImageLayer | null {
    if (!isValidImageData(layer.image)) {
        console.error('❌ Invalid image data for BitmapLayer:', layer.image);
        return null;
    }

    void beforeId

    const imageSmoothing = state.imageSmoothing ?? DEFAULT_IMAGE_SMOOTHING
    const imageInterpolation = layer.imageStride
        ? ImageInterpolation.NEAREST
        : state.imageInterpolation ?? DEFAULT_IMAGE_INTERPOLATION
    const imageMinValue = state.imageMinValue ?? null
    const imageMaxValue = state.imageMaxValue ?? null
    const opacity = state.imageOpacity ?? DEFAULT_IMAGE_OPACITY
    
    const paletteBounds = getPaletteBounds(layer.legend?.visualization?.databounds)
    const paletteImage = layer.grayscale ? layer.paletteImage : null

    return new ImageLayer({
        ...layer,
        id: `${layer.id}-image`,
        image: layer.image,
        bounds: layer.bounds,
        opacity,
        imageUnscale: layer.imageUnscale ?? paletteBounds,
        imageSmoothing,
        imageInterpolation,
        imageStride: layer.imageStride ?? 1,
        imageWeight: layer.imageWeight ?? 0,
        imageType: layer.imageType ?? ImageType.SCALAR,
        imageMinValue,
        imageMaxValue,
        imageBanded: layer.imageBanded ?? true,
        pickable: layer.pickable ?? true,
        extensions: [new ClipExtension()],
        beforeId,
        grayscale: layer.grayscale ?? true,
        isLogScale: layer.isLogScale ?? false,
        legend: layer.legend,
        paletteData: layer.paletteImage as TextureData | null,
        paletteImage: paletteImage,
        paletteBounds,
    }) as unknown as ImageLayer;
}
