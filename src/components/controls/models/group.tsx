import React, { useMemo, useState } from "react"

// ** Components Imports
import ModelCard from "./card"
import ModelGroupHeader from "./header"

// ** Utils Imports
import { twMerge } from "@/src/utilities/external/twMerge"

import type { ModelInfo } from "@/@types/weather.types"
import type { ModelGroupState } from "../model"
import { TransformedModel } from "@/@types/model.types"

interface ModelGroupProps {
    group: ModelGroupState
    searchModel: string
    typeFilter: string
    categoryFilter: string
    activeModel: string | null
    onModelChange: (slug: string) => void
    flyToModelBounds: (model: ModelInfo) => void
    onClose: () => void
    isFavorite: (slug: string) => boolean
    onToggleFavorite: (slug: string) => void
    cleanView: boolean
}

const ModelGroup = ({
    group,
    searchModel,
    typeFilter,
    categoryFilter,
    activeModel,
    onModelChange,
    flyToModelBounds,
    onClose,
    isFavorite,
    onToggleFavorite,
    cleanView
}: ModelGroupProps) => {
    const [ expanded, setExpanded ] = useState(true)

    const filteredModels = useMemo(() => {
        const lowerSearch = searchModel.trim().toLowerCase()
        const hasTypeFilter = typeFilter.trim() !== ""
        const hasCategoryFilter = categoryFilter.trim() !== ""

        return group.models.filter((item: any) => {
            const title = item.name ?? ""
            const institute = item.institute ?? ""
            const region = item.region ?? ""
            const matchesSearch = lowerSearch
                ? [ title, institute, region, item.slug ]
                    .some((field) => field?.toLowerCase().includes(lowerSearch))
                : true
            const matchesType = hasTypeFilter
                ? (item.type ?? "").toLowerCase() === typeFilter.toLowerCase()
                : true
            const matchesCategory = hasCategoryFilter
                ? (item.category ?? "").toLowerCase() === categoryFilter.toLowerCase()
                : true

            return matchesSearch && matchesType && matchesCategory
        })
    }, [ group.models, searchModel, typeFilter, categoryFilter ])

    if (filteredModels.length === 0) {
        return null
    }

    return (
        <div>
            <ModelGroupHeader
                title={group.title}
                count={filteredModels.length}
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
                    <div className={twMerge("ip:grid ip:gap-4 ip:mt-4 ip:p-3", group.slug === "nowcast" ? "ip:grid-cols-3" : "ip:grid-cols-1 ip:md:grid-cols-2 ip:lg:grid-cols-3")}>
                        {filteredModels.map((item, itemIndex) => (
                            <ModelCard
                                key={`map-control-model-group-${group.slug}-${itemIndex}`}
                                item={item as any}
                                groupSlug={group.slug}
                                activeModel={activeModel}
                                onModelChange={onModelChange}
                                flyToModelBounds={flyToModelBounds}
                                onClose={onClose}
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

export default ModelGroup
