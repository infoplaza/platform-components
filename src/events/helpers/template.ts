import type { LayerInfo } from "@/@types/weather.types"
import type Connection from "@/src/connections/connection"
import type { NowcastLayer } from "@/@types/nowcast-layer.types";
import type { Layer } from "@/@types/layer.types";

export type LayersTemplateContext = {
    modelInfo: { type?: string; slug?: string }
    layersInfo: {
        run?: string
        member?: string
        level?: string
    }
    modelApi: unknown
    nowcastApi: unknown
}

function addPaletteToLayersUrl(layersUrl: string, layer: LayerInfo | Layer | NowcastLayer) {
    const palette = layer.palette
    if (!palette) {
        return layersUrl
    }
    return layersUrl + `&palette=${palette}`
}

const LAYERS_TEMPLATE_REPLACEMENTS: {
    token: string
    resolve: (layer: LayerInfo | Layer | NowcastLayer, ctx: LayersTemplateContext) => string
}[] = [
    {
        token: '{model}',
        resolve: (layer, ctx) => String(('model' in layer && layer.model) || ctx.modelInfo.slug || ''),
    },
    {
        token: '{run}',
        resolve: (_, ctx) => String(ctx.layersInfo.run ?? ''),
    },
    {
        token: '{period}',
        resolve: (layer) => String(('period' in layer && layer.period) ?? ''),
    },
    {
        token: '{element}',
        resolve: (layer) => String(layer.element ?? ''),
    },
    {
        token: '{member}',
        resolve: (_, ctx) =>
            ctx.layersInfo.member ? `&member=${ctx.layersInfo.member}` : '',
    },
    {
        token: '{level}',
        resolve: (layer, ctx) => {
            const level = layer.level || ctx.layersInfo.level
            return level ? `&level=${level}` : ''
        },
    },
    {
        token: '{unit}',
        resolve: (layer) =>
            layer.unit ? `&unit=${encodeURIComponent(String(layer.unit))}` : '',
    },
    {
        token: '{grayscale}',
        resolve: (layer) =>
            layer.grayscale === undefined || layer.grayscale === null ? '' : `&grayscale=${layer.grayscale}`,
    },
]

export function buildLayersTemplateUrl(connection: Connection, layer: LayerInfo | Layer | NowcastLayer, ctx: LayersTemplateContext) {
    let url = connection.getTemplateUrl()

    for (const { token, resolve } of LAYERS_TEMPLATE_REPLACEMENTS) {
        url = url.replace(token, resolve(layer, ctx))
    }
    return addPaletteToLayersUrl(url, layer)
}
