import DeckGLOverlay from './container'
import type { Layer } from '@deck.gl/core'

type OverlayProps = {
    layers: Layer[]
    interleaved?: boolean
    /** MapLibre layer id to insert weather under (borders/labels stay on top). */
    beforeId?: string
    [key: string]: unknown
}

export default function Overlay({
    layers,
    interleaved = true,
    beforeId,
    ...rest
}: OverlayProps) {
    return (
        <DeckGLOverlay
            layers={layers}
            interleaved={interleaved}
            beforeId={beforeId}
            {...rest}
        />
    )
}
