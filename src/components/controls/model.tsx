import React, { useCallback, useEffect, useMemo, useState } from "react"
// import { DialogTitle } from '@headlessui/react'
import { useMap } from 'react-map-gl/maplibre'

import DropdownControl, { DropdownItem } from "@/src/components/forms/dropdown"
import { useWeatherMap } from "@/src/providers/weather/weather"
// import { useMapIndex } from "@/src/redux/maps"
// import { useSettings } from "@/src/providers/settings/settings"

import ModelModal from "@/src/components/controls/models/modal"
import ModalDialog from '@/src/components/modals/dialog'
// import useFavoriteModels from "@/src/hooks/useFavoriteModels"
import type { ModelInfo } from "@/@types/weather.types"
import type { TransformedModel } from "@/@types/model.types"
// import NowcastModal, { OtherModelGroupState } from "@/components/_webgl/controls/models/more/nowcastModal"

export const FAVORITES_GROUP_SLUG = "favorites"
export interface ModelGroupState {
    slug: string
    i18n: string | null
    title: string
    sort: number
    type?: string
    models: ModelInfo[]
}

// const getOtherModelGroups = (otherModels: ForecastModel[]): OtherModelGroupState[] => {
//     const groups: OtherModelGroupState[] = []

//     otherModels.forEach((m: ForecastModel) => {
//         const groupSlug = m.group?.slug ?? "default"
//         const group = groups.find(g => g.slug == groupSlug)
//         if (group) {
//             group.items.push(m)
//         } else {
//             groups.push({
//                 slug: groupSlug,
//                 i18n: m.group?.i18n ?? null,
//                 title: m.group?.title ?? "",
//                 sort: m.group?.sort ?? groups.length + 1,
//                 items: [ m ]
//             })
//         }
//     })

//     groups.sort((a, b) => a.sort > b.sort ? 1 : -1)

//     return groups
// }

interface MapControlModelProps {
    maxItems?: number
    small?: boolean
    models: TransformedModel[]
    isMultipleMapView?: boolean
}

export default function MapControlModel({ maxItems = 3, small = false, models = [], isMultipleMapView = false }: MapControlModelProps) {
    const mapContext = useMap()
    
    const { model, setModel } = useWeatherMap()
    // const mapIndex = useMapIndex()
    // const { multiMapModelSelectionBehavior, setConfigs, setMultiMapModelSelectionBehavior } = useSettings()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    // const [isOtherModelsOpen, setIsOtherModelsOpen] = useState<boolean>(false)
    // const [openModelPrompt, setOpenModelPrompt] = useState<boolean>(false)
    // const [pendingModelSelection, setPendingModelSelection] = useState<string | null>(null)
    // const [rememberModelPromptChoice, setRememberModelPromptChoice] = useState<boolean>(false)
    // const { favorites, isFavorite, toggleFavorite } = useFavoriteModels()
    const favorites: string[] = []

    const forecastModels = useMemo(() => {
        return models
    }, [ models ])

    // const otherModels = useMemo(() => {
    //     return models.filter(m => m.type !== 'forecast')
    // }, [ models ])

    // const otherModelItems = useMemo(() => {
    //     return models.filter(m => m.type !== 'forecast').map(item => {
    //         return { 
    //             value: item.slug,
    //             title: item.title ?? (item.slug),
    //             active: item.slug === model 
    //         }
    //     })
    // }, [ models, model])

    // const otherModelGroups = useMemo((): OtherModelGroupState[] => {
    //     return getOtherModelGroups(otherModels)
    // }, [ otherModels ])

    const modelItems: DropdownItem[] = useMemo(() => {
        return forecastModels.map(item => {
            return { 
                value: item.slug,
                title: item.name ?? (item.slug),
                active: item.slug === model 
            }
        }) 
    }, [ forecastModels, model ])

    const modelGroups = useMemo((): ModelGroupState[] => {
        if (!forecastModels) {
            return []
        }
        const favoritesLookup = new Set(favorites)
        const groups: ModelGroupState[] = []
        forecastModels.forEach((m: TransformedModel) => {
            // Favorited models live exclusively in the Favorites group below.
            if (favoritesLookup.has(m.slug)) {
                return
            }
            const group = groups.find(g => g.slug == (m.regionCategory ?? 'default'))
            if (group) {
                group.models.push(m as any)
            } else {
                groups.push({
                    slug: m.regionCategory ?? 'default',
                    i18n: m.regionCategory ?? null,
                    title: m.regionCategory ?? '',
                    sort: groups.length + 1,                    
                    models: [ m as any ]
                })
            }
        })
        groups.sort((a, b) => a.sort > b.sort ? 1 : -1)

        const favoriteModels = favorites
            .map(slug => forecastModels.find(m => m.slug === slug))
            .filter((m): m is TransformedModel => Boolean(m))

        if (favoriteModels.length > 0) {
            groups.unshift({
                slug: FAVORITES_GROUP_SLUG,
                i18n: 'controls.favorites',
                title: 'Favorites',
                sort: 0,
                models: favoriteModels as any
            })
        }

        return groups
    }, [ forecastModels, favorites ])

    const blurActiveElement = (): void => {
        if (typeof document === 'undefined') {
            return
        }

        const activeElement = document.activeElement
        if (activeElement instanceof HTMLElement) {
            activeElement.blur()
        }
    }

    // const closeModelPromptDialog = (): void => {
    //     blurActiveElement()
    //     setRememberModelPromptChoice(false)
    //     setPendingModelSelection(null)
    //     setOpenModelPrompt(false)
    // }

    const applyModelToAllMaps = useCallback((selectedModelSlug: string): void => {
        // setConfigs((prevConfigs: any[]) => {
        //     return (prevConfigs ?? []).map((config) => ({
        //         ...config,
        //         model: selectedModelSlug,
        //     }))
        // })
        setModel(selectedModelSlug)
    }, [ setModel ])

    const applyModelToCurrentMap = useCallback((selectedModelSlug: string): void => {
        // setConfigs((prevConfigs: any[]) => {
        //     const next = [ ...(prevConfigs ?? []) ]
        //     next[mapIndex] = {
        //         ...(next[mapIndex] ?? {}),
        //         model: selectedModelSlug,
        //     }
        //     return next
        // })
        setModel(selectedModelSlug)
    }, [  setModel ])

    const onModelChange = useCallback((val: string | number): void => {
        const selectedModelSlug = val as string
        const changingModel = model !== selectedModelSlug

        // if (isMultipleMapView && changingModel) {
        //     if (multiMapModelSelectionBehavior === 'all-maps') {
        //         applyModelToAllMaps(selectedModelSlug)
        //         return
        //     }

        //     if (multiMapModelSelectionBehavior === 'current-map') {
        //         applyModelToCurrentMap(selectedModelSlug)
        //         return
        //     }

        //     // Avoid stacked headlessui dialogs fighting over focus/aria-hidden.
        //     setIsOpen(false)
        //     setIsOtherModelsOpen(false)
        //     setPendingModelSelection(selectedModelSlug)
        //     setOpenModelPrompt(true)
        //     return
        // }

        setModel(selectedModelSlug)
    }, [ applyModelToAllMaps, applyModelToCurrentMap, isMultipleMapView, model, setModel ])

    // const handleApplyModelToAllMapsConfirm = useCallback((): void => {
    //     if (!pendingModelSelection) {
    //         closeModelPromptDialog()
    //         return
    //     }
    //     if (rememberModelPromptChoice) {
    //         setMultiMapModelSelectionBehavior('all-maps')
    //     }
    //     applyModelToAllMaps(pendingModelSelection)
    //     closeModelPromptDialog()
    // }, [ applyModelToAllMaps, pendingModelSelection, rememberModelPromptChoice, setMultiMapModelSelectionBehavior ])

    // const handleApplyModelCurrentMapOnly = useCallback((): void => {
    //     if (!pendingModelSelection) {
    //         closeModelPromptDialog()
    //         return
    //     }
    //     if (rememberModelPromptChoice) {
    //         setMultiMapModelSelectionBehavior('current-map')
    //     }
    //     applyModelToCurrentMap(pendingModelSelection)
    //     closeModelPromptDialog()
    // }, [ applyModelToCurrentMap, pendingModelSelection, rememberModelPromptChoice, setMultiMapModelSelectionBehavior ])

    const flyToModelBounds = (model: any) => {
        if (!mapContext.current || !model || model.type !== 'forecast') {   
            return
        }

        if (model.description?.region && model.description.region.toLowerCase() === 'global') {
            return
        }

        const boundingBox = model.boundingbox || model.description?.boundingbox
        const maxZoom = model.maxzoom || model.description?.maxzoom || 4

        if (!boundingBox) {
            console.warn('Model does not have a valid bounding box:', model)
            return
        }

        const centerLng = (boundingBox.west + boundingBox.east) / 2
        const centerLat = (boundingBox.south + boundingBox.north) / 2
        const zoom = maxZoom / 1.4

        mapContext.current.flyTo({
            center: [centerLng, centerLat],
            zoom,
            duration: 2000
        })
    }

    if (modelItems.length === 0) {
        return null
    }
    
    return (
        <div>
            <div className="ip:pointer-events-auto">
                <div className="ip:flex ip:flex-col ip:gap-1 ip:items-start">
                    {/* <DropdownControl
                        items={otherModelItems}
                        minItems={0}
                        small={small}
                        maxItems={maxItems - 1}
                        onChange={(val) => onModelChange(val)}
                        onMore={() => setIsOtherModelsOpen(true)}
                        className="backdrop-blur-md bg-white/80 dark:bg-dark/80 border border-white/10" 
                    /> */}
                    <DropdownControl 
                        items={modelItems}
                        minItems={0}
                        small={small}
                        maxItems={maxItems}
                        onChange={(val) => onModelChange(val)}
                        onMore={() => setIsOpen(true)} 
                        className="ip:backdrop-blur-md ip:bg-white/80 ip:dark:bg-dark/80 ip:border ip:border-white/10" 
                    />
                </div>
            </div>

            {/* <NowcastModal
                open={isOtherModelsOpen}
                onClose={() => setIsOtherModelsOpen(false)}
                modelGroups={otherModelGroups}
                activeModel={model ?? null}
                onModelChange={onModelChange}
                flyToModelBounds={flyToModelBounds}
            /> */}

            <ModelModal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                modelGroups={modelGroups as any}
                activeModel={model ?? null}
                onModelChange={(slug) => {
                    onModelChange(slug)
                    setIsOpen(false)
                }}
                flyToModelBounds={flyToModelBounds}
                // isFavorite={isFavorite}
                // onToggleFavorite={toggleFavorite}
            />

            {/* <ModalDialog
                open={openModelPrompt}
                onClose={closeModelPromptDialog}
                width="max-w-md w-full bg-white dark:bg-dark sm:mt-[12vh] mt-[25vh] mb-4">
                <div>
                    <DialogTitle as="h3" className="text-lg font-semibold text-dark dark:text-white">
                        {t('controls.multiMap.applyModelTitle')}
                    </DialogTitle>
                    <p className="mt-2 text-sm text-gray-700 dark:text-white/70">
                        {t('controls.multiMap.applyModelDescription')}
                    </p>
                </div>
                <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-white/70">
                    <input
                        type="checkbox"
                        checked={rememberModelPromptChoice}
                        onChange={(event) => setRememberModelPromptChoice(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/60 dark:border-white/20 dark:bg-white/5"
                    />
                    {t('controls.multiMap.rememberSelection')}
                </label>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleApplyModelCurrentMapOnly}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                        {t('app.no')}
                    </button>
                    <button
                        type="button"
                        onClick={handleApplyModelToAllMapsConfirm}
                        className="inline-flex items-center justify-center rounded-md border border-primary/30 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                        {t('app.yes')}
                    </button>
                </div>
            </ModalDialog> */}
        </div>
    )
}
