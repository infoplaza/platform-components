import React from "react"
import DemandEventsProvider from "@/src/events/handlers/demand"
import SimpleEventsProvider from "@/src/events/handlers/simple"
import NowcastEventsProvider from "@/src/events/handlers/nowcast"
import { useWeatherMap } from "@/src/providers/weather/weather"

export type EventHandlerType = "simple" | "demand" | "nowcast"

type MapEventsProviderProps = {
    handler?: EventHandlerType
    children: (mapComponents: any) => React.ReactNode
}

type EventProvider = (props: MapEventsProviderProps) => React.ReactNode

const EVENT_HANDLERS: Record<EventHandlerType, EventProvider> = {
    simple: SimpleEventsProvider,
    demand: DemandEventsProvider,
    nowcast: NowcastEventsProvider,
}

const DEFAULT_HANDLER: EventHandlerType = "demand"
const DEMAND_MODEL_TYPES = ["nowcast", "tropicalweather", "grades"]
const SIMPLE_ELEMENT_SLUGS = ["observations"]
const GLOBAL_REGION_CATEGORY = "global"

type ResolveContext = {
    modelType?: string
    elementSlug?: string
    regionCategory?: string
}

type HandlerRule = {
    handler: EventHandlerType
    match: (context: ResolveContext) => boolean
}

const HANDLER_RULES: HandlerRule[] = [
    {
        handler: "nowcast",
        match: ({ modelType }) => modelType === "nowcast",
    },
    {
        handler: "simple",
        match: ({ regionCategory }) => Boolean(regionCategory) && regionCategory !== GLOBAL_REGION_CATEGORY,
    },
    {
        handler: "simple",
        match: ({ elementSlug }) =>
            Boolean(elementSlug && SIMPLE_ELEMENT_SLUGS.includes(elementSlug)),
    },
    {
        handler: "demand",
        match: ({ modelType, regionCategory }) =>
            regionCategory === GLOBAL_REGION_CATEGORY ||
            Boolean(modelType && DEMAND_MODEL_TYPES.includes(modelType)),
    },
]

function resolveHandler(context: ResolveContext): EventHandlerType {
    return HANDLER_RULES.find((rule) => rule.match(context))?.handler ?? DEFAULT_HANDLER
}

export function useEventHandlerType(override?: EventHandlerType): EventHandlerType {
    const { modelInfo, elementInfo } = useWeatherMap()

    return override ?? resolveHandler({
        modelType: modelInfo?.format,
        elementSlug: elementInfo?.slug,
        regionCategory: modelInfo?.regionCategory,
    })
}

export default function MapEventsProvider({ handler, children }: MapEventsProviderProps) {
    const resolvedHandler = useEventHandlerType(handler)
    const Provider = EVENT_HANDLERS[resolvedHandler] ?? EVENT_HANDLERS[DEFAULT_HANDLER]
    return <Provider>{children}</Provider>
}

export {
    MapEventsProvider,
    DemandEventsProvider,
    SimpleEventsProvider,
    NowcastEventsProvider,
}
