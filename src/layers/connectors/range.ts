import { HighLowLayer } from "@/src/layers/high-low-layer/high-low-layer"
import type { HighLowLayerProps } from "@/src/layers/high-low-layer/high-low-layer"

const DEFAULT_RANGE_RADIUS = 100

export function RangeLayerConnector(
    layer: HighLowLayerProps,
    beforeId?: string,
): HighLowLayer | null {
    return new HighLowLayer({
        ...layer,
        image: layer.image,
        bounds: layer.bounds,
        radius: DEFAULT_RANGE_RADIUS,
        beforeId,
    }) as unknown as HighLowLayer
}
