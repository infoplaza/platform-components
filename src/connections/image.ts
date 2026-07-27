import FORECAST from '@/src/config/forecast'
import { loadTextureData, loadBytes, loadGrayscaleImage, loadVectorImage } from '@/src/_utils/texture-data'
import { MapLayer } from '@/@types/weather.types'
import Connection, { ConnectionConfig, resolveApiEnv } from './connection'
import { getImageUnscaleFromDatabounds, isRegionalModel } from '../_utils/image-unscale'

export default class ImageConnection extends Connection {
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
        return `${server}${layersPath}/{model}/{run}/{element}/{zoom}/{ne.lat}/{sw.lng}/{sw.lat}/{ne.lng}?outputtype=image{level}{unit}{member}{grayscale}`
    }

    resolveParams({ layer, modelInfo, layersInfo }: any) {
        return {
            model: layer?.model ?? modelInfo.slug,
            run: layersInfo.run,
            element: layer?.element ?? '',
            member: layersInfo.member ? layersInfo.member : '',
            level: layer?.level ?? layersInfo.level ?? '',
            unit: layer?.unit ?? '',
            grayscale: layer?.grayscale ?? false,
        }
    }

    resolveTimestamps({ layer }: any) {
        return layer.data?.layers?.map((l: any) => l.timestamp) ?? []
    }

    async getTextureData(textureLoadMode: string, url: string, layer: MapLayer, signal?: AbortSignal) {
        if (textureLoadMode === 'arrayBuffer') {
            return loadBytes(`${url}&bytes=true`, { signal })
        }

        if (layer.grayscale) {
            return loadGrayscaleImage(url, { signal })
        }

        if (layer.element?.includes('vector')) {
            return loadVectorImage(`${url}&quality=40`, { signal })
        }

        return loadTextureData(url, { signal })
    }

    addPalette (url: string, layer: MapLayer) {
        if (!layer.palette) {
            return url + `&format=webp`
        }

        return url + `&palette=${layer.palette}`
    }

    async getTextures(
        layer: MapLayer & { id: string },
        ts: number | undefined | null,
        textureLoadMode: string,
        options?: { signal?: AbortSignal },
    ) {
        const signal = options?.signal
        const data = layer.data as MapLayer['data']
        const bounds = layer.boundingBox
        const element = data?.element
        const layerData = data?.layers?.find((l) => Number(l.timestamp) === ts)
        if (!layerData?.url) {
            return undefined
        }

        const url = this.addPalette(`${layer.layersApi}${layerData?.url}`, layer)
        const [texture, serverPaletteImage] = await Promise.all([
            this.getTextureData(textureLoadMode, url, layer, signal),
            element?.palette?.png
                ? loadTextureData(`${layer.layersApi}${element.palette.png}`, { signal })
                : Promise.resolve(null),
        ])

        if (signal?.aborted) {
            return undefined
        }
        const boundingBox = [bounds?.west, bounds?.south, bounds?.east, bounds?.north]
        const legend = {
            unit: element?.unit,
            visualization: {
                databounds: element?.databounds,
                datalabels: element?.datalabels,
                colors: element?.visualization,
            },
        }

        const regionCategory = (data as { rundescription?: { region_category?: string } })?.rundescription?.region_category
        const imageUnscale = isRegionalModel(regionCategory)
            ? getImageUnscaleFromDatabounds(element?.databounds, { regional: true })
            : undefined

        // Multi-row legends (e.g. precipitation rate "/hr") interleave several
        // data rows into databounds/colors, so the server-rendered palette PNG
        // doesn't match the legend's full value range. Rebuild the palette
        // locally with all rows joined into one monotonic sequence.
        // const paletteImage = isMultiRowLegend(legend) && layer.grayscale
        //     ? (buildPaletteImageFromLegend(legend) ?? serverPaletteImage)
        //     : serverPaletteImage

        const paletteImage = serverPaletteImage
        return {
            id: layer.id,
            element: layer.element,
            level: layer.level,
            name: layer.name,
            bounds: boundingBox,
            image: texture,
            rendering: layer.rendering,
            isLogScale: data?.element?.isLogscale ?? false,
            isAlphaImage: layer.isAlphaImage ?? false,
            ...(!element?.composite ? { legend: legend } : {}),
            url,
            paletteImage,
            grayscale: layer.grayscale,
            settings: layer.settings,
            ...(imageUnscale ? { imageUnscale } : {}),
            pickable: layer.settings?.image?.pickable ?? true,
            preloadUrl: layerData?.url,
        }
    }
}
