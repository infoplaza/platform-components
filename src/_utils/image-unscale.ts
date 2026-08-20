export type ImageUnscale = [min: number, max: number] | null;

const REGIONAL_DATABOUNDS_TRIM_HEAD = 2
const REGIONAL_DATABOUNDS_TRIM_TAIL = 1

/**
 * Regional legends prepend sentinel databounds and append an upper cap that
 * sit outside the encoded pixel range. Strip those before deriving imageUnscale.
 */
export function trimRegionalDatabounds(databounds: (number | null)[]): (number | null)[] {
    if (databounds.length <= REGIONAL_DATABOUNDS_TRIM_HEAD + REGIONAL_DATABOUNDS_TRIM_TAIL) {
        return databounds
    }

    return databounds.slice(REGIONAL_DATABOUNDS_TRIM_HEAD, -REGIONAL_DATABOUNDS_TRIM_TAIL)
}

export function getPaletteBounds(databounds: (number | null)[] | undefined): [number, number] {
    if (!databounds?.length) {
        return [0, 0]
    }

    const numericBounds = databounds.filter((value): value is number => typeof value === 'number' && !isNaN(value))
    if (!numericBounds.length) {
        return [0, 0]
    }

    return [Math.min(...numericBounds), Math.max(...numericBounds)]
}

export function getImageUnscaleFromDatabounds(
    databounds: (number | null)[] | undefined,
    options?: { regional?: boolean },
): ImageUnscale {
    if (!databounds?.length) {
        return null
    }

    if (options?.regional) {
        const trimmed = trimRegionalDatabounds(databounds)
        const min = trimmed[0]
        const max = trimmed[trimmed.length - 1]

        if (typeof min === 'number' && typeof max === 'number' && !isNaN(min) && !isNaN(max) && min < max) {
            return [min, max]
        }

        return null
    }

    const [min, max] = getPaletteBounds(databounds)
    return min < max ? [min, max] : null
}

export function isRegionalModel(regionCategory: string | undefined): boolean {
    return regionCategory != null && regionCategory !== 'global'
}
