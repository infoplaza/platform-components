const BarIcon = ({ color }) => {
    return (
        <svg className="recharts-surface" width="14" height="14" viewBox="0 0 32 32" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
            <title></title>
            <desc></desc>
            <path stroke="none"
                fill={color} 
                d="M0,4h32v24h-32z"
                className="recharts-legend-icon">
            </path>
        </svg>
    )
}
export default BarIcon
