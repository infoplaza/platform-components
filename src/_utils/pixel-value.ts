import { ImageType } from './image-type'
import type { ImageUnscale } from './image-unscale'
import { mixOne } from './glsl'
import type { TextureData } from './texture-data'

type VectorValue = [u: number, v: number]
type PaletteColor = { r: number; g: number; b: number; a: number }

// Legend type definition
export interface Legend {
    visualization: {
        databounds: (number | null)[]
        datalabels: number[]
        colors: string[]
        labels?: string[]
    }
    unit?: string
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function getPaletteColor(texture: TextureData, x: number, y: number): PaletteColor {
    const bandsCount = texture.data.length / (texture.width * texture.height)
    const offset = (x + y * texture.width) * bandsCount
    const r = texture.data[offset] ?? 0
    const g = texture.data[offset + 1] ?? r
    const b = texture.data[offset + 2] ?? r
    const a = texture.data[offset + 3] ?? 255

    return { r, g, b, a }
}

/**
 * Given an RGBA pixel, find the (possibly fractional) X index in the palette
 * texture whose color best matches the pixel.
 *
 * Strategy:
 *  1. Scan the palette's middle row and pick the column with the smallest
 *     squared RGB distance to the pixel.
 *  2. Refine to sub-pixel accuracy by projecting the pixel color onto the
 *     line segment between the best column and its closer neighbor.
 *
 * The alpha channel is intentionally ignored: many palettes use alpha to fade
 * out low-data colors, but the encoded value is determined by the RGB hue.
 */
function findPaletteFractionalIndex(pixel: number[], paletteTexture: TextureData): number {
    const paletteWidth = paletteTexture.width
    const paletteHeight = paletteTexture.height
    if (paletteWidth <= 0 || paletteHeight <= 0) {
        return 0
    }
    if (paletteWidth === 1) {
        return 0
    }

    const paletteY = Math.min(Math.floor(paletteHeight / 2), paletteHeight - 1)
    const r = pixel[0]
    const g = pixel[1]
    const b = pixel[2]

    let bestIndex = 0
    let bestDistance = Infinity
    for (let x = 0; x < paletteWidth; x++) {
        const color = getPaletteColor(paletteTexture, x, paletteY)
        const dr = r - color.r
        const dg = g - color.g
        const db = b - color.b
        const distance = dr * dr + dg * dg + db * db
        if (distance < bestDistance) {
            bestDistance = distance
            bestIndex = x
        }
    }

    const bestColor = getPaletteColor(paletteTexture, bestIndex, paletteY)
    let neighborIndex = -1
    let neighborDistance = Infinity
    for (const offset of [-1, 1]) {
        const idx = bestIndex + offset
        if (idx < 0 || idx >= paletteWidth) {
            continue
        }
        const color = getPaletteColor(paletteTexture, idx, paletteY)
        const dr = r - color.r
        const dg = g - color.g
        const db = b - color.b
        const distance = dr * dr + dg * dg + db * db
        if (distance < neighborDistance) {
            neighborDistance = distance
            neighborIndex = idx
        }
    }

    if (neighborIndex < 0) {
        return bestIndex
    }

    const neighborColor = getPaletteColor(paletteTexture, neighborIndex, paletteY)
    const segDr = neighborColor.r - bestColor.r
    const segDg = neighborColor.g - bestColor.g
    const segDb = neighborColor.b - bestColor.b
    const segLengthSq = segDr * segDr + segDg * segDg + segDb * segDb
    if (segLengthSq === 0) {
        return bestIndex
    }

    const targetDr = r - bestColor.r
    const targetDg = g - bestColor.g
    const targetDb = b - bestColor.b
    const t = clamp((targetDr * segDr + targetDg * segDg + targetDb * segDb) / segLengthSq, 0, 1)

    return bestIndex + t * (neighborIndex - bestIndex)
}

function getPaletteBoundedValue(normalizedPaletteValue: number, paletteBounds?: [number, number]): number {
    if (!paletteBounds || paletteBounds[0] >= paletteBounds[1]) {
        return normalizedPaletteValue * 255
    }

    return mixOne(paletteBounds[0], paletteBounds[1], normalizedPaletteValue)
}

function getLogarithmicPaletteBoundedValue(normalizedPaletteValue: number, paletteBounds?: [number, number]): number {
    if (!paletteBounds || paletteBounds[0] >= paletteBounds[1]) {
        return normalizedPaletteValue * 255
    }

    const [minBound, maxBound] = paletteBounds
    if (minBound <= 0 || maxBound <= 0) {
        return getPaletteBoundedValue(normalizedPaletteValue, paletteBounds)
    }

    return Math.exp(mixOne(Math.log(minBound), Math.log(maxBound), normalizedPaletteValue))
}

function getLegendDatabounds(legend?: Legend): number[] {
    return (legend?.visualization?.databounds ?? []).filter((value): value is number => typeof value === 'number' && !isNaN(value))
}

function getVariationCoefficient(values: number[]): number {
    if (values.length === 0) {
        return Infinity
    }

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
    if (mean === 0) {
        return Infinity
    }

    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length

    return Math.sqrt(variance) / Math.abs(mean)
}

// export function hasLogarithmicLegendScale(legend?: Legend): boolean {
//     const databounds = getLegendDatabounds(legend)
//     if (databounds.length < 3) {
//         return false
//     }

//     for (let i = 1; i < databounds.length; i++) {
//         if (databounds[i] <= 0 || databounds[i] <= databounds[i - 1]) {
//             return false
//         }
//     }

//     const linearSteps: number[] = []
//     const logarithmicSteps: number[] = []
//     for (let i = 1; i < databounds.length; i++) {
//         linearSteps.push(databounds[i] - databounds[i - 1])
//         logarithmicSteps.push(Math.log(databounds[i]) - Math.log(databounds[i - 1]))
//     }

//     return getVariationCoefficient(logarithmicSteps) < getVariationCoefficient(linearSteps)
// }

export function hasPixelValue(pixel: number, imageUnscale: ImageUnscale): boolean {
    if (!imageUnscale) {
        return true
    }
    if ((imageUnscale[0] < pixel) && (pixel < imageUnscale[1])) {
        return true
    }
    
    return false
}

/**
 * Maps a fractional palette-texture column to a data value using the legend's
 * `databounds` array as a per-column lookup table. Linear interpolation between
 * adjacent entries is accurate for any distribution (linear, logarithmic,
 * hybrid) because the server provides one entry per palette column, so the
 * spacing between neighbours is always small.
 *
 * Returns NaN when the surrounding entries are both null/undefined, so callers
 * can fall back to a simpler `paletteBounds`-based mapping.
 */
function getValueFromLegendDatabounds(paletteIndex: number, paletteWidth: number, databounds: (number | null)[]): number {
    if (databounds.length < 2 || paletteWidth <= 0) {
        return NaN
    }

    const t = clamp(paletteIndex / Math.max(paletteWidth - 1, 1), 0, 1)
    const scaled = t * (databounds.length - 1)
    const lowerIndex = Math.floor(scaled)
    const upperIndex = Math.min(lowerIndex + 1, databounds.length - 1)
    const frac = scaled - lowerIndex

    const lower = databounds[lowerIndex]
    const upper = databounds[upperIndex]

    if (typeof lower === 'number' && typeof upper === 'number') {
        return lower + frac * (upper - lower)
    }
    if (typeof lower === 'number') {
        return lower
    }
    if (typeof upper === 'number') {
        return upper
    }

    return NaN
}

function getPixelScalarValueWithPalette(pixel: number[], paletteTexture: TextureData, paletteBounds?: [number, number], legend?: Legend): number {
    const paletteWidth = paletteTexture.width
    if (paletteWidth <= 0) {
        return NaN
    }

    // The image is no longer grayscale: `pixel` is the actual RGBA color drawn
    // on screen. Locate that color's column inside the palette texture, then
    // translate the column to a value. When the legend provides `databounds`
    // (one entry per palette column), use it as the lookup table so the same
    // code handles linear, logarithmic, and hybrid distributions. Otherwise
    // fall back to a linear mapping across `paletteBounds`.
    const paletteIndex = findPaletteFractionalIndex(pixel, paletteTexture)
    const databounds = legend?.visualization?.databounds

    if (databounds && databounds.length >= 2) {
        const value = getValueFromLegendDatabounds(paletteIndex, paletteWidth, databounds)
        if (!isNaN(value)) {
            return value
        }
    }

    const normalizedPaletteValue = paletteIndex / Math.max(paletteWidth - 1, 1)

    return getPaletteBoundedValue(normalizedPaletteValue, paletteBounds)
}

/**
 * Resolves the scalar value for alpha-encoded images.
 *
 * These images use a single constant RGB color and encode the data value
 * exclusively in the alpha channel: alpha = 0 represents the lower palette
 * bound (or "no data" when the pixel is fully transparent) and alpha = 255
 * represents the upper palette bound.
 *
 * Fully-transparent pixels are treated as "no data" and return NaN so that
 * downstream consumers (tooltip, picking, etc.) can skip them.
 */
function getPixelScalarValueWithAlpha(pixel: number[], paletteBounds?: [number, number], legend?: Legend): number {
    const alpha = pixel[3]
    if (alpha == null || isNaN(alpha) || alpha <= 0) {
        return NaN
    }

    const normalizedPixelAlpha = clamp(alpha, 0, 255) / 255

    // if (hasLogarithmicLegendScale(legend)) {
    //     return getLogarithmicPaletteBoundedValue(normalizedPixelAlpha, paletteBounds)
    // }

    return getPaletteBoundedValue(normalizedPixelAlpha, paletteBounds)
}

/**
 * Resolves the scalar value for grayscale-encoded images.
 *
 * Here `pixel[0]` (red) directly encodes the position along the palette
 * texture, so we know the palette column without having to match RGB colors.
 * The column is then translated to a data value:
 *  - When the legend provides a `databounds` array (one entry per palette
 *    column), use it as a lookup table. Linear interpolation between adjacent
 *    entries handles linear, logarithmic, and hybrid distributions correctly.
 *  - Otherwise fall back to a linear mapping across `paletteBounds`.
 */
function getPixelScalarValueWithGrayscale(pixel: number[], paletteTexture: TextureData, paletteBounds?: [number, number], legend?: Legend): number {
    const paletteWidth = paletteTexture.width
    if (paletteWidth <= 0) {
        return NaN
    }

    const normalizedPixelRed = clamp(pixel[0], 0, 255) / 255
    const paletteIndex = normalizedPixelRed * Math.max(paletteWidth - 1, 0)

    // should only be available for logarithmic images
    const databounds = legend?.visualization?.databounds
    if (databounds && databounds.length >= 2) {
        const value = getValueFromLegendDatabounds(paletteIndex, paletteWidth, databounds)
        if (!isNaN(value)) {
            return value
        }
    }

    return getPaletteBoundedValue(normalizedPixelRed, paletteBounds)
}

function getPixelScalarValue(pixel: number[], imageType: ImageType, imageUnscale: ImageUnscale, legend?: Legend, paletteTexture?: TextureData, paletteBounds?: [number, number], isAlphaImage?: boolean, grayscale?: boolean): number {
    if (imageType === ImageType.VECTOR) {
        return 0
    } else {
        if (!grayscale && isAlphaImage && paletteTexture) {
            return getPixelScalarValueWithGrayscale(pixel, paletteTexture, paletteBounds, legend)
        }

        // For grayscale images, we use the palette texture to get the value
        if (grayscale && paletteTexture) {
            return getPixelScalarValueWithGrayscale(pixel, paletteTexture, paletteBounds, legend)
        }

        // For color images, we use the palette texture to get the value
        if (!grayscale && paletteTexture) {
            return getPixelScalarValueWithPalette(pixel, paletteTexture, paletteBounds, legend)
        }

        if (imageUnscale) {
            return mixOne(imageUnscale[0], imageUnscale[1], pixel[0] / 255)
        }

        return pixel[0]
    }
}

function getPixelVectorValue(pixel: number[], imageType: ImageType, imageUnscale: ImageUnscale): VectorValue {
    if (imageType === ImageType.VECTOR) {
        if (imageUnscale) {
            return [
                mixOne(imageUnscale[0], imageUnscale[1], pixel[0] / 255),
                mixOne(imageUnscale[0], imageUnscale[1], pixel[1] / 255)
            ]
        } else {
            const maxSpeed = 100
            const fillOffset = 1
            const encodedSpeed = pixel[0] / 255
            const encodedDirection = pixel[1] / 255
            const speed = Math.exp(encodedSpeed * Math.log(maxSpeed + fillOffset)) - fillOffset
            const dirRad = encodedDirection * Math.PI * 2
    
            return [
                -speed * Math.sin(dirRad),
                -speed * Math.cos(dirRad),
            ]
        }
    } else {
        return [NaN, NaN]
    }
}

export function getPixelMagnitudeValue(pixel: number[], imageType: ImageType, imageUnscale: ImageUnscale, legend?: Legend, paletteTexture?: TextureData, paletteBounds?: [number, number], isAlphaImage?: boolean, grayscale?: boolean): number {
    if (imageType === ImageType.VECTOR) {
        const value = getPixelVectorValue(pixel, imageType, imageUnscale)

        return Math.hypot(value[0], value[1])
    } 

    return getPixelScalarValue(pixel, imageType, imageUnscale, legend, paletteTexture, paletteBounds, isAlphaImage, grayscale)
}

export function getPixelDirectionValue(pixel: number[], imageType: ImageType, imageUnscale: ImageUnscale): number {
    if (imageType === ImageType.VECTOR) {
        const value = getPixelVectorValue(pixel, imageType, imageUnscale)

        return ((360 - (Math.atan2(value[1], value[0]) / Math.PI * 180 + 180)) - 270) % 360
    } else {
        return NaN
    }
}