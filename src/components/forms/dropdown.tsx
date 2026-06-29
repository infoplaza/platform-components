import React, { useEffect, useRef, useState } from "react"
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { UilAngleDown } from '@/src/components/icons/index'
import useResize from "@/src/utilities/resize"
import { twMerge } from "@/src/utilities/external/twMerge"

export interface DropdownItem {
    value: string | number;
    title?: string;
    i18n?: string;
    active?: boolean;
    available?: boolean;
}

export interface DropdownControlProps {
    items: DropdownItem[];
    minItems?: number;
    maxItems?: number;
    onChange?: (value: string | number) => void;
    onMore?: () => void;
    className?: string;
    small?: boolean;
    popUpPosition?: 'top' | 'bottom';
}

interface DropdownViewModel {
    active?: DropdownItem;
    activeMore: boolean;
    items: DropdownItem[];
    itemsMore: DropdownItem[];
}

function DropdownControl({ items, minItems = 1, maxItems = 3, onChange, onMore, className = '', small = false, popUpPosition = 'top' }: DropdownControlProps) {
    const menuButtonRef = useRef<HTMLButtonElement>(null)
    const moreButtonRef = useRef<HTMLDivElement>(null)
    const [ mobile, setMobile ] = useState(false)
    const [ position, setPosition] = useState<'left' | 'right' | null>(null)
    const [ viewModel, setViewModel] = useState<DropdownViewModel | null>(null)

    const getItemLabel = (item: DropdownItem): string => item.title ?? item.i18n ?? String(item.value)

    const reposition = () => {
        setTimeout(() => {
            const anchorEl = menuButtonRef.current ?? moreButtonRef.current
            if (anchorEl) {
                const elPosition = anchorEl.getBoundingClientRect().left
                setPosition(elPosition < 200 ? 'left' : 'right')

                const isMobile = window.screen.width < 640
                if (mobile !== isMobile) {
                    setMobile(isMobile)
                }
            }
        }, 200)
    }

    useResize(() => {
        reposition()
    })
    
    useEffect(() => {
        const menuItems = items ? items.filter(i => i.title || i.i18n) : []

        if (menuItems.length > minItems) {
            const visible: DropdownItem[] = []
            const more: DropdownItem[] = []
            const max = mobile ? 0 : maxItems

            menuItems.forEach((item, index) => {
                if (index < max || menuItems.length === max + 1) {
                    visible.push(item)
                } else {
                    more.push(item)
                }
            })

            const vm: DropdownViewModel = {
                active: items.find(i => i.active),
                activeMore: (more.find(i => i.active) != null),
                items: visible, 
                itemsMore: more
            }

            setViewModel(vm)
        } else {
            setViewModel(null)
        }

    
        reposition()
    }, [ items, minItems, maxItems, mobile ])

    const change = (i: DropdownItem) => {
        if (onChange && !i.active) onChange(i.value)
    }

    if (!viewModel) {
        return null
    }

    return (
        <Menu as="div" className={twMerge(`ip:pointer-events-auto ip:z-20 ip:relative ip:text-sm ip:md:text-base ip:rounded-lg ip:bg-white/80 ip:dark:bg-dark/80 ip:backdrop-blur-md ip:flex ip:h-7 ip:md:h-8`, className)}>
            <div className='ip:flex'>
                <div className='ip:flex ip:rounded-lg ip:overflow-hidden'>
                    {(viewModel.items).map((i:DropdownItem) => (
                        <div key={i.value} onClick={() => change(i)} className="ip:cursor-pointer">
                            <div className={twMerge('ip:font-semibold ip:px-3 ip:py-2 ip:leading-none', i.active ? 'ip:text-primary' : 'ip:dark:text-white ip:hover:bg-primary/20', i.available === false && 'ip:opacity-40', small && 'ip:text-2xs ip:text-red-500')}>
                                {getItemLabel(i)}
                            </div>                
                        </div>
                    ))}

                    {(viewModel.itemsMore.length > 0 && !onMore) &&
                            <MenuButton ref={menuButtonRef} className={twMerge("ip:leading-none ip:dark:text-white ip:gap-1 ip:flex ip:place-items-center ip:cursor-pointer ip:hover:bg-primary/20", small && 'ip:px-2 ip:py-0.5', !small && 'ip:px-2 ip:md:px-3 ip:py-1')}>
                                {(viewModel.activeMore) ? (
                                    <div className={twMerge('ip:whitespace-nowrap ip:font-semibold', maxItems > 0 && 'ip:text-primary', small && 'ip:text-xs')}>
                                        {viewModel.active ? getItemLabel(viewModel.active) : `${viewModel.itemsMore.length} more`}
                                    </div>
                                ) : (
                                    <div className='ip:text-xs'>{viewModel.itemsMore.length} more</div>
                                )}
                                <UilAngleDown className="ip:h-3 ip:w-3 " aria-hidden="true" />
                            </MenuButton>
                    }

                    {(viewModel.itemsMore.length > 0 && onMore) &&
                            <div ref={moreButtonRef} className={twMerge("ip:leading-none ip:dark:text-white ip:gap-1 ip:flex ip:place-items-center ip:cursor-pointer ip:hover:bg-primary/20", small && 'ip:px-2 ip:py-0.5', !small && 'ip:px-2 ip:md:px-3 ip:py-1')}
                                onClick={onMore}>
                                {(viewModel.activeMore) ? (
                                    <div className={twMerge('ip:whitespace-nowrap ip:font-semibold', maxItems > 0 && 'ip:text-primary',small && 'ip:text-xs')}>
                                        {viewModel.active ? getItemLabel(viewModel.active) : `${viewModel.itemsMore.length} more`}
                                    </div>
                                ) : (
                                    <div className='ip:text-xs'>{viewModel.itemsMore.length} more</div>
                                )}
                                <UilAngleDown className="ip:h-3 ip:w-3" aria-hidden="true" />
                            </div>
                    }
                </div>
            </div>

            <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-75"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <MenuItems className={twMerge('ip:absolute ip:dark:text-white  ip:z-20 ip:py-1 ip:max-h-80 ip:overflow-auto ip:rounded-md ip:bg-white/90 ip:dark:bg-dark/90 ip:backdrop-blur-md ip:focus:outline-none', position === 'left' ? 'ip:left-0 ip:text-left ip:origin-bottom-left' : 'ip:right-0 ip:text-right ip:origin-bottom-right', onMore && 'ip:hidden', popUpPosition === 'top' ? 'ip:bottom-8 ip:md:bottom-10': 'ip:top-8 ip:md:top-10')}>
                    <div>
                        {(viewModel.itemsMore).map(i => (
                            <MenuItem key={i.value}>
                                <div className={twMerge('ip:whitespace-nowrap ip:px-2 ip:md:px-3 ip:py-0.5 ip:flex ip:justify-between ip:gap-2 ip:place-items-center ip:cursor-pointer', i.active ? 'ip:text-primary ip:font-semibold' : 'ip:hover:bg-primary/20 ip:font-medium', small && 'ip:text-2xs')}
                                    onClick={() => change(i)}>                      
                                    <div className={`${i.available === false ? 'ip:opacity-40' : ''}`}>{getItemLabel(i)}</div>
                                </div>
                            </MenuItem>
                        ))}
                    </div>
                </MenuItems>
            </Transition>
        </Menu>
    )
}

export default DropdownControl