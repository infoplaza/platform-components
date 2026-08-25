import { useEffect, useMemo, useRef, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { IpAngleDown } from '@/src/components/icons'
import { twMerge } from '@/src/utilities/external/twMerge'
import type { TimeseriesPillItem } from './types'

export type TimeseriesPillsProps = {
  items: TimeseriesPillItem[]
  onChange: (value: string) => void
  minItems?: number
  maxItems?: number
  resize?: boolean
}

export default function TimeseriesPills({
  items,
  onChange,
  minItems = 0,
  maxItems = 5,
  resize = true,
}: TimeseriesPillsProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [menuAlign, setMenuAlign] = useState<'left' | 'right'>('right')
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const update = () => {
      setIsNarrow(window.innerWidth < 640)
      const left = menuButtonRef.current?.getBoundingClientRect().left ?? 0
      setMenuAlign(left < 200 ? 'left' : 'right')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const view = useMemo(() => {
    const source = items.filter((item) => item.title)
    const visibleMax = isNarrow && resize ? 0 : maxItems
    const visibleMin = isNarrow && resize ? 0 : minItems

    if (source.length <= visibleMin) {
      return { visible: source, overflow: [] as TimeseriesPillItem[] }
    }

    const visible: TimeseriesPillItem[] = []
    const overflow: TimeseriesPillItem[] = []
    source.forEach((item, index) => {
      if (index < visibleMax || source.length === visibleMax + 1) {
        visible.push(item)
      } else {
        overflow.push(item)
      }
    })
    return { visible, overflow }
  }, [items, isNarrow, maxItems, minItems, resize])

  const overflowActive = view.overflow.some((item) => item.active)

  if (view.visible.length === 0 && view.overflow.length === 0) {
    return null
  }

  return (
    <div className="ip:relative ip:flex ip:pointer-events-auto">
      <div className="ip:flex ip:h-5 ip:items-center ip:gap-1">
        {view.visible.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.value}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                if (!item.active && !item.disabled) onChange(item.value)
              }}
              className={twMerge(
                'ip:relative ip:flex ip:h-full ip:cursor-pointer ip:items-center ip:gap-1 ip:whitespace-nowrap ip:rounded-full ip:px-2 ip:text-xs ip:leading-none',
                item.active && !item.beta && 'ip:bg-primary ip:text-white',
                !item.active && 'ip:opacity-50 ip:hover:bg-primary/20 ip:hover:opacity-100',
                item.active && item.beta && 'ip:bg-yellow-500 ip:text-yellow-900',
                item.beta && 'ip:border ip:border-yellow-500',
                item.disabled &&
                  'ip:cursor-not-allowed ip:opacity-40 ip:hover:bg-gray-100 ip:hover:opacity-50',
              )}
            >
              {Icon ? <Icon className="ip:h-3 ip:w-3" /> : null}
              {item.title}
            </button>
          )
        })}

        {view.overflow.length > 0 ? (
          <Menu as="div" className="ip:relative">
            <MenuButton
              ref={menuButtonRef}
              className={twMerge(
                'ip:flex ip:h-5 ip:cursor-pointer ip:items-center ip:gap-1 ip:rounded-full ip:px-2 ip:text-xs ip:leading-none ip:opacity-50 ip:hover:bg-primary/20 ip:hover:opacity-100',
                overflowActive && 'ip:bg-primary ip:text-white ip:opacity-100',
              )}
            >
              {overflowActive
                ? (view.overflow.find((item) => item.active)?.title ??
                  `${view.overflow.length} more`)
                : `${view.overflow.length} more`}
              <IpAngleDown className="ip:h-3 ip:w-3" aria-hidden />
            </MenuButton>
            <Transition
              enter="ip:transition ip:ease-out ip:duration-100"
              enterFrom="ip:transform ip:opacity-0 ip:scale-95"
              enterTo="ip:transform ip:opacity-100 ip:scale-100"
              leave="ip:transition ip:ease-in ip:duration-75"
              leaveFrom="ip:transform ip:opacity-100 ip:scale-100"
              leaveTo="ip:transform ip:opacity-0 ip:scale-95"
            >
              <MenuItems
                className={twMerge(
                  'ip:absolute ip:z-20 ip:mt-1 ip:max-h-80 ip:overflow-auto ip:rounded-md ip:bg-white/90 ip:py-1 ip:backdrop-blur-md ip:focus:outline-none ip:dark:bg-dark/90 ip:dark:text-white',
                  menuAlign === 'left' ? 'ip:left-0' : 'ip:right-0',
                )}
              >
                {view.overflow.map((item) => (
                  <MenuItem key={item.value} disabled={item.disabled}>
                    <button
                      type="button"
                      disabled={item.disabled}
                      onClick={() => {
                        if (!item.active && !item.disabled) onChange(item.value)
                      }}
                      className={twMerge(
                        'ip:flex ip:w-full ip:cursor-pointer ip:items-center ip:gap-2 ip:whitespace-nowrap ip:px-3 ip:py-1 ip:text-xs',
                        item.active
                          ? 'ip:font-semibold ip:text-primary'
                          : 'ip:hover:bg-primary/20',
                        item.disabled && 'ip:cursor-not-allowed ip:opacity-40',
                      )}
                    >
                      {item.title}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Transition>
          </Menu>
        ) : null}
      </div>
    </div>
  )
}
