import React from 'react';
export type MapStyleVariant = {
    source?: string | object | null;
    beforeId?: string;
};
export type BaseMapStyle = {
    styles?: {
        default?: MapStyleVariant;
        marine?: MapStyleVariant;
    };
};
export type BaseMapModelInfo = {
    description?: {
        category?: string;
    };
};
export type BaseMapProps = {
    viewState: Record<string, unknown>;
    style?: string | object | null;
    onMove?: (event: unknown) => void;
    onClickMap?: (event: unknown) => void;
    children?: React.ReactNode | ((props: {
        beforeId: string;
    }) => React.ReactNode);
    mapStyle?: BaseMapStyle;
    modelInfo?: BaseMapModelInfo;
};
export default function BaseMap({ viewState, style, onMove, onClickMap, children, mapStyle, modelInfo, }: BaseMapProps): React.JSX.Element | null;
