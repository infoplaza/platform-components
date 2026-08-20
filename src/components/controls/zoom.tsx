import { GeolocateControl, NavigationControl } from "maplibre-gl"
import { useMap } from "react-map-gl/maplibre"
import { useEffect, useMemo, useRef } from "react"
import { twMerge } from "@/src/utilities/external/twMerge"

interface Experimental_MapControlZoomProps {
    multiMapCount: number
    mapIndex: number
}

const CONTROL_GROUP_CLASSES = [
    "maplibre-themed-control",
    "ip:bg-white/80",
    "ip:dark:bg-dark/80",
    "ip:backdrop-blur-md",
    "ip:rounded-lg",
    "ip:border",
    "ip:border-white/10",
    "ip:dark:border-white/10",
    "ip:shadow-none",
]

const CONTROL_BUTTON_CLASSES = [
    "ip:!bg-transparent",
    "ip:text-dark",
    "ip:dark:text-white",
    "ip:hover:!bg-primary/20",
    "ip:transition-colors",
    "ip:dark:fill-white",
]

export default function MapControlZoom({ multiMapCount, mapIndex }: Experimental_MapControlZoomProps) {
    const mapContext = useMap()
    const elRef = useRef<HTMLDivElement>(null)

    const hideControl = useMemo<boolean | undefined>(() => {
        if (multiMapCount === 1) {
            return false
        }

        if (multiMapCount === 2) {
            return mapIndex !== 1
        }

        if (multiMapCount === 4) {
            return mapIndex !== 3
        }
    }, [multiMapCount, mapIndex])

    useEffect(() => {
        const element = elRef.current
        const map = mapContext.current?.getMap()

        if (!element || !map || hideControl) {
            return
        }

        const navigationControl = new NavigationControl()
        const geolocateControl = new GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true,
            },
            trackUserLocation: true,
        })

        const navigationElement = navigationControl.onAdd(map)
        const geolocateElement = geolocateControl.onAdd(map)

        ;[navigationElement, geolocateElement].forEach((controlElement) => {
            controlElement.classList.add(...CONTROL_GROUP_CLASSES)

            controlElement.querySelectorAll("button").forEach((button) => {
                button.classList.add(...CONTROL_BUTTON_CLASSES)
            })
        })

        element.replaceChildren(navigationElement, geolocateElement)

        return () => {
            navigationControl.onRemove()
            geolocateControl.onRemove()
            element.replaceChildren()
        }
    }, [hideControl, mapContext])

    return (
        <div
            ref={elRef}
            className={twMerge(
                !hideControl && "ip:flex ip:flex-col ip:gap-1 ip:pointer-events-auto",
                hideControl && "ip:hidden"
            )}
        ></div>
    )
}
