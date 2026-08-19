import { BitmapLayer } from '@deck.gl/layers'
import type { BitmapLayerProps } from '@deck.gl/layers'

import type { TextureData } from '@/src/_utils/texture-data'
import type { LayerSettingsState } from '@/src/providers/settings/layer-settings'

/**
 * Layer configuration for the IMAGE_ALT BitmapLayer connector.
 *
 * Provides an alternative, lightweight image renderer based on deck.gl's
 * stock {@link BitmapLayer}. Unlike the IMAGE_V2 path (which uses a custom
 * raster shader with palette support), this connector renders the image
 * data verbatim and is intended for already-colored RGBA imagery.
 */
interface ImageAltLayerConfig {
    id?: string
    image: TextureData | ImageData | null
    bounds: [number, number, number, number]
    opacity?: number
    desaturate?: number
    transparentColor?: [number, number, number, number]
    tintColor?: [number, number, number]
    [key: string]: unknown
}

const DEFAULT_OPACITY = 1
const DEFAULT_DESATURATE = 0

/**
 * BitmapLayer accepts ImageData / ImageBitmap / HTMLImageElement / Texture,
 * but the upstream pipeline hands us a {@link TextureData} ({data, width,
 * height}). For 4-band Uint8 RGBA buffers we can wrap them in an ImageData
 * without copying. Other layouts (1-band grayscale, 2-band vector, float)
 * are unsupported by the stock BitmapLayer and yield null so the caller
 * skips the render.
 */
// function toBitmapImage(image: TextureData | ImageData | null | undefined): ImageData | null {
//     if (!image) {
//         return null
//     }

//     if (typeof ImageData !== 'undefined' && image instanceof ImageData) {
//         return image
//     }

//     const td = image as TextureData
//     if (!td.data || !td.width || !td.height) {
//         return null
//     }

//     const bandsCount = td.data.length / (td.width * td.height)
//     if (bandsCount !== 4) {
//         return null
//     }

//     let clamped: Uint8ClampedArray
//     if (td.data instanceof Uint8ClampedArray) {
//         clamped = td.data
//     } else if (td.data instanceof Uint8Array) {
//         clamped = new Uint8ClampedArray(td.data.buffer, td.data.byteOffset, td.data.byteLength)
//     } else {
//         return null
//     }

//     return new ImageData(clamped, td.width, td.height)
// }

/**
 * Creates a deck.gl {@link BitmapLayer} for the IMAGE_ALT rendering type.
 *
 * @param layer - Layer configuration object (resolved from the connection)
 * @param state - Per-layer settings (opacity etc.)
 * @param beforeId - MapLibre layer id to insert before (interleaved layers)
 * @returns Created BitmapLayer or null if the image payload is incompatible
 */
export function ImageAltLayerConnector(
    layer: ImageAltLayerConfig,
    state: LayerSettingsState,
    beforeId?: string,
): BitmapLayer | null {
    // const image = toBitmapImage(layer.image as TextureData | ImageData | null)
    // if (!image) {
    //     return null
    // }

    // console.log('image alt layer', layer)
    const opacity = state.imageOpacity ?? layer.opacity ?? DEFAULT_OPACITY

    return new BitmapLayer({
        id: `${layer.id ?? 'image-alt'}-image-alt`,
        image: layer.image,
        bounds: layer.bounds,
        opacity,
        desaturate: layer.desaturate ?? DEFAULT_DESATURATE,
        transparentColor: layer.transparentColor ?? [0, 0, 0, 0],
        tintColor: layer.tintColor ?? [255, 255, 255],
        pickable: true,
        // extensions: [new ClipExtension()],
        beforeId,
    } as unknown as BitmapLayerProps)
}
