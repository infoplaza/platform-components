import { ScatterplotLayer } from '@deck.gl/layers'
import type { Color } from '@deck.gl/core'
import type { LayerSettingsState } from '@/src/providers/settings/layer-settings'

export interface PlotDataPoint {
    lat: number
    lon: number
    locationId?: number | string
    value?: number
    label?: string
    /** Present on wind-speed map points when direction is available for the same timestep. */
    windDirection10m?: number
    /** AMDAR wind direction in degrees. */
    windDirection?: number
    /** AMDAR aircraft identifier for tooltips. */
    aircraftId?: string
    /** AMDAR flight level in feet. */
    flightLevel?: number
    /** WMO present-weather code (ww, 0–99) for the picked observation. */
    weatherType?: number
    /** METAR present-weather string (e.g. "-RA", "TSRA", "HZ"). */
    wxString?: string
    /** WMO ww code directly from the observation (preferred over weatherType). */
    ww?: number
    radius?: number
    color?: Color
    // Station plot fields
    dewpoint?: number
    windSpeed10m?: number
    /** Cloud cover in oktas (0–9; 9 = sky obscured). */
    cloudCoverOkta?: number
    /** Mean sea level pressure in hPa. */
    pressure?: number
}

interface PlotLayerConfig {
    id?: string
    data: PlotDataPoint[]
    bounds?: [number, number, number, number]
    opacity?: number
    radiusScale?: number
    radiusMinPixels?: number
    radiusMaxPixels?: number
    fillColor?: Color
    lineColor?: Color
    lineWidth?: number
    stroked?: boolean
    filled?: boolean
    selectedPlotId?: number | null
    [key: string]: unknown
}

const DEFAULT_FILL_COLOR: Color = [255, 140, 0, 200]
const DEFAULT_LINE_COLOR: Color = [0, 0, 0, 255]
const SELECTED_LINE_COLOR: Color = [255, 255, 255, 255]
const DEFAULT_RADIUS_SCALE = 15
const DEFAULT_RADIUS_MIN_PIXELS = 3
const DEFAULT_RADIUS_MAX_PIXELS = 10
const DEFAULT_LINE_WIDTH = 1
const SELECTED_LINE_WIDTH = 2
const SELECTED_RADIUS_MULTIPLIER = 100
const DEFAULT_OPACITY = 0.8

export function PlotLayerConnector( layer: PlotLayerConfig, state: LayerSettingsState): ScatterplotLayer<PlotDataPoint> | null {
    if (!layer.data?.length) {
        return null
    }

    const opacity = layer.opacity ?? DEFAULT_OPACITY
    const fillColor = layer.fillColor ?? DEFAULT_FILL_COLOR
    const lineColor = layer.lineColor ?? DEFAULT_LINE_COLOR
    const selectedId = layer.selectedPlotId ?? null
    const baseLineWidth = layer.lineWidth ?? DEFAULT_LINE_WIDTH

    try {

        return new ScatterplotLayer<PlotDataPoint>({
            id: layer.id ?? 'plot-layer',
            data: layer.data,
            pickable: true,
            autoHighlight: true,
            stroked: layer.stroked ?? true,
            filled: layer.filled ?? true,
            radiusScale: layer.radiusScale ?? DEFAULT_RADIUS_SCALE,
            radiusMinPixels: layer.radiusMinPixels ?? DEFAULT_RADIUS_MIN_PIXELS,
            radiusMaxPixels: layer.radiusMaxPixels ?? DEFAULT_RADIUS_MAX_PIXELS,
            lineWidthMinPixels: 1,
            lineWidthUnits: 'pixels',
            getPosition: (d: PlotDataPoint) => {
                return [d.lon, d.lat]
            },
            getRadius: (d: PlotDataPoint) => {
                const base = d.radius ?? 1
                return selectedId != null && d.locationId === selectedId
                    ? base * SELECTED_RADIUS_MULTIPLIER
                    : base
            },
            getFillColor: (d: PlotDataPoint) => d.color ?? fillColor,
            getLineColor: (d: PlotDataPoint) =>
                selectedId != null && d.locationId === selectedId
                    ? SELECTED_LINE_COLOR
                    : lineColor,
            getLineWidth: (d: PlotDataPoint) =>
                selectedId != null && d.locationId === selectedId
                    ? SELECTED_LINE_WIDTH
                    : baseLineWidth,
            opacity,
            updateTriggers: {
                getPosition: [layer.data],
                getRadius: [selectedId, layer.data],
                getFillColor: [layer.data, fillColor],
                getLineColor: [selectedId],
                getLineWidth: [selectedId],
            },
        })
    } catch (error) {
        console.error('Error creating ScatterplotLayer:', error)
        return null
    }
}
