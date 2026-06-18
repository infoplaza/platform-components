import { useMemo } from 'react'
// import { _ScaleWidget as ScaleWidget } from 'deck.gl'
// import '@deck.gl/widgets/stylesheet.css'

import DeckGLOverlay from './container'
// import MapTooltip from '../controls/tooltip/container'
// import { useTooltip } from '../controls/tooltip/useTooltip'
// import { useClick } from '../controls/clicks/useClick'
// import { MetricsProvider } from '../controls/metrics/context'
// import MetricsOverlay from '../controls/metrics/overlay'
// import LocationContextMenu from '../controls/menu/location'

interface DeckGLOverlayWithTooltipProps {
    layers: any[]
    interleaved?: boolean
    [key: string]: any
}

export default function Overlay({ layers, interleaved, _renderLayersInGroups, ...rest }: DeckGLOverlayWithTooltipProps) {
    // const { containerRef, onHover } = useTooltip(layers)
    // const { onClick, onContextMenu, contextMenu, closeContextMenu } = useClick()

    // const widgets = useMemo(() => [
    //     // new ScaleWidget({
    //     //     placement: 'top-right',
    //     //     style: {
    //     //         marginTop: '0.90rem',
    //     //         marginRight: '3rem',
    //     //     },
    //     //     className: 'deck-scale-widget-offset',
    //     // }),
    // ], [])

    return (
        // <MetricsProvider>
        //     <MapTooltip ref={containerRef} />
        //     <LocationContextMenu menu={contextMenu} onClose={closeContextMenu} />
        //     <MetricsOverlay />
            <DeckGLOverlay
                layers={layers}
                interleaved={interleaved}
                // widgets={widgets}
                // onHover={onHover}
                // onClick={onClick}
                // onContextMenu={onContextMenu}
                {...rest}
            />
        // </MetricsProvider>
    )
}
