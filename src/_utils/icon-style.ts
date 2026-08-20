type IconDef = {
  width: number;
  height: number;
  anchorX?: number;
  anchorY?: number;
  mask?: boolean;
};

type PrepackedIcon = {
  x: number;
  y: number;
} & IconDef;

type IconMapping = Record<string, PrepackedIcon>;

export interface IconStyle {
  iconAtlas: string;
  iconMapping: IconMapping;
  iconBounds?: [number, number];
}