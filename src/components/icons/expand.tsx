interface ExpandIconProps {
    className?: string
}

const ExpandIcon = ({ className }: ExpandIconProps) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 9V5a1 1 0 0 1 1-1h4M4 15v4a1 1 0 0 0 1 1h4m6-16h4a1 1 0 0 1 1 1v4m-5 11h4a1 1 0 0 0 1-1v-4"
            />
        </svg>
    )
}

export default ExpandIcon
