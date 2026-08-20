import { HighLowLayer } from "@/src/layers/high-low-layer/high-low-layer"
import type { HighLowLayerProps } from "@/src/layers/high-low-layer/high-low-layer"

export function RangeLayerConnector(
    layer: HighLowLayerProps,
): HighLowLayer | null {

    return new HighLowLayer({
        ...layer,
        image: layer.image,
        bounds: layer.bounds,
        radius: 100,
    }) as unknown as HighLowLayer;
}