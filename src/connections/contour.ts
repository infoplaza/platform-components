import FORECAST from '@/src/config/forecast'
import { loadJson } from '@/src/_utils/texture-data'
import { MapLayer } from '@/@types/weather.types'
import Connection, { ConnectionConfig, resolveApiEnv } from './connection'

export default class ContourConnection extends Connection {
    constructor(config: ConnectionConfig) {
        super()
        this.config = {
            apiEnv: resolveApiEnv(config.apiEnv),
        }
    }

    get server(): string | null {
        return FORECAST.endpoint[this.config.apiEnv]?.server ?? null
    }

    get layers(): string {
        return FORECAST.endpoint[this.config.apiEnv]?.layers ?? ''
    }

    getTemplateUrl(): string {
        const { apiEnv } = this.config
        const server = FORECAST.endpoint[apiEnv].server
        const layersPath = FORECAST.endpoint[apiEnv].layers
        return `${server}${layersPath}/{model}/{run}/{element}/{zoom}/{ne.lat}/{sw.lng}/{sw.lat}/{ne.lng}?outputtype=contours{level}{unit}{member}`
    }

    resolveParams({ layer, modelInfo, layersInfo }: any) {
        return {
            model: layer?.model ?? modelInfo.slug,
            run: layersInfo.run,
            element: layer?.element ?? '',
            member: layersInfo.member ? layersInfo.member : '',
            level: layer?.level ?? layersInfo.level ?? '',
            unit: layer?.unit ?? '',
        }
    }

    resolveTimestamps({ layer }: any) {
        return layer.data?.layers?.map((l: { timestamp: unknown }) => l.timestamp) ?? []
    }

    async getTextures(
        layer: MapLayer & { id: string },
        ts: number | undefined | null,
        _textureLoadMode: string,
        options?: { signal?: AbortSignal },
    ) {
        const signal = options?.signal
        const data = layer.data as MapLayer['data']
        const layerData = data?.layers?.find((l) => Number(l.timestamp) === ts)
        if (!layerData?.url) {
            return undefined
        }

        const configuredInterval = layer.settings?.contourGeoJson?.contourGeoJsonInterval
        const safeInterval = typeof configuredInterval === 'number' && Number.isFinite(configuredInterval)
            ? configuredInterval
            : 1
        const contourInterval = Math.max(1, Math.min(10, Math.round(safeInterval)))
        const url = `${layer.layersApi}${layerData.url}&smoothing_algorithm=taubin_smooth&smoothing_factor=0.30000000000000004&blur_algorithm=averaging&blur_radius=30&contourinterval=${contourInterval}`
        const geojson = await loadJson(url, { signal })

        if (signal?.aborted) {
            return undefined
        }

        return {
            ...layer,
            id: layer.id,
            rendering: layer.rendering,
            data: geojson,
            preloadUrl: layerData.url,
        }
    }
}
