export type ImageFillValue = 0 | 255 | null

export type ImageFillValueContext = {
    /** Regional grayscale tiles use byte 0 as nodata when the API omits fillvalue. */
    isRegionalGrayscale?: boolean
}

export function getImageFillValue(
    element: { fillvalue?: number | null } | undefined,
): ImageFillValue {
    if (element?.fillvalue == null || Number.isNaN(element.fillvalue)) {
        return null
    }

    const rounded = Math.round(element.fillvalue)
    if (rounded === 0 || rounded === 255) {
        return rounded
    }

    return null
}

export function resolveImageFillValue(
    layerFillValue: number | null | undefined,
    element: { fillvalue?: number | null } | undefined,
    context?: ImageFillValueContext,
): ImageFillValue {
    if (layerFillValue != null && !Number.isNaN(layerFillValue)) {
        const fromLayer = getImageFillValue({ fillvalue: layerFillValue })
        if (fromLayer != null) {
            return fromLayer
        }
    }

    const fromElement = getImageFillValue(element)
    if (fromElement != null) {
        return fromElement
    }

    if (context?.isRegionalGrayscale) {
        return 0
    }

    return null
}
