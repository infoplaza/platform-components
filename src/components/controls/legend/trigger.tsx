import React, { forwardRef } from 'react'
import { twMerge } from '@/src/utilities/external/twMerge'

export interface LegendTriggerProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
    /**
     * Click/tap handler. Receives the original event so callers can stop
     * propagation when the trigger sits on top of a map.
     */
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
    /**
     * Accessibility label describing the action (e.g. "Show legend details").
     */
    'aria-label': string
    /**
     * Whether the controlled details surface is currently open. Maps to
     * `aria-expanded` so assistive tech can describe the state.
     */
    expanded?: boolean
    /**
     * Visual hover/focus affordance. Defaults to a subtle highlight that
     * works on top of light or dark map tiles.
     */
    affordance?: 'subtle' | 'none'
    children: React.ReactNode
}

const AFFORDANCE_CLASSES: Record<NonNullable<LegendTriggerProps['affordance']>, string> = {
    subtle:
        'ip:transition ip:hover:brightness-110 ip:hover:ring-1 ip:hover:ring-white/40 ip:dark:hover:ring-white/20 ' +
        'ip:focus-visible:outline-none ip:focus-visible:ring-2 ip:focus-visible:ring-blue-400',
    none: 'ip:focus-visible:outline-none ip:focus-visible:ring-2 ip:focus-visible:ring-blue-400',
}

/**
 * Accessible, presentationally minimal button that wraps any legend
 * rendering and exposes it as a click target. Designed to be dropped on
 * top of map HUDs where the parent uses `pointer-events-none` -- this
 * component re-enables pointer events for itself.
 */
export const LegendTrigger = forwardRef<HTMLButtonElement, LegendTriggerProps>(
    function LegendTrigger(
        {
            onClick,
            children,
            className,
            affordance = 'subtle',
            expanded,
            ...rest
        },
        ref
    ) {
        return (
            <button
                ref={ref}
                type="button"
                onClick={onClick}
                aria-haspopup="dialog"
                aria-expanded={expanded}
                className={twMerge(
                    'ip:pointer-events-auto ip:cursor-pointer ip:text-left',
                    'ip:rounded-md',
                    AFFORDANCE_CLASSES[affordance],
                    className
                )}
                {...rest}
            >
                {children}
            </button>
        )
    }
)
