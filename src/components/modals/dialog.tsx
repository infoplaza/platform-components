import React from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { CloseAnimated } from "@/src/components/icons/index"
import { twMerge } from "@/src/utilities/external/twMerge"

interface ModalDialogProps {
    open: boolean
    onClose?: () => void
    width?: string
    children: React.ReactNode
}

function ModalDialog({ open, onClose, width = 'ip:max-w-3xl ip:w-full', children }: ModalDialogProps) {
    const close = () => {
        onClose?.()
    }

    const handleDialogClose = (_value: boolean) => {
        onClose?.()
    }

    return (
        <Dialog open={open} onClose={handleDialogClose} className="ip:relative ip:z-50">
            {/* For tailwind v4.1 and above */}
            {/* <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"/> */}
            <DialogBackdrop
                transition
                className="ip:fixed ip:inset-0 ip:bg-gray-500/75 ip:transition-opacity ip:data-[closed]:opacity-0 ip:data-[enter]:duration-300 ip:data-[leave]:duration-200 ip:data-[enter]:ease-out ip:data-[leave]:ease-in ip:dark:bg-gray-900/50"
                />
            <div className="ip:fixed ip:inset-0 ip:z-50 ip:w-screen ip:overflow-y-auto ip:scrollbar-hide">
                <div className="ip:flex ip:min-h-full ip:items-end ip:justify-center ip:text-center ip:sm:items-center">
                    {/* For tailwind v4.0 and below */}
                    {/* <DialogPanel
                            transition
                            className={twMerge("relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-1000 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:w-full sm:p-6 sm:mx-4 data-closed:sm:translate-y-0 data-closed:sm:scale-95", width)}
                    > */}
                    <DialogPanel
                        transition
                        className={twMerge("ip:relative ip:transform ip:overflow-hidden ip:rounded-lg ip:bg-white ip:px-4 ip:pb-4 ip:pt-5 ip:text-left ip:shadow-xl ip:transition-all ip:data-[closed]:translate-y-4 ip:data-[closed]:opacity-0 ip:data-[enter]:duration-300 ip:data-[leave]:duration-200 ip:data-[enter]:ease-out ip:data-[leave]:ease-in ip:sm:w-full ip:sm:p-6 ip:data-[closed]:sm:translate-y-0 ip:data-[closed]:sm:scale-95", width)}
                        >
                        <div className="ip:absolute ip:top-4 ip:right-5 ip:z-[100]">
                            <button
                                type="button"
                                className="ip:rounded-md ip:text-dark/50 ip:dark:text-white/50 ip:hover:bg-primary/20 ip:focus:outline-none"
                                onClick={close}>
                                <CloseAnimated className="ip:size-6"/>
                            </button>
                        </div>
                        {children}
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default ModalDialog

