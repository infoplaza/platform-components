import type { ImageProperties } from './image-properties'
import { ImageInterpolation } from './image-interpolation'
import { ImageType } from './image-type'
import { getProjectFunction, getUnprojectFunction, getProjectFunction2 } from './project'
import { hasPixelValue, getPixelMagnitudeValue, getPixelDirectionValue } from './pixel-value'
import { getPixelInterpolate, getImageDownscaleResolution } from './pixel'
import type { FloatData } from './texture-data'
import { isRepeatBounds, isPositionInBounds } from './bounds'

export interface RasterPointProperties {
  value: number;
  direction?: number;
  visualColor?: [number, number, number, number];
}

function createRasterPoint(position: GeoJSON.Position, properties: RasterPointProperties): GeoJSON.Feature<GeoJSON.Point, RasterPointProperties> {
    return { type: 'Feature', geometry: { type: 'Point', coordinates: position }, properties }
}

export function getRasterPoints(imageProperties: ImageProperties & { isAlphaImage?: boolean, grayscale?: boolean }, bounds: GeoJSON.BBox, positions: GeoJSON.Position[]): GeoJSON.FeatureCollection<GeoJSON.Point, RasterPointProperties> {
    const { image, image2, imageSmoothing, imageInterpolation, imageWeight, imageType, imageUnscale, imageMinValue, imageMaxValue, legend, paletteTexture, paletteBounds, isAlphaImage, grayscale } = imageProperties
    const { width, height } = image
    const project = getProjectFunction(width, height, bounds)
    // smooth by downscaling resolution
    const imageDownscaleResolution = getImageDownscaleResolution(width, height, imageSmoothing)
    const isRepeatBoundsCache = isRepeatBounds(bounds)

    const rasterPoints = positions.map(position => {
        if (!isPositionInBounds(position, bounds)) {
            // drop position out of bounds
            return createRasterPoint(position, { value: NaN })
        }

        const point = project(position)
        const uvX = point[0] / (width)
        const uvY = point[1] / (height)
        const pixel = getPixelInterpolate(image, image2, imageDownscaleResolution, imageInterpolation, imageWeight, isRepeatBoundsCache, uvX, uvY)

        const value = getPixelMagnitudeValue(pixel, imageType, imageUnscale, legend, paletteTexture, paletteBounds, isAlphaImage, grayscale)
        if (!hasPixelValue(value, imageUnscale)) {
            // drop nodata
            return createRasterPoint(position, { value: NaN })
        }

        if (
            (typeof imageMinValue === 'number' && !isNaN(imageMinValue) && value < imageMinValue) ||
            (typeof imageMaxValue === 'number' && !isNaN(imageMaxValue) && value > imageMaxValue)
        ) {
            // drop value out of bounds
            return createRasterPoint(position, { value: NaN })
        }

        if (imageType === ImageType.VECTOR) {
            const direction = getPixelDirectionValue(pixel, imageType, imageUnscale)

            return createRasterPoint(position, { value, direction })
        } else {
            return createRasterPoint(position, { value, visualColor: pixel as [number, number, number, number]  })
        }
    })

    return { type: 'FeatureCollection', features: rasterPoints }
}

export function getRasterMagnitudeData(imageProperties: ImageProperties, bounds: GeoJSON.BBox): FloatData {
    const { image, image2, imageSmoothing, imageInterpolation, imageWeight, imageType, imageUnscale, imageMinValue, imageMaxValue, legend, paletteTexture, paletteBounds } = imageProperties
    const { width, height } = image
    // interpolation for entire data is slow, fallback to NEAREST interpolation + blur in worker
    // CPU speed (image 1440x721):
    // - NEAREST - 100 ms
    // - LINEAR - 600 ms
    // - CUBIC - 6 s
    const effectiveImageInterpolation = imageInterpolation !== ImageInterpolation.NEAREST ? ImageInterpolation.NEAREST : imageInterpolation
    // smooth by downscaling resolution
    const imageDownscaleResolution = getImageDownscaleResolution(width, height, imageSmoothing)
    const isRepeatBoundsCache = isRepeatBounds(bounds)
    const magnitudeData = new Float32Array(width * height)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = x + y * width
            const uvX = x / width
            const uvY = y / height
            const pixel = getPixelInterpolate(image, image2, imageDownscaleResolution, effectiveImageInterpolation, imageWeight, isRepeatBoundsCache, uvX, uvY)

            const value = getPixelMagnitudeValue(pixel, imageType, imageUnscale, legend, paletteTexture, paletteBounds)
            if (!hasPixelValue(value, imageUnscale)) {
                // drop nodata
                magnitudeData[i] = NaN
                continue
            }
            if (
                (typeof imageMinValue === 'number' && !isNaN(imageMinValue) && value < imageMinValue) ||
        (typeof imageMaxValue === 'number' && !isNaN(imageMaxValue) && value > imageMaxValue)
            ) {
                // drop value out of bounds
                magnitudeData[i] = NaN
                continue
            }

            magnitudeData[i] = value
        }
    }

    return { data: magnitudeData, width, height }
}