import * as Icons from '@/src/components/icons'
import React from 'react'
import { twMerge } from '@/src/utilities/external/twMerge'

export interface IconElementData {
    i18n: string
    icon?: string
    iconUrl?: string
    badge?: string
}

export interface IconElementProps {
    data: IconElementData
    white?: boolean
    className?: string
    iconClass?: string
}

const getIconName = (name = '') => {
    if (name.startsWith('Ip')) return name
    if (name.startsWith('Uil')) return `Ip${name.slice(3)}`
    return `Ip${name.charAt(0).toUpperCase()}${name.slice(1)}`
}

export default function IconElement({
    data,
    className = '',
    iconClass = '',
}: IconElementProps) {
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[getIconName(data.icon)] ?? Icons.IpFallback

    return (
        <div className={twMerge(['ip:relative ip:w-8 ip:h-6 ip:flex ip:bg-inherit', data.badge ? 'ip:place-content-start ip:items-end' : 'ip:place-content-center', className])}>
            {data.badge && (
                <div className='ip:absolute ip:-top-1 ip:right-0 ip:bg-inherit ip:min-w-4 ip:h-4 ip:px-0.5 ip:flex ip:items-center ip:place-content-center ip:rounded-full'>
                    <div className='ip:text-3xs ip:leading-none ip:font-medium'>{data.badge}</div>
                </div>
            )}
            <div className={`${data.badge ? 'ip:scale-75 ip:translate-y-0.5 ip:-translate-x-0.5' : ''}`}>
                <IconComponent className={twMerge(['ip:fill-black ip:text-black ip:w-6 ip:h-6 ip:dark:fill-white ip:dark:text-white', iconClass])} />
            </div>
        </div>
    )
}
