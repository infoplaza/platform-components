import React from "react"

// ** Components Imports
// import IconElement, { IconElementData } from "@/components/icon/element"
// import LayerIcon from "@/components/icon/layer-line"
// import IpLocationFavoritesIcon from "@/components/icon/location-favorites"
import { IpPercentageIcon } from "@/src/components/icons"
import Tag from "@/src/components/tags/tag"
// import TagPro from "@/src/components/tags/pro"
import IconElement, { IconElementData } from "@/src/components/controls/element/icons"

// ** Utils Imports
import { twMerge } from "@/src/utilities/external/twMerge"

// ** Type Imports
import type { ElementInfo, ModelInfo } from "@/@types/weather.types"

export type ElementCardItem = ElementInfo & {
    members?: string[]
    isMixedLayers?: boolean
    uniqueElements?: string[]
}

export type ElementCardModel = ModelInfo & {
    elements?: Record<string, { name: string }>
}

interface ElementCardProps {
    item: ElementCardItem
    activeModel: ElementCardModel
    activeElement: string
    onChangeHandler: (item: ElementCardItem) => void
    isFavorite: boolean
    onToggleFavorite: (slug: string) => void
    cleanView: boolean
}

const ElementCard = ({ item, activeModel, activeElement, onChangeHandler, isFavorite, onToggleFavorite, cleanView }: ElementCardProps) => {
    const isActive = item.slug === activeElement
    const isAvailable = item.available !== false
    const probabilityElements = item.members?.includes("probabilities")

    return (
        <div
            className={twMerge(
                "ip:rounded-md ip:overflow-hidden ip:transition-all ip:px-3 ip:py-0 ip:relative ip:border ip:flex ip:flex-col ip:cursor-pointer",
                isAvailable ? "ip:hover:shadow-md ip:hover:-translate-y-1 ip:hover:bg-primary/10 ip:hover:border-primary/0" : "ip:opacity-40",
                isActive ? "ip:border-primary ip:dark:border-primary/20 ip:shadow-md ip:bg-primary/20" : "ip:bg-white ip:dark:bg-stone-700 ip:border-white ip:dark:border-stone-600",
            )}
            onClick={() => onChangeHandler(item)}
        >
            <div className="ip:grow ip:py-2">
                <div className="ip:flex ip:gap-2">
                    <div className="ip:shrink-0 ip:w-6 ip:h-6 ip:relative ip:flex ip:items-start">
                        <IconElement
                            data={item as unknown as IconElementData}
                            iconClass={twMerge(isActive && "ip:text-primary ip:fill-primary")}
                        />
                    </div>

                    <div className="ip:grow ip:min-w-0">
                        <div className={twMerge(
                            "ip:flex ip:gap-1.5 ip:text-xs ip:md:text-md ip:sm:text-sm ip:font-semibold ip:items-center ip:dark:text-gray-200",
                            isActive && "ip:text-primary"
                        )}>
                            <span className="ip:truncate">
                                {item.name}
                            </span>
                        </div>

                        {!cleanView && item.isMixedLayers && (
                            <div className="ip:leading-none">
                                <span className="ip:font-light ip:text-2xs ip:text-gray-400 ip:dark:text-gray-400">
                                    {item.uniqueElements?.map(element => activeModel.elements?.[element]?.name ?? element).join(", ")}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="ip:flex ip:shrink-0 ip:gap-2">
                        {!cleanView && probabilityElements && (
                            <div title="Probability Element">
                                <IpPercentageIcon className="ip:size-4 ip:fill-gray-500 ip:dark:fill-gray-400" />
                            </div>
                        )}
                        {/* {item.isMixedLayers && (
                            <div title="Mixed Layers">
                                <LayerIcon className="size-4" />
                            </div>
                        )} */}
                        {/* {!cleanView && item.available === true && (
                            <div className="h-6 md:h-7">
                                <TagPro small={true} />
                            </div>
                        )} */}
                        {/* {canUseFavorites && (
                            <div title="Favorite">
                                <button
                                    type="button"
                                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                    aria-pressed={isFavorite}
                                    className={twMerge(
                                        "shrink-0 p-1 -m-1 rounded hover:text-primary dark:hover:text-primary transition-colors",
                                        isFavorite ? "text-primary hover:text-primary/50 dark:hover:text-primary/50" : "text-gray-400 dark:text-gray-500"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleFavorite(item.slug)
                                    }}
                                >
                                    <IpLocationFavoritesIcon className="h-4 w-4" filled={isFavorite} />
                                </button>
                            </div>
                        )} */}
                    </div>
                </div>

                {!cleanView && (
                    <div className="ip:flex ip:flex-wrap ip:gap-1 ip:pt-2">
                        {item.levels?.slice(0, 2)?.map((level) => (
                            <Tag key={level} className={twMerge("ip:text-2xs ip:px-1 ip:text-gray-500")}>
                                {level}
                            </Tag>
                        ))}
                        {item.levels && item.levels.length > 2 && (
                            <Tag className={twMerge("ip:text-2xs ip:px-1 ip:text-gray-500")}>
                                {item.levels.length - 2} more
                            </Tag>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ElementCard
