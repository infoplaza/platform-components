// ** Framework Imports
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react"

// ** Components Imports
import { IpLayerGroup } from '@/src/components/icons'
// import IconElement from '@/src/components/icons/element'


import MapControlLevel from '@/src/components/controls/level'
import ElementModal from '@/src/components/controls/element/modal'
// ** Utils Imports
import { useWeatherMap } from "@/src/providers/weather/weather"
import { twMerge } from "@/src/utilities/external/twMerge"
import useResize from '@/src/utilities/resize'
import IconElement from '@/src/components/controls/element/icons'

import type { ModelInfo, ElementInfo as ElementItem } from '@/@types/weather.types'

// ** Type Definitions
interface MapControlElementProps {
    availableOnly?: boolean
    vertical?: boolean
    maxElements?: number
    fillElements?: boolean
    small?: boolean
}

type Position = 'left' | 'right' | null
type ActiveElementState = {
    activeModel: ModelInfo | null
    activeElement: ElementItem | null
    activeElements: ElementItem[] | null
    fallbackElement: ElementItem | null
}

export default function MapControlElement({ 
    availableOnly = false, 
    vertical = true, 
    maxElements = 10, 
    fillElements = true, 
    small = false 
}: MapControlElementProps) {
    const weatherContext = useWeatherMap()
    const elRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const [position, setPosition] = useState<Position>(null)
    const [hover, setHover] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)

    const reposition = useCallback(() => {
        if (elRef && elRef.current) {
            if (elRef.current.getBoundingClientRect().left < window.innerWidth / 3) {        
                setPosition('left')
            } else {
                setPosition('right')
            }
        }
    }, [elRef])

    useResize(() => {
        reposition()
    })
  
    function dialogOpen(): void {
        setOpen(true)
    }

    function dialogClose(): void {
        setOpen(false)
    }

    const change = useCallback((item: ElementItem): void => {
        weatherContext.setElement(item.slug)
        dialogClose()
    }, [ weatherContext ])

    const activeElementState = useMemo<ActiveElementState>(() => {
        const { modelInfo, element } = weatherContext
        if (modelInfo == null) {
            return {
                activeModel: null,
                activeElement: null,
                activeElements: null,
                fallbackElement: null
            }
        }

        const selectedGroup = modelInfo.elementGroups.find(group => group.items.some(item => item.slug === element))
        const activeGroupItems = (selectedGroup?.items ?? modelInfo.elementGroups[0]?.items ?? []).filter(
            item => !availableOnly || item.available !== false
        )
        const selectedElement = activeGroupItems.find(item => item.slug === element) ?? null

        if (selectedElement == null) {
            return {
                activeModel: null,
                activeElement: null,
                activeElements: null,
                fallbackElement: activeGroupItems[0] ?? null
            }
        }

        const allElements = modelInfo.elementGroups
            .flatMap(group => group.items)
            .filter(item => !availableOnly || item.available !== false)
        const fillElementsFromOtherGroups = fillElements
            ? allElements.filter(item => !activeGroupItems.some(groupItem => groupItem.slug === item.slug))
            : []
        const prioritizedElements = [ ...activeGroupItems, ...fillElementsFromOtherGroups ]
        const activeElements = prioritizedElements.slice(0, maxElements).some(item => item.slug === selectedElement.slug)
            ? prioritizedElements
            : [ selectedElement, ...prioritizedElements ]

        return {
            activeModel: modelInfo,
            activeElement: selectedElement,
            activeElements: activeElements.slice(0, maxElements),
            fallbackElement: null
        }
    }, [ weatherContext.modelInfo, weatherContext.element, availableOnly, fillElements, maxElements ])

    const { activeModel, activeElement, activeElements } = activeElementState

    useEffect(() => {
        if (activeElementState.fallbackElement) {
            change(activeElementState.fallbackElement)
        }

        reposition()
    }, [ activeElementState.fallbackElement, change, reposition ])

    const moreElements = useMemo(() => {
        const { modelInfo } = weatherContext
        if (!modelInfo || !activeElements) return false

        const allElements = modelInfo.elementGroups.map(group => group.items).flat()

        return allElements.length > activeElements.length
    }, [ weatherContext.modelInfo, activeElements ])

    const handleMouseEnter = (): void => {
        const closeAfter = 10000
        setHover(true)

        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }

        timerRef.current = setTimeout(() => {
            setHover(false)
        }, closeAfter)
    }

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])

    if (!activeElements || !activeElement || activeModel?.available === false) {
        return <></>
    }

    return (
        <div>
            <div className={twMerge(['ip:flex ip:gap-1 ip:pointer-events-auto', vertical && 'ip:flex-col'])} ref={elRef} onMouseEnter={handleMouseEnter}>
                <div className={twMerge(['ip:flex ip:gap-1 ip:group', vertical && 'ip:flex-col'])}>
                    {moreElements && (
                        <div className={'ip:flex ip:flex-col ip:w-50 ip:justify-end'}>
                            <button className={twMerge( !vertical && 'ip:justify-end')}
                                onClick={() => dialogOpen()}>
                                <div className='ip:relative ip:group'>
                                    <div className={twMerge(` ip:bg-white/80 ip:dark:bg-dark/80 ip:hover:bg-white ip:dark:hover:bg-dark ip:border ip:dark:border-white/10 ip:relative ip:backdrop-blur-md ip:rounded-lg ip:flex ip:items-center ip:cursor-pointer ip:h-8 ip:shrink-0 ip:w-8 ip:place-content-center`, small && '')}>
                                        <IpLayerGroup className={twMerge("ip:w-5 ip:h-5", small && 'ip:w-5 ip:h-5')} />
                                    </div>

                                    <div className={twMerge(
                                        [
                                            'ip:opacity-0 ip:scale-0 ip:tracking-wide ip:absolute ip:backdrop-blur-md ip:font-medium ip:top-1 ip:text-xs ip:px-2 ip:py-1 ip:rounded ip:whitespace-nowrap ip:transition-all ip:duration-300 ip:bg-white/80 ip:dark:bg-dark/80',
                                            !vertical && 'ip:sr-only ip:hidden',
                                            position === 'left' ? 'ip:left-9 ip:origin-left' : 'ip:right-9 ip:origin-right',
                                            hover && 'ip:opacity-100 ip:scale-100'
                                        ])}>
                                            More layers...
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {(activeElements).map((item) => {
                        const active = item.slug === activeElement.slug
                        const hasLevel = item.levels && item.levels.length > 1

                        return (
                            <div className={twMerge(["ip:flex ip:flex-col ip:w-8", hover && 'ip:w-50', !vertical && 'ip:justify-end'])} key={item.slug}>
                                <div className="ip:inline-flex">
                                    <button className={twMerge([
                                            'ip:relative ip:backdrop-blur-md ip:rounded-lg ip:w-auto ip:flex ip:items-center ip:cursor-pointer ip:transition-all ip:ease-in-out ip:duration-500',
                                            active ? 'ip:bg-primary ip:text-white ip:fill-white' : 'ip:bg-white/80 ip:dark:bg-dark/80 ip:hover:bg-white ip:dark:hover:bg-dark',
                                        ])}
                                        onClick={() => change(item)}>
                                        <div className={twMerge([
                                                'ip:size-8 ip:flex ip:place-content-center ip:items-center ip:relative', 
                                                item.available === false && 'ip:opacity-40', 
                                                small && 'ip:size-8 ip:sm:size-7 ip:pt-1'
                                            ])}>
                                            <IconElement 
                                                data={item as unknown as any} 
                                                white={active} 
                                                className="scale-90" 
                                                iconClass={twMerge([ small && 'size-6 sm:size-5'])}/>
                                        </div>
                                        {hover && (
                                            <div className={twMerge(['ip:text-xs ip:tracking-wide ip:pr-2 ip:truncate ip:opacity-0 ip:transition-all ip:duration-300 ip:font-medium' , hover && 'ip:opacity-100', small && 'ip:text-2xs'])}>{item.i18n ?? item.name}</div>
                                        )}
                                    </button>
                                </div>
                                {(active && hasLevel) && (
                                    <div className={twMerge(!vertical && 'ip:order-first')}>
                                        <div className={twMerge(["ip:opacity-0 ip:h-0 ip:transition-all ip:duration-300", (hover) && 'ip:opacity-100 ip:h-7'])}>
                                            <MapControlLevel levels={item.levels} maxItems={0} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <ElementModal 
                open={open} 
                onClose={dialogClose} 
                activeModel={activeModel as ModelInfo} 
                onChangeHandler={change} 
                activeElement={activeElement.slug}
            />
        </div>
    )

}
