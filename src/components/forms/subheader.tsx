import { twMerge } from '@/src/utilities/external/twMerge'

interface SubHeaderProps {
    title: string
    className?: string
}

function SubHeader({ title, className }: SubHeaderProps) {
    return (
        <div className="ip:flex ip:items-center">
            <div className="ip:relative ip:flex ip:justify-start">
                <span className={twMerge("ip:pr-2 ip:text-sm ip:font-semibold ip:text-gray-500 ip:bg-transparent ip:dark:text-gray-400 ip:whitespace-nowrap", className)}>{title}</span>
            </div>
            <div aria-hidden="true" className="ip:w-full ip:border-t ip:border-dark/40 ip:dark:border-white/15" />
        </div>
    )
}

export default SubHeader
