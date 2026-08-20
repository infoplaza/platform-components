import { ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import type { Layer, Color } from '@deck.gl/core'
import type { ScatterplotLayerProps, TextLayerProps } from '@deck.gl/layers'
import type { GradeDataPoint } from '@/src/connections/grade'
import type { LayerSettingsState } from '@/src/providers/settings/layer-settings'

interface GradeLayerConfig {
    id?: string
    data?: GradeDataPoint[]
    beforeId?: string
    state: LayerSettingsState
}

function formatGradeLabel(point: GradeDataPoint): string {
    const value = point.value ?? ''
    const unit = point.unit ? ` ${point.unit}` : ''
    return `${value}${unit}`
}

export function GradeLayerConnector(layer: GradeLayerConfig, beforeId?: string): Layer[] | null {
    if (!layer.data?.length) {
        return null
    }

    try {
        const pointLayer = new ScatterplotLayer<GradeDataPoint>({
            id: `${layer.id ?? 'grades'}-circles`,
            data: layer.data,
            pickable: true,
            autoHighlight: true,
            stroked: false,
            filled: true,
            radiusUnits: 'pixels',
            getRadius: layer.state.gradeRadius,
            getPosition: (point) => [point.lon, point.lat],
            getFillColor: (point): Color => point.color,
            // beforeId,
        } as ScatterplotLayerProps<GradeDataPoint>)

        const textLayer = new TextLayer<GradeDataPoint>({
            id: `${layer.id ?? 'grades'}-text`,
            data: layer.data,
            characterSet: 'auto',
            getPosition: (point) => [point.lon, point.lat],
            getText: formatGradeLabel,
            getSize: layer.state.gradeTextSize,
            getColor: (point): Color => {
                if (layer.state.gradeTextColor) {
                    return [
                        layer.state.gradeTextColor.r,
                        layer.state.gradeTextColor.g,
                        layer.state.gradeTextColor.b,
                        Math.round(layer.state.gradeTextColor.a * 255),
                    ]
                }
                return point.textColor
            },
            sizeUnits: 'pixels',
            textAnchor: 'middle',
            alignmentBaseline: 'center',
            billboard: true,
            pickable: false,
            // beforeId,
            updateTriggers: {
                getColor: layer.state.gradeTextColor,
            },
        } as TextLayerProps<GradeDataPoint>)

        return [pointLayer, textLayer]
    } catch (error) {
        console.error('Error creating GradeLayer:', error)
        return null
    }
}
