import React from "react"
// import { useSession } from "next-auth/react"

// ** Components Imports
import { IpCrown, IpLocationFavoritesIcon } from "@/src/components/icons"
import Tag from "@/src/components/tags/tag"

// ** Utils Imports
import { twMerge } from "@/src/utilities/external/twMerge"

// ** External Imports
// import Markdown from "react-markdown"
// import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline"

import type { ModelInfo } from "@/@types/weather.types"
import type { TransformedModel } from "@/@types/model.types"

interface ModelCardProps {
    item: TransformedModel
    groupSlug: string
    activeModel: string | null
    onModelChange: (slug: string) => void
    flyToModelBounds: (model: ModelInfo) => void
    onClose: () => void
    isFavorite: boolean
    onToggleFavorite: (slug: string) => void
    cleanView: boolean
}

const ModelCard = ({ item, groupSlug, activeModel, onModelChange, flyToModelBounds, onClose, isFavorite, onToggleFavorite, cleanView }: ModelCardProps) => {
    // const t = useTranslations()
    // const { data: session } = useSession()

    const isNowcast = groupSlug === "nowcast"
    const isActive = item.slug === activeModel
    const isBeta = item.beta

    return (
        <div className={twMerge(
            `ip:rounded-md ip:overflow-hidden ip:transition-all ip:px-3 ip:py-0 ip:relative ip:border ip:flex ip:flex-col`,
            // item.available ? "ip:hover:shadow-md ip:hover:-translate-y-1 ip:hover:bg-primary/10 ip:hover:border-primary/0" : "ip:opacity-40",
            isActive ? "ip:border-primary ip:dark:border-primary/20 ip:shadow-md ip:bg-primary/20" : "ip:bg-white ip:dark:bg-stone-700 ip:border-white ip:dark:border-stone-600",
            isBeta && "ip:bg-yellow-50 ip:dark:bg-yellow-900/20 ip:border-yellow-200 ip:dark:border-yellow-800/60",
            // isBeta && item.available && "ip:hover:bg-yellow-100 ip:hover:border-yellow-300 ip:dark:hover:bg-yellow-900/30 ip:dark:hover:border-yellow-800",
            isBeta && isActive && "ip:border-yellow-500 ip:dark:border-yellow-400/40 ip:bg-yellow-200/70 ip:dark:bg-yellow-900/40 ip:shadow-md",
        )}>
            <div className={twMerge("ip:grow ip:cursor-pointer", isNowcast ? "ip:content-center ip:sm:py-2 ip:py-1" : "ip:py-2")}
                onClick={() => {
                    onModelChange(item.slug)
                    // if (item.available === false) {
                    //     onClose()
                    //     return
                    // }
                    flyToModelBounds(item as any)
                    onClose()
                }}>

                <div className={`ip:flex ip:gap-2 ip:place-items-center`}>
                    <div className="ip:grow">
                        <div className="ip:flex ip:justify-between ip:items-center">
                            <div className={
                                twMerge(
                                    "ip:flex ip:gap-1.5 ip:text-xs ip:md:text-md ip:sm:text-sm ip:font-semibold ip:items-center ip:dark:text-gray-200",
                                    // item.premium && "text-gold",
                                    isActive && "ip:text-primary",
                                        isBeta && "ip:text-yellow-700 ip:dark:text-yellow-400",
                                    isBeta && isActive && "ip:text-yellow-700 ip:dark:text-yellow-300",
                                    isNowcast ? "ip:justify-center ip:text-center ip:sm:text-left ip:sm:justify-start" : "",
                                )
                            }>
                                {/* { item.premium && <IpCrown className="h-5 w-5" />} */}
                                { item.name}
                                { item.institute && (
                                    <span className="ip:relative ip:group ip:inline-flex"
                                        onClick={(e) => e.stopPropagation()}>
                                        {/* <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help" /> */}
                                        <span className="ip:pointer-events-none ip:absolute ip:left-1/2 ip:-translate-x-1/2 ip:top-full ip:mt-1 ip:z-20 ip:whitespace-nowrap ip:rounded-md ip:bg-white/90 ip:dark:bg-dark/90 ip:backdrop-blur-md ip:px-2 ip:py-1 ip:text-2xs ip:font-light ip:text-gray-700 ip:dark:text-gray-200 ip:shadow-md ip:opacity-0 ip:group-hover:opacity-100 ip:transition-opacity ip:duration-200">
                                            {item.institute}
                                        </span>
                                    </span>
                                )}
                            </div>
                            {/* {canUseFavorites && (
                                <button
                                    type="button"
                                    aria-label={isFavorite ? t('controls.removeFromFavorites') : t('controls.addToFavorites')}
                                    aria-pressed={isFavorite}
                                    className={twMerge(
                                        "shrink-0 p-1 rounded hover:text-primary dark:hover:text-primary transition-colors",
                                        isFavorite ? "text-primary hover:text-primary/50 dark:hover:text-primary/50" : "text-gray-400 dark:text-gray-500"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleFavorite(item.slug)
                                    }}
                                >
                                    <IpLocationFavoritesIcon className="h-4 w-4" filled={isFavorite} />
                                </button>
                            )} */}
                        </div>
                        {!cleanView && (
                            <div className={twMerge("ip:flex ip:flex-col ip:gap-2", isNowcast ? "ip:hidden ip:sm:flex" : "ip:flex")}>
                                {item.region && (
                                    <>
                                        <div className="ip:text-xs ip:text-gray-400 ip:sm:text-gray-500 ip:font-light ip:sm:font-normal">
                                            {item.region}
                                            <span className="ip:px-1.5">&bull;</span>
                                            {item.resolution}
                                            <span className="ip:px-1.5">&bull;</span>
                                            {/* {t('controls.runsPerDay', { count: item.description.runtimeshours?.map(r => `${r}z`).length ?? 0 })} */}
                                            {/* {item.version && (
                                                <>
                                                    <span className="ip:px-1.5">&bull;</span>
                                                    v{item.version}
                                                </>
                                            )} */}
                                        </div>
                                        <div className="ip:flex ip:flex-wrap ip:gap-2">
                                            {item.type && (
                                                <Tag className={twMerge(
                                                    "ip:text-2xs ip:font-light ip:bg-blue-400/10 ip:text-blue-400",
                                                    item.type === "AI" && "ip:bg-purple-400/10 ip:text-purple-400"
                                                )}>{item.type}</Tag>
                                            )}
                                            {item.category && <Tag className={twMerge("ip:text-2xs ip:font-light ip:text-gray-500 ip:dark:text-gray-400")}>{item.category}</Tag>}
                                            {isBeta && <Tag className="ip:bg-yellow-400/10 ip:text-yellow-500">Beta</Tag>}
                                            {/* {item.available === false && <Tag className="ip:bg-yellow-400/10 ip:text-gold">Pro</Tag>} */}
                                        </div>
                                    </>
                                )}

                                {/* {item.text_i18n && (
                                    <div className="text-2xs leading-4 text-gray-500 dark:text-gray-400">{ t(item.text_i18n) }</div>
                                )} */}
                                {/* {item.text && (
                                    <div className="text-gray-500 dark:text-gray-400 text-2xs leading-4">
                                        <Markdown>{ `${item.text}` }</Markdown>
                                    </div>
                                )} */}

                                {/* {item?.description?.note && (
                                    <div className="rounded-md bg-yellow-50 py-1 px-2 dark:bg-yellow-500/10 dark:outline dark:outline-1 dark:outline-yellow-500/15">
                                        <div className="flex">
                                            <div className="shrink-0">
                                                <ExclamationTriangleIcon aria-hidden="true" className="size-5 text-yellow-400 dark:text-yellow-300" />
                                            </div>
                                            <div className="ml-2">
                                                <div className="text-2xs text-yellow-700 dark:text-yellow-100/80">
                                                    <p>{ item.description.note }</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* {!cleanView && item.textLegal && (
                <div className="shrink-0 text-gray-500 dark:text-gray-700 prose dark:prose-invert text-3xs leading-3 bg-gray-100 dark:bg-dark-50 -mx-4 -mb-2 mt-2 px-4 py-2">
                    <Markdown>{ `${item.textLegal}` }</Markdown>
                </div>
            )} */}
        </div>
    )
}

export default ModelCard
