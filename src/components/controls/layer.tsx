import { useState, useRef } from 'react'
import { IpSetting } from '@/src/components/icons'
import useResize from '@/src/utilities/resize'
import { twMerge } from '@/src/utilities/external/twMerge'
import LayerModal from '@/src/components/controls/layer/modal'

export default function MapControlLayer({ vertical = false }: { vertical?: boolean }) {
    const elRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState<'left' | 'right' | null>(null)

    function dialogOpen() {
        setOpen(true)
    }

    function dialogClose() {
        setOpen(false)
    }

    const reposition = () => {
        if (elRef.current) {
            if (elRef.current.getBoundingClientRect().left < window.innerWidth / 3) {
                setPosition('left')
            } else {
                setPosition('right')
            }
        }
    }

    useResize(() => {
        reposition()
    })

    return (
        <div>
            <div ref={elRef} className={twMerge('ip:pointer-events-auto ip:flex', vertical ? 'ip:flex-col' : 'ip:flex-row')}>
                <div className="ip:group ip:relative ip:self-center ip:bg-white/80 ip:dark:bg-dark/80 ip:rounded-lg ip:border ip:border-white/10 ip:dark:border-white/10">
                    <button
                        type="button"
                        onClick={() => dialogOpen()}
                        className="ip:flex ip:place-content-center ip:items-center ip:size-7 ip:sm:size-8 ip:rounded-lg ip:cursor-pointer ip:hover:bg-primary/20 ip:dark:hover:bg-dark"
                        aria-label="Layer settings"
                    >
                        <IpSetting className="ip:size-5 ip:sm:size-4.5" />
                    </button>

                    <div
                        className={twMerge([
                            'ip:absolute ip:backdrop-blur-md ip:font-medium ip:top-1 ip:text-xs ip:px-2 ip:rounded ip:whitespace-nowrap ip:opacity-0 ip:scale-0 ip:group-hover:opacity-100 ip:group-hover:scale-100 ip:origin-right ip:transition-all ip:duration-300 ip:bg-white/80 ip:dark:bg-dark/80',
                            position === 'left' ? 'ip:left-9' : 'ip:right-9',
                        ])}
                    >
                        Layer settings
                    </div>
                </div>
            </div>

            <LayerModal open={open} onClose={dialogClose} />
        </div>
    )
}
