const CloseAnimatedIcon = ({ className }) => {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" strokeDasharray="16" strokeDashoffset="16" strokeLinecap="round"
                strokeLinejoin="round" strokeWidth="2">
                <path d="M7 7l10 10">
                    <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="16;0"/>
                </path>
                <path d="M17 7l-10 10">
                    <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="16;0"/>
                </path>
            </g>
        </svg>
    )
}
export default CloseAnimatedIcon


