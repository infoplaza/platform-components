import { GeoJsonCustomLayer } from '@/src/layers/geojson'
import type { GeoJsonCustomLayerProps } from '@/src/layers/geojson'
import { TextLayer } from '@deck.gl/layers'
import type { TextLayerProps } from '@deck.gl/layers'
import type { Feature, FeatureCollection, Point } from 'geojson'
import type { Layer } from '@deck.gl/core'
import { CollisionFilterExtension } from '@deck.gl/extensions';
import type { LayerSettingsState } from '@/src/providers/settings/layer-settings'


interface StormtracksLayerConfig {
    id?: string
    data?: FeatureCollection | Feature | Feature[] | null
    filled?: boolean
    stroked?: boolean
    extruded?: boolean
    pointRadiusMinPixels?: number
    pointRadiusMaxPixels?: number
    pointRadiusScale?: number
    lineWidthMinPixels?: number
    lineWidthMaxPixels?: number
    lineWidthScale?: number
    getFillColor?: GeoJsonCustomLayerProps['getFillColor']
    getLineColor?: GeoJsonCustomLayerProps['getLineColor']
    getLineWidth?: GeoJsonCustomLayerProps['getLineWidth']
    getDashArray?: GeoJsonCustomLayerProps['getDashArray']
    dashJustified?: boolean
    getPointRadius?: GeoJsonCustomLayerProps['getPointRadius']
    getElevation?: GeoJsonCustomLayerProps['getElevation']
    pickable?: boolean
    autoHighlight?: boolean
    highlightColor?: [number, number, number, number]
    opacity?: number
    topmost?: boolean
    beforeId?: string
    getText?: (d: Feature) => string
    getTextSize?: number
    getTextColor?: [number, number, number, number] | ((d: Feature) => [number, number, number, number])
    getTextPixelOffset?: [number, number]
    [key: string]: unknown
}

function extractPointFeatures(data: FeatureCollection | Feature | Feature[] | null): Feature<Point>[] {
    if (!data) return []
    const features: Feature[] = Array.isArray(data)
        ? data
        : data.type === 'FeatureCollection'
            ? data.features
            : [data]
    return features.filter(
        (f): f is Feature<Point> => f.geometry?.type === 'Point'
    )
}

export function StormtracksLayerConnector(
    layer: StormtracksLayerConfig,
    beforeId?: string,
    state?: LayerSettingsState
): Layer[] | null {
    if (!layer.data) {
        return null
    }

    try {
        const geojsonLayer = new GeoJsonCustomLayer({
            ...layer,
            data: layer.data,
            filled: layer.filled ?? true,
            stroked: layer.stroked ?? true,
            extruded: layer.extruded ?? false,
            pointRadiusMinPixels: layer.pointRadiusMinPixels ?? 2,
            pointRadiusMaxPixels: layer.pointRadiusMaxPixels ?? 10,
            pointRadiusScale: layer.pointRadiusScale ?? 1,
            lineWidthMinPixels: layer.lineWidthMinPixels ?? 1,
            lineWidthMaxPixels: layer.lineWidthMaxPixels ?? 10,
            lineWidthScale: layer.lineWidthScale ?? 1,
            getFillColor: layer.getFillColor ?? [0, 128, 255, 180],
            getLineColor: layer.getLineColor ?? [0, 0, 0, 255],
            getLineWidth: layer.getLineWidth ?? 3,
            getDashArray: layer.getDashArray ?? [8, 4],
            dashJustified: layer.dashJustified ?? true,
            getPointRadius: layer.getPointRadius ?? 5,
            getElevation: layer.getElevation ?? 0,
            pickable: layer.pickable ?? true,
            autoHighlight: layer.autoHighlight ?? false,
            highlightColor: layer.highlightColor ?? [255, 255, 0, 128],
            opacity: layer.opacity ?? 1,
            topmost: true,
            beforeId: beforeId,
        } as unknown as GeoJsonCustomLayerProps)

        const pointFeatures = extractPointFeatures(layer.data)

        const getText = layer.getText ?? ((d: Feature) => {
            const name = d.properties?.formattedDateTime ?? ''
            return name;
        })

        const fontSize = layer.getTextSize ?? 8
        const zoom = (layer.zoom as number) ?? 4
        const scale = 2 ** zoom
        const sizeMaxPixels = (scale / 3) * fontSize
        const sizeMinPixels = Math.min(scale / 1000, 0.5) * fontSize
        const textLayer = new TextLayer({
            id: `${layer.id ?? 'stormtracks'}-text`,
            data: pointFeatures,
            characterSet: 'auto',
            // fontSettings: {
            //     sdf: true,
            //     fontSize: 64,
            //     buffer: 12,
            //     radius: 8,
            // },
            getPosition: (d: Feature<Point>) => d.geometry.coordinates as [number, number],
            getText: (d: Feature) => getText(d),
            getSize: layer.getTextSize ?? 12,
            getColor: layer.getTextColor ?? [255, 255, 255, 255],
            sizeScale: 1,
            getPixelOffset: layer.getTextPixelOffset ?? [0, 12],
            sizeMaxPixels,
            sizeMinPixels,
            fontFamily: state?.textFontFamily,
            billboard: true,
            sizeUnits: 'pixels' as const,
            getRadius: 1,
            radiusUnits: 'pixels',  
            textAnchor: 'start',
            alignmentBaseline: 'center',
            // outlineWidth: 1,
            // outlineColor: [0, 0, 0, 255],
            pickable: false,
            extensions: [new CollisionFilterExtension()],
            collisionEnabled: true,
            collisionGroup: `${layer.id ?? 'stormtracks'}-collision`,
            getCollisionPriority: (d: Feature<Point>) => d.properties?.windSpeedKTS ?? 0,
            parameters: {
                depthCompare: 'always',
            },
            beforeId: beforeId,
        } as TextLayerProps<Feature<Point>>)

        return [geojsonLayer, textLayer]
    } catch (e) {
        console.error('Error creating StormtracksLayer:', e)
        return null
    }
}
