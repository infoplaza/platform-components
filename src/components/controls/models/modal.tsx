import React, { useMemo, useState } from "react"

// ** Components Imports
import ModalDialog from "@/src/components/modals/dialog"
import { IpExpandIcon } from "@/src/components/icons"
import ModelFilter from "./filter"
import ModelGroup from "./group"

// ** Utils Imports
import { useStorageState } from "@/src/utilities/storageState"

// ** External Imports
import { DialogTitle } from "@headlessui/react"

import type { ModelInfo } from '@/@types/weather.types'
import type { ModelGroupState } from "../model"
import Link from "next/link"


interface ModelModalProps {
    open: boolean
    onClose: () => void
    modelGroups: ModelGroupState[]
    activeModel: string | null
    onModelChange: (slug: string) => void
    flyToModelBounds: (model: ModelInfo) => void
    isFavorite?: (slug: string) => boolean
    onToggleFavorite?: (slug: string) => void
}

const ModelModal = ({ open, onClose, modelGroups, activeModel, onModelChange, flyToModelBounds, isFavorite, onToggleFavorite }: ModelModalProps) => {
    const [ searchModel, setSearchModel ] = useState("")
    const [ typeFilter, setTypeFilter ] = useState("")
    const [ categoryFilter, setCategoryFilter ] = useState("")
    const [ cleanView, setCleanView ] = useStorageState<boolean>("model-modal-clean-view", false)

    const typeOptions = useMemo(() => {
        const types = new Set<string>()
        modelGroups.forEach(group => {
            group.models.forEach(model => {
                const type = model.description?.type
                if (type) {
                    types.add(type)
                }
            })
        })
        return Array.from(types).sort((a, b) => a.localeCompare(b))
    }, [ modelGroups ])

    const categoryOptions = useMemo(() => {
        const categories = new Set<string>()
        modelGroups.forEach(group => {
            group.models.forEach(model => {
                const category = model.description?.category
                if (category) {
                    categories.add(category)
                }
            })
        })
        return Array.from(categories).sort((a, b) => a.localeCompare(b))
    }, [ modelGroups ])

    return (
        <ModalDialog open={open} onClose={onClose} width={"ip:max-w-5xl ip:w-full ip:bg-cloud ip:dark:bg-dark ip:sm:mt-[10vh] ip:mt-[30vh] ip:mb-4 ip:min-h-[89vh]"}>
            <DialogTitle as="h3" className="ip:flex ip:items-center ip:gap-2 ip:text-lg ip:font-bold ip:text-dark ip:dark:text-white">
                Weather Models
                <span className="ip:absolute ip:top-4 ip:right-12 ip:z-100 ip:hover:bg-primary/20 ip:p-0.5 ip:rounded-md">
                    <Link href="/models" className="ip:rounded-md ip:text-dark/50 ip:dark:text-white/50 ip:focus:outline-none">
                        <IpExpandIcon className="ip:size-6" />
                    </Link>
                </span>
            </DialogTitle>
            <div className="ip:my-8">
                <ModelFilter
                    typeOptions={typeOptions}
                    typeFilter={typeFilter}
                    onTypeChange={setTypeFilter}
                    categoryOptions={categoryOptions}
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    searchModel={searchModel}
                    onSearchChange={setSearchModel}
                    onClearSearch={() => setSearchModel("")}
                    cleanView={cleanView}
                    onCleanViewChange={setCleanView}
                />
            </div>
            <div className="ip:mt-4 ip:flex ip:flex-col ip:gap-4">
                {modelGroups.map((group, groupIndex) => (
                    <ModelGroup
                        key={`map-control-model-group-${group.slug}-${groupIndex}`}
                        group={group}
                        searchModel={searchModel}
                        typeFilter={typeFilter}
                        categoryFilter={categoryFilter}
                        activeModel={activeModel}
                        onModelChange={onModelChange}
                        flyToModelBounds={flyToModelBounds}
                        onClose={onClose}
                        isFavorite={isFavorite ?? (() => false)}
                        onToggleFavorite={onToggleFavorite ?? (() => {})}
                        cleanView={cleanView}
                    />
                ))}
            </div>
        </ModalDialog>
    )
}

export default ModelModal
