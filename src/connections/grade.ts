import { MapLayer } from '@/@types/weather.types'
import Connection, { ConnectionConfig, resolveApiEnv } from "./connection"

type Color = [number, number, number, number]

export interface GradeDataPoint {
    type: 'grades'
    lat: number
    lon: number
    locationId?: number | string
    name?: string
    value?: number | string
    unit?: string
    color: Color
    textColor: Color
    properties: Record<string, any>
    feature: any
}

function hexToRgba(hex: unknown, fallback: Color): Color {
    if (typeof hex !== 'string') {
        return fallback
    }

    const clean = hex.trim().replace('#', '')
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
        return fallback
    }

    return [
        parseInt(clean.substring(0, 2), 16),
        parseInt(clean.substring(2, 4), 16),
        parseInt(clean.substring(4, 6), 16),
        255,
    ]
}

function getTimestamps(data: any): number[] {
    return (data?.timestamps ?? [])
        .map((timestamp: unknown) => Number(timestamp))
        .filter((timestamp: number) => Number.isFinite(timestamp))
}

function getGeoJson(data: any): any {
    return data?.result?.geojson ?? data?.geojson ?? data
}

function buildOffsetUrl(url: string | undefined, offset: number): string | null {
    if (!url) {
        return null
    }

    const isAbsolute = /^[a-z][a-z\d+\-.]*:/i.test(url)
    const parsed = new URL(url, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
    parsed.searchParams.set('offset', String(offset))

    return isAbsolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`
}

function normalizeFeature(feature: any): GradeDataPoint | null {
    const coordinates = feature?.geometry?.coordinates
    const lon = Number(coordinates?.[0])
    const lat = Number(coordinates?.[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return null
    }

    const properties = feature.properties ?? {}
    const value = properties.value ?? properties.grade

    return {
        type: 'grades',
        lat,
        lon,
        locationId: properties.locationId ?? properties.location_id ?? properties.id,
        name: properties.name ?? properties.locationName,
        value,
        unit: properties.unit,
        color: hexToRgba(properties.im_color, [128, 128, 128, 255]),
        textColor: hexToRgba(properties.im_textcolor, [255, 255, 255, 255]),
        properties,
        feature,
    }
}

export default class GradeConnection extends Connection {
    constructor(config: ConnectionConfig) {
        super()
        this.config = {
            apiEnv: resolveApiEnv(config.apiEnv),
        }
    }
    
    get server(): string | null {
        return ''
    }

    get layers(): string {
        return '/api/grades/bounds?element={element}&offset=0&latmin={sw.lat}&lonmin={sw.lng}&latmax={ne.lat}&lonmax={ne.lng}&zoom={zoom}&apiEnv={apiEnv}'
    }

    getTemplateUrl(): string {
        return this.layers
    }

    resolveTemplateUrl(params: any): string {
        let url = this.getTemplateUrl()

        const replacements: [string, string][] = [
            ['{element}', encodeURIComponent(params.element ?? '')],
            ['{apiEnv}', encodeURIComponent(params.apiEnv ?? this.config.apiEnv)],
        ]

        for (const [token, value] of replacements) {
            url = url.replace(token, value)
        }

        return url
    }

    resolveParams({ layer, modelInfo }: any): any {
        return {
            element: layer?.element ?? modelInfo?.slug ?? '',
            apiEnv: this.config.apiEnv,
        }
    }

    resolveTimestamps({ layer }: any): number[] {
        return getTimestamps(layer.data)
    }

    async getTextures(
        layer: MapLayer & { id: string, layersUrl?: string },
        ts: number | undefined | null,
        _textureLoadMode: string,
        options?: { signal?: AbortSignal },
    ): Promise<Record<string, any> | undefined> {
        const signal = options?.signal
        const layerData = layer.data as any
        const timestamps = getTimestamps(layerData)
        const requestedOffset = ts == null ? 0 : timestamps.indexOf(Number(ts))
        const offset = requestedOffset >= 0 ? requestedOffset : 0
        const loadedOffset = Number(layerData?.query?.offset ?? 0)
        let data = layerData

        if (offset !== loadedOffset) {
            const url = buildOffsetUrl(layer.layersUrl, offset)
            if (!url) {
                return undefined
            }

            const response = await fetch(url, { signal })
            if (!response.ok || signal?.aborted) {
                return undefined
            }
            data = await response.json()
        }

        if (signal?.aborted) {
            return undefined
        }

        const geojson = getGeoJson(data)
        const points = (geojson?.features ?? [])
            .map(normalizeFeature)
            .filter(Boolean)

        return {
            id: layer.id,
            element: layer.element,
            level: layer.level,
            i18n: layer.i18n,
            data: points,
            geojson,
            type: 'grades',
            rendering: layer.rendering,
        }
    }
}