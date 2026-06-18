import React from "react"
import DemandEventsProvider from "@/src/events/demand"

export type EventHandlerType = "simple" | "demand"

type MapEventsProviderProps = {
    handler?: EventHandlerType
    children: (mapComponents: any) => React.ReactNode
}

export default function MapEventsProvider({ handler = "simple", children }: MapEventsProviderProps) {
    return <DemandEventsProvider>{children}</DemandEventsProvider>
}


export { MapEventsProvider, DemandEventsProvider }