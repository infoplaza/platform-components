import React from 'react';
import type { WeatherConfig, WeatherContextValue } from '@/@types/weather.types';
export declare const WeatherMapContext: React.Context<WeatherContextValue | null>;
export declare const WeatherMapProvider: React.FC<WeatherConfig>;
export declare function useWeatherMap(): WeatherContextValue;
