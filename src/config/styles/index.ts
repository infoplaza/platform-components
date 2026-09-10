import { DARK_MARINE_STYLE } from "./dark";
import { LAND_MARINE_STYLE } from "./land";
import { SEA_MARINE_STYLE } from "./sea";
import { TRAFFIC_MARINE_STYLE } from "./traffic";
import type { MapStyle } from "../../../@types/map-style.types";

/** Insert weather under rivers/borders/labels, above land/water fills. */
export const DEFAULT_WEATHER_BEFORE_ID = 'lakes-transparent'
export const DEFAULT_MARINE_WEATHER_BEFORE_ID = 'landcover'
export const TRAFFIC_WEATHER_BEFORE_ID = 'water-intermittent'

export const MAP_STYLES: MapStyle[] = [
    { 
        key: 'dark', 
        title: 'Dark', 
        styles: {
            default: {
                source: 'https://maps.meteoplaza.com/styles/imweather-timo/style.json',
                beforeId: DEFAULT_WEATHER_BEFORE_ID,
            },
            marine: {
                source: DARK_MARINE_STYLE,
                beforeId: DEFAULT_MARINE_WEATHER_BEFORE_ID,
            }
        },
    },
    { 
        key: 'land', 
        title: 'Land', 
        styles: {
            default: {
                source: 'https://maps.meteoplaza.com/styles/imweather-combined-black/style.json',
                beforeId: DEFAULT_WEATHER_BEFORE_ID,
            },
            marine: {
                source: LAND_MARINE_STYLE,
                beforeId: DEFAULT_MARINE_WEATHER_BEFORE_ID,
            }
        },
    },
    { 
        key: 'sea', 
        title: 'Sea', 
        styles: {
            default: {
                source: 'https://maps.meteoplaza.com/styles/imweather-sea/style.json',
                beforeId: DEFAULT_WEATHER_BEFORE_ID,
            },
            marine: {
                source: SEA_MARINE_STYLE,
                beforeId: DEFAULT_MARINE_WEATHER_BEFORE_ID,
            }
        },
    },
    { 
        key: 'traffic', 
        title: 'Traffic', 
        styles: {
            default: {
                source: 'https://maps.meteoplaza.com/styles/verkeerplaza/style.json',
                beforeId: TRAFFIC_WEATHER_BEFORE_ID,
            },
            marine: {
                source: TRAFFIC_MARINE_STYLE,
                beforeId: DEFAULT_MARINE_WEATHER_BEFORE_ID,
            }
        },
    },
]
