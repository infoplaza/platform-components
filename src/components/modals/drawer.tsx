import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { IpCloseAnimated } from '@/src/components/icons'
import { twMerge } from '@/src/utilities/external/twMerge'

interface SimpleDrawerProps {
    open: boolean
    onClose: () => void
    children: React.ReactNode
    className?: string
    title?: string
}

export default function SimpleDrawer({ open, onClose, className, title, children }: SimpleDrawerProps) {
    return (
        <Dialog open={open} onClose={onClose} className="ip:relative ip:z-20">
            <div className="ip:fixed ip:inset-0" />

            <div className="ip:fixed ip:inset-0 ip:overflow-hidden">
                <div className="ip:absolute ip:inset-0 ip:overflow-hidden">
                    <div className="ip:pointer-events-none ip:fixed ip:inset-y-0 ip:right-0 ip:flex ip:max-w-full ip:pl-10 ip:sm:pl-16">
                        <DialogPanel
                            transition
                            className="ip:pointer-events-auto ip:w-screen ip:transform ip:transition ip:duration-500 ip:ease-in-out ip:data-[closed]:translate-x-full ip:sm:duration-700 ip:max-w-lg"
                        >
                            <div className={twMerge(
                                "ip:relative ip:flex ip:h-full ip:flex-col ip:overflow-y-auto ip:bg-white ip:py-6 ip:dark:bg-gray-800 ip:dark:after:absolute ip:dark:after:inset-y-0 ip:dark:after:left-0 ip:dark:after:w-px ip:dark:after:bg-white/10",
                                className
                            )}>
                                <div className="ip:px-4 ip:sm:px-6">
                                    <div className="ip:flex ip:items-start ip:justify-between">
                                        <DialogTitle className="ip:text-base ip:font-semibold ip:text-gray-900 ip:dark:text-white">
                                            {title}
                                        </DialogTitle>
                                        <div className="ip:ml-3 ip:flex ip:h-7 ip:items-center">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="ip:relative ip:rounded-md ip:text-gray-400 ip:hover:text-gray-500 ip:focus-visible:outline ip:focus-visible:outline-2 ip:focus-visible:outline-offset-2 ip:focus-visible:outline-indigo-600 ip:dark:hover:text-white ip:dark:focus-visible:outline-indigo-500"
                                            >
                                                <span className="ip:absolute ip:-inset-2.5" />
                                                <span className="ip:sr-only">Close panel</span>
                                                <IpCloseAnimated className="ip:size-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="ip:relative ip:mt-6 ip:flex-1 ip:px-4 ip:sm:px-6">
                                    {children}
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}
