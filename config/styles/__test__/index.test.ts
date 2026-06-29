import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'

import { MAP_STYLES } from '@/config/styles'
import { DARK_MARINE_STYLE } from '@/config/styles/dark'
import { LAND_MARINE_STYLE } from '@/config/styles/land'
import { SEA_MARINE_STYLE } from '@/config/styles/sea'
import { TRAFFIC_MARINE_STYLE } from '@/config/styles/traffic'

describe('Styles Configuration', () => {
    it('MAP_STYLES should have correct keys, titles and default style config', () => {
        expect(MAP_STYLES).toHaveLength(4)
        expect(MAP_STYLES.map((style) => style.key)).toEqual(['dark', 'land', 'sea', 'traffic'])
        expect(MAP_STYLES.map((style) => style.title)).toEqual(['Dark', 'Land', 'Sea', 'Traffic'])

        expect(MAP_STYLES.map((style) => style.styles.default)).toEqual([
            { source: 'https://maps.meteoplaza.com/styles/imweather-timo/style.json', beforeId: 'lakes-transparent' },
            { source: 'https://maps.meteoplaza.com/styles/imweather-combined-black/style.json', beforeId: 'lakes-transparent' },
            { source: 'https://maps.meteoplaza.com/styles/imweather-sea/style.json', beforeId: 'lakes-transparent' },
            { source: 'https://maps.meteoplaza.com/styles/verkeerplaza/style.json', beforeId: 'water-intermittent' }
        ])
    })

    it('MAP_STYLES should use the matching marine style config for each style', () => {
        expect(MAP_STYLES.map((style) => style.styles.marine.beforeId)).toEqual(['landcover', 'landcover', 'landcover', 'landcover'])
        expect(MAP_STYLES.map((style) => style.styles.marine.source)).toEqual([
            DARK_MARINE_STYLE,
            LAND_MARINE_STYLE,
            SEA_MARINE_STYLE,
            TRAFFIC_MARINE_STYLE
        ])
    })

    it('MAP_STYLES should define unique style keys and complete style entries', () => {
        const keys = MAP_STYLES.map((style) => style.key)
        expect(new Set(keys).size).toBe(keys.length)

        MAP_STYLES.forEach((style) => {
            expect(style.title).toBeTruthy()
            expect(style.styles.default.source).toBeTruthy()
            expect(style.styles.default.beforeId).toBeTruthy()
            expect(style.styles.marine.source).toBeTruthy()
            expect(style.styles.marine.beforeId).toBeTruthy()
        })
    })
})
