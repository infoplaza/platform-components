import type { EnrichedMapLayer, MapLayer } from "@/@types/weather.types";

export const hasRendering = (layer: MapLayer | EnrichedMapLayer, rendering: string) => {
    if (!layer.rendering) {
        return false
    }
    if (Array.isArray(layer.rendering)) {
        return layer.rendering.includes(rendering)
    }
    return layer.rendering === rendering
}   