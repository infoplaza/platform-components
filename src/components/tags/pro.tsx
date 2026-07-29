import React from "react"

interface TagProProps {
    small?: boolean
    trial?: boolean
}

function TagPro({ small = false, trial = false }: TagProProps) {
    return (
        <div className={`
                ${ small ? 'text-3xs px-1 py-0.5' : 'text-xs px-2 py-1'}
                inline-block bg-gradient-to-r from-yellow-600 to-yellow-800 text-white rounded-full leading-none  uppercase`}>
            PRO {trial && <span>trial</span>}
        </div>
    )
}

export default TagPro
