import React from 'react'
import SubHeader from '@/src/components/forms/subheader'
import { IpAngleDown } from '@/src/components/icons'

interface AccordionSectionProps {
    id: string
    title: string
    isOpen: boolean
    onToggle: () => void
    className?: string
    children: React.ReactNode
}

const AccordionSection = ({
    id,
    title,
    isOpen,
    onToggle,
    className = 'ip:bg-cloud/5 ip:dark:bg-dark ip:text-xs ip:w-max',
    children,
}: AccordionSectionProps) => {
    return (
        <div>
            <button
                type="button"
                className="ip:w-full ip:text-left"
                aria-expanded={isOpen}
                aria-controls={`${id}-content`}
                onClick={onToggle}
            >
                <div className="ip:relative ip:pr-6">
                    <SubHeader title={title} className={className} />
                    <IpAngleDown
                        className={`ip:absolute ip:right-0 ip:top-1/2 ip:h-4 ip:w-4 ip:-translate-y-1/2 ip:text-gray-500 ip:transition-transform ip:duration-300 ip:ease-in-out ip:dark:text-gray-400 ${isOpen ? 'ip:rotate-180' : ''}`}
                    />
                </div>
            </button>
            <div
                id={`${id}-content`}
                aria-hidden={!isOpen}
                className={`ip:grid ip:transition-all ip:duration-300 ip:ease-in-out ${isOpen ? 'ip:grid-rows-[1fr] ip:opacity-100' : 'ip:grid-rows-[0fr] ip:opacity-0'}`}
            >
                <div className={isOpen ? 'ip:overflow-visible' : 'ip:overflow-hidden'}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AccordionSection
