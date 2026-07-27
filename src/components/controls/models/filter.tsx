import React, { useMemo } from "react"

import { twMerge } from "@/src/utilities/external/twMerge"
import { IpSearch, IpTimes } from "@/src/components/icons"
import FormControlRadio from "@/src/components/forms/radio"
import { formalizeString } from "@/src/utilities/string"

interface ModelFilterProps {
    typeOptions: string[]
    typeFilter: string
    onTypeChange: (value: string) => void
    categoryOptions: string[]
    categoryFilter: string
    onCategoryChange: (value: string) => void
    searchModel: string
    onSearchChange: (value: string) => void
    onClearSearch: () => void
    cleanView: boolean
    onCleanViewChange: (value: boolean) => void
}

const ModelFilter = ({ typeOptions, typeFilter, onTypeChange, categoryOptions, categoryFilter, onCategoryChange, searchModel, onSearchChange, onClearSearch, cleanView, onCleanViewChange }: ModelFilterProps) => {
    const isSearching = useMemo(() => searchModel.trim() !== "", [ searchModel ])

    const typeRadioOptions = useMemo(
        () => [
            { text: 'All', value: "" },
            ...typeOptions.map(option => ({ text: option, value: option }))
        ],
        [ typeOptions ]
    )

    const categoryRadioOptions = useMemo(
        () => [
            { text: 'All', value: "" },
            ...categoryOptions.map(option => ({ text: formalizeString(option), value: option }))
        ],
        [ categoryOptions ]
    )

    return (
        <div className="ip:sm:flex ip:items-center ip:justify-between ip:gap-3 ip:hidden">
            <div className="ip:flex ip:items-center ip:gap-2">
                {typeOptions.length > 0 && (
                    <FormControlRadio
                        options={typeRadioOptions}
                        value={typeFilter}
                        onChange={(value) => onTypeChange(String(value))}
                        className="ip:px-3 ip:text-xs ip:text-gray-600 ip:dark:text-gray-200"
                    />
                )}

                {categoryOptions.length > 0 && (
                    <FormControlRadio
                        options={categoryRadioOptions}
                        value={categoryFilter}
                        onChange={(value) => onCategoryChange(String(value))}
                        className="ip:px-3 ip:text-xs ip:text-gray-600 ip:dark:text-gray-200"
                    />
                )}

            </div>

            <div className="ip:flex ip:items-center ip:gap-3">
                <div className="ip:relative">
                    <div className="ip:absolute ip:left-0 ip:top-0 ip:px-2 ip:py-2">
                        <IpSearch className="ip:w-4 ip:h-4 ip:text-gray-500" />
                    </div>
                    <input
                        name="search models"
                        type="text"
                        placeholder="Search models"
                        value={searchModel}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="ip:pl-8 ip:pr-3 ip:py-2 ip:border-0 ip:border-gray-300 ip:dark:border-gray-600 ip:text-xs ip:rounded-md ip:bg-white ip:dark:bg-gray-800 ip:text-gray-900 ip:dark:text-white ip:placeholder-gray-500 ip:dark:placeholder-gray-400 ip:focus:outline-none ip:focus:ring-2 ip:focus:ring-primary ip:focus:border-transparent ip:transition-colors ip:duration-200"
                    />
                    { isSearching && (
                        <button onClick={onClearSearch} className="ip:absolute ip:right-0 ip:-top-0.5 ip:transition-colors ip:duration-200 ip:px-2 ip:py-2">
                            <IpTimes className="ip:w-5 ip:h-5" />
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={cleanView}
                    onClick={() => onCleanViewChange(!cleanView)}
                    className={twMerge(
                        "ip:inline-flex ip:items-center ip:gap-2 ip:h-8 ip:rounded-md ip:px-3 ip:text-xs ip:font-light ip:transition-colors ip:duration-200",
                        "ip:focus:outline-none ip:focus:ring-2 ip:focus:ring-primary ip:focus:ring-offset-1 ip:focus:ring-offset-white ip:dark:focus:ring-offset-gray-900",
                        cleanView
                            ? "ip:bg-primary/10 ip:text-primary"
                            : "ip:text-gray-700 ip:dark:text-gray-200"
                    )}
                >
                    <span
                        className={twMerge(
                            "ip:relative ip:inline-flex ip:h-4 ip:w-7 ip:shrink-0 ip:items-center ip:rounded-full ip:transition-colors ip:duration-200",
                            cleanView ? "ip:bg-primary" : "ip:bg-gray-300 ip:dark:bg-gray-600"
                        )}
                        aria-hidden="true"
                    >
                        <span
                            className={twMerge(
                                "ip:inline-block ip:h-3 ip:w-3 ip:transform ip:rounded-full ip:bg-white ip:shadow ip:transition-transform ip:duration-200",
                                cleanView ? "ip:translate-x-3.5" : "ip:translate-x-0.5"
                            )}
                        />
                    </span>
                    <span className="ip:truncate">Clean View</span>
                </button>
            </div>
        </div>
    )
}

export default ModelFilter

