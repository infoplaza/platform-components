import { DARK_MARINE_STYLE } from "./dark";
import { LAND_MARINE_STYLE } from "./land";
import { SEA_MARINE_STYLE } from "./sea";
import { TRAFFIC_MARINE_STYLE } from "./traffic";

interface MapStyle {
    key: string;
    title: string;
    styles: {
        default: {
            source: string | object;
            beforeId: string;
        };
        marine: {
            source: string | object;
            beforeId: string;
        };
    };
}

export const MAP_STYLES: MapStyle[] = [
    { 
        key: 'dark', 
        title: 'Dark', 
        styles: {
            default: {
                source: 'https://maps.meteoplaza.com/styles/imweather-timo/style.json',
                beforeId: 'lakes-transparent'
            },
            marine: {
                source: DARK_MARINE_STYLE,
                beforeId: 'landcover'
            }
        },
    },
    { 
        key: 'land', 
        title: 'Land', 
        styles: {
            default: {
                source: 'https://maps.meteoplaza.com/styles/imweather-combined-black/style.json',
                beforeId: 'lakes-transparent'
            },
            marine: {
                source: LAND_MARINE_STYLE,
                beforeId: 'landcover'
            }
        },
    },
    { 
        key: 'sea', 
        title: 'Sea', 
        styles: {
            default: {
                source: 'https://maps.meteoplaza.com/styles/imweather-sea/style.json',
                beforeId: 'lakes-transparent'
            },
            marine: {
                source: SEA_MARINE_STYLE,
                beforeId: 'landcover'
            }
        },
    },
    { 
        key: 'traffic', 
        title: 'Traffic', 
        styles: {
            default: {
                source: 'https://maps.meteoplaza.com/styles/verkeerplaza/style.json',
                beforeId: 'water-intermittent'
            },
            marine: {
                source: TRAFFIC_MARINE_STYLE,
                beforeId: 'landcover'
            }
        },
    },
]