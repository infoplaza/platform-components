import React from "react"
// import { ChevronDownIcon } from "@heroicons/react/24/solid"
// import { useTranslations } from "next-intl"

import { twMerge } from "@/src/utilities/external/twMerge"

interface ModelGroupHeaderProps {
    title: string
    count?: number
    countLabel?: string
    expanded: boolean
    onToggle: () => void
    className?: string
}

const ModelGroupHeader = ({ title, count, countLabel, expanded, onToggle, className }: ModelGroupHeaderProps) => {
    // const t = useTranslations()
    const resolvedCountLabel = countLabel ?? 'Models'
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className={twMerge(
                "ip:group ip:flex ip:items-center ip:justify-between ip:w-full ip:text-left ip:focus:outline-none ip:bg-cloud-400 ip:dark:bg-stone-600/50 ip:p-3 ip:rounded-t-md",
                !expanded && "ip:rounded-md",
                className
            )}
        >
            <span className="ip:text-sm ip:font-semibold ip:text-gray-500 ip:dark:text-gray-300 ip:whitespace-nowrap">
                {title}
            </span>
            <span className="ip:flex ip:items-center ip:gap-3">
                {typeof count === "number" && (
                    <span className="ip:text-xs ip:text-gray-500 ip:dark:text-gray-500">
                        {expanded ? 'Hide' : 'Show'} {count} {resolvedCountLabel}
                    </span>
                )}
                {/* <ChevronDownIcon
                    aria-hidden="true"
                    className={twMerge(
                        "h-3 w-3 shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-200",
                        expanded ? "rotate-0" : "-rotate-180"
                    )}
                /> */}
            </span>
        </button>
    )
}

export default ModelGroupHeader
