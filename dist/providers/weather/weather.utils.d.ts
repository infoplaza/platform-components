import type { ElementInfo, LayerInfoBase, ModelInfo } from '@/@types/weather.types';
type SelectableModel = {
    slug: string;
    available?: boolean;
};
export declare const resolveAvailableModel: <T extends SelectableModel>(models: T[] | null | undefined, requestedSlug: string | null | undefined) => T | null;
export declare const buildUnit: (layer: LayerInfoBase, getUnit: (key: string) => {
    value: string;
}) => string;
export declare const createLayerId: (viewKey: string, elementInfo: ElementInfo | null, element: string) => string;
export declare const findElementInfo: (modelInfo: ModelInfo | null, element: string) => ElementInfo | null;
export declare const suggestModelRun: (modelInfo: ModelInfo | null, modelRun: string) => string;
export declare const suggestModelMember: (modelInfo: ModelInfo | null, modelMember: string | null) => string;
export declare const suggestModelLevel: (elementInfo: ElementInfo | null, modelLevel: string | null) => string;
export {};
