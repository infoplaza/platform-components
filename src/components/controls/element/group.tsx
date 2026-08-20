import React, { useMemo, useState } from "react"

// ** Components Imports
import ElementCard from "./card"
import ModelGroupHeader from "@/src/components/controls/models/header"

// ** Utils Imports
import { twMerge } from "@/src/utilities/external/twMerge"

// ** Type Imports
import type { ElementGroup } from "@/@types/weather.types"
import type { ElementCardItem, ElementCardModel } from "./card"

type ElementGroupState = Omit<ElementGroup, "items"> & {
    i18n?: string
    items: ElementCardItem[]
}

interface ElementGroupProps {
    group: ElementGroupState
    activeModel: ElementCardModel
    searchElement: string
    activeElement: string
    onChangeHandler: (item: ElementCardItem) => void
    isFavorite: (slug: string) => boolean
    onToggleFavorite: (slug: string) => void
    cleanView: boolean
}

const ElementGroup = ({ group, activeModel, searchElement, activeElement, onChangeHandler, isFavorite, onToggleFavorite, cleanView }: ElementGroupProps) => {
    const [ expanded, setExpanded ] = useState(true)

    const filteredItems = useMemo(() => {
        const lowerSearch = searchElement.trim().toLowerCase()

        if (!lowerSearch) {
            return group.items
        }

        return group.items.filter((item) => {
            const title = item.name ?? ""
            const description = item.description ?? ""

            return [ title, description, item.slug ].some(field => field.toLowerCase().includes(lowerSearch))
        })
    }, [ group.items, searchElement ])

    if (filteredItems.length === 0) {
        return null
    }

    return (
        <div>
            <ModelGroupHeader
                title={group.name}
                count={filteredItems.length}
                countLabel="layers"
                expanded={expanded}
                onToggle={() => setExpanded(prev => !prev)}
            />

            <div
                aria-hidden={!expanded}
                className={twMerge(
                    "ip:grid ip:transition-all ip:duration-300 ip:ease-in-out ip:bg-cloud-500 ip:dark:bg-stone-700/30 ip:rounded-b-md",
                    expanded ? "ip:grid-rows-[1fr] ip:opacity-100" : "ip:grid-rows-[0fr] ip:opacity-0"
                )}
            >
                <div className={expanded ? "ip:overflow-visible" : "ip:overflow-hidden"}>
                    <div className="ip:grid ip:grid-cols-2 ip:sm:grid-cols-2 ip:md:grid-cols-3 ip:gap-3 ip:md:gap-4 ip:dark:text-gray-300 ip:mt-4 ip:p-3">
                        {filteredItems.map((item) => (
                            <ElementCard
                                key={item.slug}
                                item={item}
                                activeModel={activeModel}
                                activeElement={activeElement}
                                onChangeHandler={onChangeHandler}
                                isFavorite={isFavorite(item.slug)}
                                onToggleFavorite={onToggleFavorite}
                                cleanView={cleanView}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ElementGroup
