import type { ElementInfo, ModelInfo, WeatherConfig, WeatherLayersInfo, WeatherState, WeatherSuggestions } from '@/@types/weather.types';
export declare const useWeatherState: (config: WeatherConfig) => WeatherState & {
    setElement: (element: string) => void;
    setModel: (model: string) => void;
    setModelRun: (run: string) => void;
    setModelMember: (member: string | null) => void;
    setModelLevel: (level: string | null) => void;
    setMonth: (month: string | null) => void;
    setPeriod: (period: string | null) => void;
    setMapState: (state: unknown | null) => void;
};
export declare const useWeatherModels: (models: ModelInfo[] | undefined, model: string) => {
    modelInfo: ModelInfo | null;
};
export declare const useWeatherElements: (modelInfo: ModelInfo | null, element: string) => {
    elementInfo: ElementInfo | null;
};
export declare const useWeatherSuggestions: (modelInfo: ModelInfo | null, elementInfo: ElementInfo | null, modelRun: string, modelMember: string | null, modelLevel: string | null) => WeatherSuggestions;
export declare const useWeatherLayers: (config: WeatherConfig, elementInfo: ElementInfo | null, hideLayers: string[], suggestedModelRun: string, suggestedModelMember: string, suggestedModelLevel: string) => {
    layersInfo: WeatherLayersInfo | null;
};
