import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useMapIndex } from '@/src/providers/timestamps/timestamp'
import { setTimebarPlaying } from '@/src/redux/timestamps/slices'
import type { AppDispatch } from '@/src/redux/timestamps/store'

/**
 * Keeps Redux `timebarPlaying` in sync for the current map (MapIndexProvider).
 * Use `playingButton || autoplay` so merged timebars, manual play, and autoplay all count.
 */
export function useSyncTimebarPlaying(playing: boolean) {
    const dispatch = useDispatch<AppDispatch>()
    const mapIndex = useMapIndex()

    useEffect(() => {
        dispatch(setTimebarPlaying({ mapIndex, playing }))
        return () => {
            dispatch(setTimebarPlaying({ mapIndex, playing: false }))
        }
    }, [dispatch, mapIndex, playing])
}
