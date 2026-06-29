import type { IconStyle } from '../../_utils/icon-style'
// import arrowAtlas from './icons/arrow.atlas.png'
import arrowThinOutline from '@/src/layers/grid/icons/arrow-thin.png'
import arrowMapping from '@/src/layers/grid/icons/arrow.mapping.json'
import windBarbAtlas from '@/src/layers/grid/icons/wind-barb.atlas.png' 
import windBarbMapping from '@/src/layers/grid/icons/wind-barb.mapping.json'

export const GridStyle = {
    VALUE: 'VALUE',
    ARROW: 'ARROW',
    WIND_BARB: 'WIND_BARB',
} as const

export type GridStyle = (typeof GridStyle)[keyof typeof GridStyle];

export const GRID_ICON_STYLES = new Map<GridStyle, IconStyle>([
    [GridStyle.ARROW, {
        iconAtlas: arrowThinOutline,
        iconMapping: arrowMapping,
    }],
    [GridStyle.WIND_BARB, {
        iconAtlas: windBarbAtlas,
        iconMapping: windBarbMapping,
        iconBounds: [0, 100 * 0.51444], // 100 kts to m/s
    }],
])