export interface MapStyle {
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
