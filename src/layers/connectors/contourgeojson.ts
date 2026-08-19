import { GeoJsonCustomLayer } from '@/src/layers/geojson'
import type { GeoJsonCustomLayerProps } from '@/src/layers/geojson'
import { TextLayer } from '@deck.gl/layers'
import type { TextLayerProps } from '@deck.gl/layers'
import type { Layer, Position as DeckPosition } from '@deck.gl/core'
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson'
import smooth from 'to-smooth'
import { rgbaStringToArray } from '@/src/_utils/color'
import type { LayerSettingsState } from '@/src/providers/settings/layer-settings'

function extractFeatures(data: FeatureCollection | Feature | Feature[] | null): Feature[] {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.type === 'FeatureCollection') return data.features
    return [data]
}

// Expand each feature into one feature per primitive geometry so that label
// rendering produces a label for every individual line / polygon / point
// rather than a single label per multi-geometry feature.
function flattenFeatureGeometries(features: Feature[]): Feature[] {
    const result: Feature[] = []
    for (const feature of features) {
        const geometry = feature.geometry
        if (!geometry) continue
        switch (geometry.type) {
            case 'MultiPoint':
                for (const coordinates of geometry.coordinates) {
                    result.push({ ...feature, geometry: { type: 'Point', coordinates } })
                }
                break
            case 'MultiLineString':
                for (const coordinates of geometry.coordinates) {
                    result.push({ ...feature, geometry: { type: 'LineString', coordinates } })
                }
                break
            case 'MultiPolygon':
                for (const coordinates of geometry.coordinates) {
                    result.push({ ...feature, geometry: { type: 'Polygon', coordinates } })
                }
                break
            case 'GeometryCollection':
                for (const g of geometry.geometries) {
                    result.push(...flattenFeatureGeometries([{ ...feature, geometry: g } as Feature]))
                }
                break
            default:
                result.push(feature)
        }
    }
    return result
}

function geometryCentroid(geometry: Geometry | null | undefined): Position | null {
    if (!geometry) return null
    if (geometry.type === 'Point') {
        return geometry.coordinates
    }
    const positions: Position[] = []
    const collect = (coords: unknown): void => {
        if (!Array.isArray(coords)) return
        if (typeof coords[0] === 'number') {
            positions.push(coords as Position)
            return
        }
        for (const child of coords) collect(child)
    }
    if ('coordinates' in geometry) {
        collect(geometry.coordinates)
    } else if (geometry.type === 'GeometryCollection') {
        for (const g of geometry.geometries) {
            const p = geometryCentroid(g)
            if (p) positions.push(p)
        }
    }
    if (positions.length === 0) return null
    let sumX = 0
    let sumY = 0
    for (const [x, y] of positions) {
        sumX += x
        sumY += y
    }
    return [sumX / positions.length, sumY / positions.length]
}

function defaultGetLabelPosition(feature: Feature): Position | null {
    const g = feature.geometry
    if (!g) return null
    if (g.type === 'LineString') {
        const coords = g.coordinates
        return (coords[Math.floor(coords.length / 2)] as Position) ?? null
    }
    if (g.type === 'MultiLineString') {
        const line = g.coordinates[0]
        return (line?.[Math.floor(line.length / 2)] as Position) ?? null
    }
    if (g.type === 'Polygon') {
        return (g.coordinates[0]?.[0] as Position) ?? null
    }
    if (g.type === 'Point') {
        return g.coordinates as Position
    }
    return geometryCentroid(g)
}

function isValidPosition(p: unknown): p is Position {
    return (
        Array.isArray(p) &&
        p.length >= 2 &&
        Number.isFinite(p[0]) &&
        Number.isFinite(p[1])
    )
}

function normalizeLabelAngle(angle: number): number {
    let normalized = ((angle + 180) % 360 + 360) % 360 - 180
    if (normalized > 90) normalized -= 180
    if (normalized < -90) normalized += 180
    return normalized
}

function projectMercator(position: Position): [number, number] {
    const longitude = position[0]
    const latitude = Math.max(-85.051129, Math.min(85.051129, position[1]))
    const latitudeRadians = latitude * Math.PI / 180

    return [
        longitude,
        Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2)) * 180 / Math.PI,
    ]
}

function getSegmentLabelAngle(start: Position | undefined, end: Position | undefined): number | null {
    if (!isValidPosition(start) || !isValidPosition(end)) return null

    const [x0, y0] = projectMercator(start)
    const [x1, y1] = projectMercator(end)
    const dx = x1 - x0
    const dy = y1 - y0
    if (dx === 0 && dy === 0) return null

    return normalizeLabelAngle(-Math.atan2(dy, dx) * 180 / Math.PI)
}

function interpolatePosition(start: Position, end: Position, t: number): Position {
    return [
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        ...(start.length >= 3 && end.length >= 3
            ? [start[2] + (end[2] - start[2]) * t]
            : []),
    ]
}

function getProjectedSegmentLength(start: Position, end: Position): number {
    const [x0, y0] = projectMercator(start)
    const [x1, y1] = projectMercator(end)
    return Math.hypot(x1 - x0, y1 - y0)
}

function getLineStringLabelPlacement(coordinates: Position[]): { position: Position; angle: number } | null {
    if (coordinates.length === 0) return null
    if (coordinates.length === 1) return { position: coordinates[0], angle: 0 }

    const segmentLengths: number[] = []
    let totalLength = 0

    for (let i = 0; i < coordinates.length - 1; i++) {
        const start = coordinates[i]
        const end = coordinates[i + 1]
        const length = isValidPosition(start) && isValidPosition(end)
            ? getProjectedSegmentLength(start, end)
            : 0

        segmentLengths.push(length)
        totalLength += length
    }

    if (totalLength === 0) {
        return { position: coordinates[Math.floor(coordinates.length / 2)], angle: 0 }
    }

    const targetLength = totalLength / 2
    let traversedLength = 0

    for (let i = 0; i < segmentLengths.length; i++) {
        const length = segmentLengths[i]
        if (length === 0) continue

        if (traversedLength + length >= targetLength) {
            const start = coordinates[i]
            const end = coordinates[i + 1]
            const t = (targetLength - traversedLength) / length

            return {
                position: interpolatePosition(start, end, t),
                angle: getSegmentLabelAngle(start, end) ?? 0,
            }
        }

        traversedLength += length
    }

    return { position: coordinates[coordinates.length - 1], angle: 0 }
}

function getLabelPlacement(feature: Feature): { position: Position | null; angle: number } {
    if (feature.geometry?.type === 'LineString') {
        const placement = getLineStringLabelPlacement(feature.geometry.coordinates)
        if (placement) return placement
    }

    return { position: defaultGetLabelPosition(feature), angle: 0 }
}

type LabelDatum = { feature: Feature; text: string; position: Position; angle: number }
type SmoothOptions = { iteration: number; factor: number }

const CONTOUR_SMOOTHING_OPTIONS: SmoothOptions[] = [
    { iteration: 1, factor: 0.8 },
    { iteration: 2, factor: 0.7 },
    { iteration: 5, factor: 0.5 },
]

function smoothLineCoordinates(coordinates: Position[], options: SmoothOptions): Position[] {
    if (coordinates.length < 2) return coordinates
    return (smooth as (path: number[][], options: SmoothOptions) => number[][])(
        coordinates as number[][],
        options
    ) as Position[]
}

function smoothContourGeoJsonData(
    data: FeatureCollection | Feature | Feature[] | null,
    smoothing: number
): FeatureCollection | Feature | Feature[] | null {
    if (smoothing === 0 || data == null) return data

    const smoothOptions = CONTOUR_SMOOTHING_OPTIONS[smoothing - 1]
    if (!smoothOptions) return data

    const geojson = structuredClone(data)
    for (const feature of extractFeatures(geojson)) {
        const geometry = feature.geometry
        if (!geometry) continue

        if (geometry.type === 'LineString') {
            geometry.coordinates = smoothLineCoordinates(geometry.coordinates, smoothOptions)
        }
        if (geometry.type === 'MultiLineString') {
            geometry.coordinates = geometry.coordinates.map(points => smoothLineCoordinates(points, smoothOptions))
        }
    }

    return geojson
}

function toUint8Alpha(value: number) {
    return Math.round(Math.max(0, Math.min(1, value)) * 255)
}

function getCustomLineColor(state: LayerSettingsState): [number, number, number, number] {
    return [
        state.contourGeoJsonColor.r,
        state.contourGeoJsonColor.g,
        state.contourGeoJsonColor.b,
        toUint8Alpha(state.contourGeoJsonColor.a),
    ]
}

function getCustomLabelColor(state: LayerSettingsState): [number, number, number, number] {
    return [
        state.contourGeoJsonLabelColor.r,
        state.contourGeoJsonLabelColor.g,
        state.contourGeoJsonLabelColor.b,
        toUint8Alpha(state.contourGeoJsonLabelColor.a),
    ]
}

function getPaletteLineColor(feature: Feature): [number, number, number, number] {
    const color = rgbaStringToArray(feature.properties?.color)
    return color && color.length >= 4
        ? [color[0], color[1], color[2], color[3]]
        : [0, 0, 0, 255]
}

export function ContourGeoJsonLayerConnector(
    layer: any,
    beforeId: string | undefined,
    state: LayerSettingsState
): Layer[] | null {
    if (!layer.data) {
        return null
    }
    try {
        const lineWidth = Math.max(Number(state.contourGeoJsonLineWidth) || 1, 0.1)
        const customLineColor = getCustomLineColor(state)
        const customLabelColor = getCustomLabelColor(state)
        const data = smoothContourGeoJsonData(layer.data, state.contourGeoJsonSmoothing)
        const rotateLabels = state.contourGeoJsonLabelRotation
        
        const getLineColorAccessor = (feature: Feature): [number, number, number, number] => {
            switch (state.contourGeoJsonColorMode) {
                case 'white':
                    return [255, 255, 255, 255]
                case 'black':
                    return [0, 0, 0, 255]
                case 'custom':
                    return customLineColor
                case 'palette':
                default:
                    return getPaletteLineColor(feature)
            }
        }

        const getLabelColorAccessor = (feature: Feature): [number, number, number, number] => {
            switch (state.contourGeoJsonLabelColorMode) {
                case 'black':
                    return [0, 0, 0, 255]
                case 'palette':
                    return getPaletteLineColor(feature)
                case 'custom':
                    return customLabelColor
                case 'white':
                default:
                    return [255, 255, 255, 255]
            }
        }

        const getLabel = (feature: Feature) => feature.properties?.value
        const getLabelSize = 12
        const labelFontFamily = 'sans-serif'
        const labelBillboard = true

        const labelFeatures: LabelDatum[] = flattenFeatureGeometries(extractFeatures(data))
            .map(feature => {
                const raw = getLabel(feature)
                if (raw == null || raw === '') return null
                const text = String(raw)
                const { position, angle } = rotateLabels
                    ? getLabelPlacement(feature)
                    : { position: defaultGetLabelPosition(feature), angle: 0 }
                if (!isValidPosition(position)) return null
                return { feature, text, position, angle }
            })
            .filter((d): d is LabelDatum => d !== null)

        return [
            new GeoJsonCustomLayer({
                id: layer.id,
                data,
                filled: true,
                stroked: true,
                extruded: false,
                lineWidthMinPixels: lineWidth,
                lineWidthMaxPixels: 10,
                lineWidthScale: 1,
                getFillColor: [0, 128, 255, 180],
                getLineWidth: lineWidth,
                getPointRadius: 5,
                getElevation: 0,
                pickable: true,
                autoHighlight: false,
                highlightColor: [255, 255, 0, 128],
                opacity: 1,
                topmost: false,
                beforeId: beforeId,
                getLineColor: getLineColorAccessor,
                updateTriggers: {
                    getLineWidth: [lineWidth],
                    getLineColor: [state.contourGeoJsonColorMode, state.contourGeoJsonColor],
                },
            } as unknown as GeoJsonCustomLayerProps),
            new TextLayer({
                id: `${layer.id}-labels`,
                data: labelFeatures,
                characterSet: 'auto',
                fontFamily: labelFontFamily,
                billboard: labelBillboard,
                sizeUnits: 'pixels',
                getPosition: (d: LabelDatum) => d.position as unknown as DeckPosition,
                getText: (d: LabelDatum) => d.text,
                getSize: typeof getLabelSize === 'function'
                    ? (d: LabelDatum) => (getLabelSize as (f: Feature) => number)(d.feature)
                    : getLabelSize,
                getColor: (d: LabelDatum) => getLabelColorAccessor(d.feature),
                getAngle: (d: LabelDatum) => d.angle,
                // getPixelOffset: typeof getLabelPixelOffset === 'function'
                //     ? (d: LabelDatum) => (getLabelPixelOffset as (f: Feature) => [number, number])(d.feature)
                //     : getLabelPixelOffset,
                pickable: false,
                background: true,
                getBackgroundColor: (d: LabelDatum) => getLineColorAccessor(d.feature),
                backgroundPadding: [4,2,4,2],
                backgroundBorderRadius: 4,
                parameters: { depthCompare: 'always' },
                beforeId: beforeId,
                updateTriggers: {
                    getColor: [state.contourGeoJsonLabelColorMode, state.contourGeoJsonLabelColor],
                    getBackgroundColor: [state.contourGeoJsonColorMode, state.contourGeoJsonColor],
                    getAngle: [rotateLabels],
                },
            } as TextLayerProps<LabelDatum>),
        ]
    } catch (e) {
        console.error('Error creating GeoJsonCustomLayer:', e)
        return null
    }
}
