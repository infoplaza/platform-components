export type ViewportGetLayersUrlArgs = {
    bounds: {
        _ne: { lat: number; lng: number }
        _sw: { lat: number; lng: number }
    }
    zoom: number
    graphicalPreset?: number
}

export function buildLayersViewportUrl(
    layersUrl: string,
    _args: ViewportGetLayersUrlArgs,
    modelInfo: any
) {
    const defaultBoundingbox = {
        east: 180,
        north: 89.9,
        south: -89.9,
        west: -180,
    }
    const zoomLevel = modelInfo?.maxzoom

    const { west, east, south, north } = modelInfo?.boundingbox ?? defaultBoundingbox
    return layersUrl
        .replace('{zoom}', String(zoomLevel))
        .replace('{ne.lat}', String(north.toFixed(2)))
        .replace('{ne.lng}', String(east.toFixed(2)))
        .replace('{sw.lat}', String(south.toFixed(2)))
        .replace('{sw.lng}', String(west.toFixed(2)))
}

export function buildLayersUrlFromMapBounds(
    // layer: { view: Record<string, any> },
    layersUrl: string,
    { bounds, zoom, graphicalPreset = 1 }: ViewportGetLayersUrlArgs,
    modelInfo: any
) {

    const defaultZoomOffset = 0
    const totalOffset = defaultZoomOffset + graphicalPreset
    const correctedZoom = zoom + totalOffset
    const zoomLevel = Math.min(Math.floor(correctedZoom), 10)

    const {
        _ne: { lat: neLat, lng: neLng },
        _sw: { lat: swLat, lng: swLng }
    } = bounds

    return layersUrl
        .replace('{zoom}', String(zoomLevel))
        .replace('{ne.lat}', String(Math.ceil(neLat)))
        .replace('{ne.lng}', String(Math.ceil(neLng)))
        .replace('{sw.lat}', String(Math.floor(swLat)))
        .replace('{sw.lng}', String(Math.floor(swLng)))
}
