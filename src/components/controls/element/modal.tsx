// ** Framework Imports
import React, { useMemo, useState } from "react"

// ** Components Imports
import * as ElementGroupModule from '@/src/components/controls/element/group'
import ElementFilter from '@/src/components/controls/element/filter'
import ModalDialog from '@/src/components/modals/dialog'

// ** Utils Imports
import { useStorageState } from "@/src/utilities/storageState"

// ** External Imports
import { DialogTitle } from "@headlessui/react"
import ExpandIcon from "@/src/components/icons/expand"

import type { ElementGroup as WeatherElementGroup, ModelInfo } from "@/@types/weather.types"
import type { ElementCardItem } from "./card"

const FAVORITES_GROUP_NAME = "Favorites"

type ElementGroupState = Omit<WeatherElementGroup, "items"> & {
    i18n?: string
    items: ElementCardItem[]
}
const MapControlElementGroup = ElementGroupModule.default

interface ElementModalProps {
    open: boolean
    onClose: () => void
    activeModel: ModelInfo
    onChangeHandler: (item: any) => void
    activeElement: string
    favorites?: string[]
    isFavorite?: (slug: string) => boolean
    onToggleFavorite?: (slug: string) => void
}

const ElementModal = ({
    open,
    onClose,
    activeModel,
    onChangeHandler,
    activeElement,
    favorites = [],
    isFavorite = () => false,
    onToggleFavorite = () => {}
}: ElementModalProps) => {
    const [ searchElement, setSearchElement ] = useState('')
    const [ cleanView, setCleanView ] = useStorageState<boolean>("element-modal-clean-view", false)

    const elementGroups = useMemo((): ElementGroupState[] => {
        const favoritesLookup = new Set(favorites)
        const groups: ElementGroupState[] = activeModel.elementGroups.map(group => ({
            ...group,
            items: (group.items as ElementCardItem[]).filter(item => !favoritesLookup.has(item.slug))
        }))

        const allElements = activeModel.elementGroups.flatMap(group => group.items as ElementCardItem[])
        const favoriteElements = favorites
            .map(slug => allElements.find(item => item.slug === slug))
            .filter((item): item is ElementCardItem => Boolean(item))

        if (favoriteElements.length > 0) {
            groups.unshift({
                name: FAVORITES_GROUP_NAME,
                i18n: undefined,
                items: favoriteElements
            })
        }

        return groups
    }, [ activeModel.elementGroups, favorites ])

    return (
        <ModalDialog open={open} onClose={onClose} width={'ip:max-w-5xl ip:w-full ip:bg-cloud ip:dark:bg-dark ip:sm:mt-[10vh] ip:mt-[30vh] ip:mb-4'}>
            <DialogTitle as="h3" className="ip:flex ip:items-center ip:gap-2 ip:text-lg ip:font-bold ip:sm:font-medium ip:text-dark ip:dark:text-white">
                <span>Element Layers</span>
                <span className="ip:absolute ip:top-4 ip:right-12 ip:z-100 ip:hover:bg-primary/20 ip:p-0.5 ip:rounded-md">
                    <a href={`/models/${activeModel.slug}`} className="ip:rounded-md ip:text-dark/50 ip:dark:text-white/50  ip:focus:outline-none">
                        <ExpandIcon className="ip:size-[22px]" />
                    </a>
                </span>
                {/* <Link href={`/models/${activeModel.slug}`} className="flex gap-1 items-center ml-2 text-2xs font-light text-primary dark:text-gray-400 cursor-pointer">
                    Expand
                    <svg className="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 5H8.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C5 6.52 5 7.08 5 8.2v7.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.427.218.987.218 2.105.218h7.606c1.118 0 1.677 0 2.104-.218c.377-.192.683-.498.875-.874c.218-.428.218-.987.218-2.105V14m1-5V4m0 0h-5m5 0l-7 7"/></svg>
                </Link> */}
            </DialogTitle>
            <div className="">
                <div className="ip:sm:flex ip:items-center ip:justify-end ip:gap-2 ip:hidden">
                    <ElementFilter
                        value={searchElement}
                        onChange={setSearchElement}
                        placeholder="Search"
                        cleanView={cleanView}
                        onCleanViewChange={setCleanView}
                    />
                </div>
                <div className="ip:mt-4 ip:flex ip:flex-col ip:gap-4">
                    {elementGroups.map((group, groupIndex) => (
                        <MapControlElementGroup
                            key={`map-control-element-group-${group.name}-${groupIndex}`}
                            group={group}
                            activeModel={activeModel}
                            searchElement={searchElement}
                            activeElement={activeElement}
                            onChangeHandler={onChangeHandler}
                            isFavorite={isFavorite}
                            onToggleFavorite={onToggleFavorite}
                            cleanView={cleanView}
                        />
                    ))}
                </div>
            </div>
        </ModalDialog>
    )
}

export default ElementModal