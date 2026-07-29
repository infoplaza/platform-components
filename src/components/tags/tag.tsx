import React from "react"
import { twMerge } from "@/src/utilities/external/twMerge"

interface TagProps {
    children: React.ReactNode
    className?: string
}

function Tag({ children, className }: TagProps) {
    return (
        <div className={twMerge("ip:inline-block ip:text-xs ip:bg-gray-100 ip:dark:bg-opacity-10 ip:rounded-md ip:leading-none ip:px-2 ip:py-1 ip:dark:text-gray-400", className)}>
            {children}
        </div>
    )
}

export default Tag
