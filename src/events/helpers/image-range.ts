export interface ImageRangeLayerInput {
    element?: string
    level?: string | null
    unit?: string
    settings?: {
        image?: {
            imageMinValue?: number
            imageMaxValue?: number
        }
    }
    data?: {
        element?: {
            unit?: string
            databounds?: (number | null)[]
        }
    }
}

export interface ImageMinMax {
    imageMinValue?: number
    imageMaxValue?: number
}

/**
 * Identity for the image clip range. Unit is included so a Celsius range is
 * not reused after switching to Fahrenheit (settings buckets are keyed by
 * element|level only).
 */
export function getImageRangeIdentity(layer: ImageRangeLayerInput): string {
    const unit = layer.data?.element?.unit ?? layer.unit ?? ''

    return `${layer.element ?? ''}|${layer.level ?? ''}|${unit}`
}

function databoundsExtent(databounds: (number | null)[] | undefined): { min: number; max: number } | null {
    if (!databounds?.length) {
        return null
    }

    const values = databounds.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
    if (!values.length) {
        return null
    }

    const min = Math.floor(Math.min(...values))
    const max = Math.ceil(Math.max(...values))
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return null
    }

    return { min, max }
}

/**
 * Config min/max win when set; any omitted axis falls back to databounds.
 */
export function resolveImageMinMax(layer: ImageRangeLayerInput): ImageMinMax {
    const cfgMin = layer.settings?.image?.imageMinValue
    const cfgMax = layer.settings?.image?.imageMaxValue
    const extent = databoundsExtent(layer.data?.element?.databounds)
    const out: ImageMinMax = {}

    if (cfgMin !== undefined) {
        out.imageMinValue = cfgMin
    } else if (extent) {
        out.imageMinValue = extent.min
    }

    if (cfgMax !== undefined) {
        out.imageMaxValue = cfgMax
    } else if (extent) {
        out.imageMaxValue = extent.max
    }

    return out
}
