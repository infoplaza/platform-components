
export type PaletteColor =
  | string
  | number
  | [string, string, string]
  | [number, number, number]
  | [string, string, string, string]
  | [number, number, number, number];
export type PaletteEntry = [string | number, PaletteColor];
export type PaletteArray = PaletteEntry[];
export type Palette = string | PaletteArray;

export interface ParseOptions {
  bounds?: [number, number];
}

export interface ColorRampCanvasOptions {
  width?: number;
  height?: number;
}

export type InterpolationMode = 'rgb' | 'hsl' | 'hsv';

export interface ScaleColor {
  rgb(): [number, number, number];
  rgba(): [number, number, number, number];
  hex(): string;
  css(): string;
}

export interface Scale {
  (value: number | null | undefined): ScaleColor;
  domain(): number[];
  colors(count?: number, format?: string): string[];
}

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const DEFAULT_MODE: InterpolationMode = 'rgb';
const LINE_SEPARATOR_REGEX = /[ ,\t:]+/g;
const COLOR_SEPARATOR_REGEX = /[-\/]/g;

const NAMED_COLOR_PACK =
  'aliceblue:f0f8ff,antiquewhite:faebd7,aqua:00ffff,aquamarine:7fffd4,azure:f0ffff,beige:f5f5dc,bisque:ffe4c4,black:000000,blanchedalmond:ffebcd,blue:0000ff,blueviolet:8a2be2,brown:a52a2a,burlywood:deb887,cadetblue:5f9ea0,chartreuse:7fff00,chocolate:d2691e,coral:ff7f50,cornflowerblue:6495ed,cornsilk:fff8dc,crimson:dc143c,cyan:00ffff,darkblue:00008b,darkcyan:008b8b,darkgoldenrod:b8860b,darkgray:a9a9a9,darkgreen:006400,darkgrey:a9a9a9,darkkhaki:bdb76b,darkmagenta:8b008b,darkolivegreen:556b2f,darkorange:ff8c00,darkorchid:9932cc,darkred:8b0000,darksalmon:e9967a,darkseagreen:8fbc8f,darkslateblue:483d8b,darkslategray:2f4f4f,darkslategrey:2f4f4f,darkturquoise:00ced1,darkviolet:9400d3,deeppink:ff1493,deepskyblue:00bfff,dimgray:696969,dimgrey:696969,dodgerblue:1e90ff,firebrick:b22222,floralwhite:fffaf0,forestgreen:228b22,fuchsia:ff00ff,gainsboro:dcdcdc,ghostwhite:f8f8ff,gold:ffd700,goldenrod:daa520,gray:808080,green:008000,greenyellow:adff2f,grey:808080,honeydew:f0fff0,hotpink:ff69b4,indianred:cd5c5c,indigo:4b0082,ivory:fffff0,khaki:f0e68c,lavender:e6e6fa,lavenderblush:fff0f5,lawngreen:7cfc00,lemonchiffon:fffacd,lightblue:add8e6,lightcoral:f08080,lightcyan:e0ffff,lightgoldenrodyellow:fafad2,lightgray:d3d3d3,lightgreen:90ee90,lightgrey:d3d3d3,lightpink:ffb6c1,lightsalmon:ffa07a,lightseagreen:20b2aa,lightskyblue:87cefa,lightslategray:778899,lightslategrey:778899,lightsteelblue:b0c4de,lightyellow:ffffe0,lime:00ff00,limegreen:32cd32,linen:faf0e6,magenta:ff00ff,maroon:800000,mediumaquamarine:66cdaa,mediumblue:0000cd,mediumorchid:ba55d3,mediumpurple:9370db,mediumseagreen:3cb371,mediumslateblue:7b68ee,mediumspringgreen:00fa9a,mediumturquoise:48d1cc,mediumvioletred:c71585,midnightblue:191970,mintcream:f5fffa,mistyrose:ffe4e1,moccasin:ffe4b5,navajowhite:ffdead,navy:000080,oldlace:fdf5e6,olive:808000,olivedrab:6b8e23,orange:ffa500,orangered:ff4500,orchid:da70d6,palegoldenrod:eee8aa,palegreen:98fb98,paleturquoise:afeeee,palevioletred:db7093,papayawhip:ffefd5,peachpuff:ffdab9,peru:cd853f,pink:ffc0cb,plum:dda0dd,powderblue:b0e0e6,purple:800080,rebeccapurple:663399,red:ff0000,rosybrown:bc8f8f,royalblue:4169e1,saddlebrown:8b4513,salmon:fa8072,sandybrown:f4a460,seagreen:2e8b57,seashell:fff5ee,sienna:a0522d,silver:c0c0c0,skyblue:87ceeb,slateblue:6a5acd,slategray:708090,slategrey:708090,snow:fffafa,springgreen:00ff7f,steelblue:4682b4,tan:d2b48c,teal:008080,thistle:d8bfd8,tomato:ff6347,turquoise:40e0d0,violet:ee82ee,wheat:f5deb3,white:ffffff,whitesmoke:f5f5f5,yellow:ffff00,yellowgreen:9acd32';

const NAMED_COLORS = new Map<string, Rgba>();
for (const entry of NAMED_COLOR_PACK.split(',')) {
  const colon = entry.indexOf(':');
  NAMED_COLORS.set(entry.slice(0, colon), parseHex(entry.slice(colon + 1)));
}
NAMED_COLORS.set('transparent', {r: 0, g: 0, b: 0, a: 0});

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseHex(hex: string): Rgba {
  const raw = hex.startsWith('#') ? hex.slice(1) : hex;
  if (raw.length === 3 || raw.length === 4) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    const a = raw.length === 4 ? parseInt(raw[3] + raw[3], 16) / 255 : 1;
    return {r, g, b, a};
  }
  if (raw.length === 6 || raw.length === 8) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    const a = raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1;
    return {r, g, b, a};
  }
  throw new Error(`Invalid color ${hex}`);
}

function parseRgbFunction(color: string): Rgba | null {
  const match = color.match(/^\s*rgba?\s*\(\s*([^)]+)\)\s*$/i);
  if (!match) {
    return null;
  }
  const parts = match[1].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) {
    return null;
  }
  const channel = (part: string): number => {
    if (part.endsWith('%')) {
      return clamp(parseFloat(part) / 100, 0, 1) * 255;
    }
    return parseFloat(part);
  };
  const r = channel(parts[0]);
  const g = channel(parts[1]);
  const b = channel(parts[2]);
  const a = parts.length === 4 ? parseFloat(parts[3]) : 1;
  if ([r, g, b, a].some((n) => Number.isNaN(n))) {
    return null;
  }
  return {r, g, b, a};
}

function parseCssColor(color: string): Rgba {
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    return parseHex(trimmed);
  }
  const rgb = parseRgbFunction(trimmed);
  if (rgb) {
    return rgb;
  }
  const named = NAMED_COLORS.get(trimmed.toLowerCase());
  if (named) {
    return {...named};
  }
  throw new Error(`Invalid color ${color}`);
}

function unitInterval(value: number): number {
  return value > 1 ? value / 100 : value;
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const sat = clamp(unitInterval(s), 0, 1);
  const val = clamp(unitInterval(v), 0, 1);
  const hue = ((h % 360) + 360) % 360;
  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) {
    r = c; g = x;
  } else if (hue < 120) {
    r = x; g = c;
  } else if (hue < 180) {
    g = c; b = x;
  } else if (hue < 240) {
    g = x; b = c;
  } else if (hue < 300) {
    r = x; b = c;
  } else {
    r = c; b = x;
  }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) {
      h = 60 * (((gn - bn) / d) % 6);
    } else if (max === gn) {
      h = 60 * ((bn - rn) / d + 2);
    } else {
      h = 60 * ((rn - gn) / d + 4);
    }
  }
  if (h < 0) {
    h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sat = clamp(unitInterval(s), 0, 1);
  const lig = clamp(unitInterval(l), 0, 1);
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) {
    r = c; g = x;
  } else if (hue < 120) {
    r = x; g = c;
  } else if (hue < 180) {
    g = c; b = x;
  } else if (hue < 240) {
    g = x; b = c;
  } else if (hue < 300) {
    r = x; b = c;
  } else {
    r = c; b = x;
  }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) {
    return [0, 0, l];
  }
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === rn) {
    h = 60 * (((gn - bn) / d) % 6);
  } else if (max === gn) {
    h = 60 * ((bn - rn) / d + 2);
  } else {
    h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) {
    h += 360;
  }
  return [h, s, l];
}

function channelsToRgba(c0: number, c1: number, c2: number, a: number, mode: InterpolationMode): Rgba {
  if (mode === 'hsv') {
    const [r, g, b] = hsvToRgb(c0, c1, c2);
    return {r, g, b, a};
  }
  if (mode === 'hsl') {
    const [r, g, b] = hslToRgb(c0, c1, c2);
    return {r, g, b, a};
  }
  return {r: c0, g: c1, b: c2, a};
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHue(h1: number, h2: number, t: number): number {
  let dh = h2 - h1;
  if (dh > 180) {
    dh -= 360;
  } else if (dh < -180) {
    dh += 360;
  }
  return ((h1 + dh * t) + 360) % 360;
}

function interpolate(a: Rgba, b: Rgba, t: number, mode: InterpolationMode): Rgba {
  const tt = clamp(t, 0, 1);
  const alpha = lerp(a.a, b.a, tt);
  if (mode === 'hsv') {
    const [h1, s1, v1] = rgbToHsv(a.r, a.g, a.b);
    const [h2, s2, v2] = rgbToHsv(b.r, b.g, b.b);
    const [r, g, bl] = hsvToRgb(lerpHue(h1, h2, tt), lerp(s1, s2, tt), lerp(v1, v2, tt));
    return {r, g, b: bl, a: alpha};
  }
  if (mode === 'hsl') {
    const [h1, s1, l1] = rgbToHsl(a.r, a.g, a.b);
    const [h2, s2, l2] = rgbToHsl(b.r, b.g, b.b);
    const [r, g, bl] = hslToRgb(lerpHue(h1, h2, tt), lerp(s1, s2, tt), lerp(l1, l2, tt));
    return {r, g, b: bl, a: alpha};
  }
  return {
    r: lerp(a.r, b.r, tt),
    g: lerp(a.g, b.g, tt),
    b: lerp(a.b, b.b, tt),
    a: alpha,
  };
}

function toScaleColor(color: Rgba): ScaleColor {
  const rgb = (): [number, number, number] => [color.r, color.g, color.b];
  const rgba = (): [number, number, number, number] => [color.r, color.g, color.b, color.a];
  const hex = (): string => {
    const channel = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
    const rgbHex = `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
    if (color.a >= 1) {
      return rgbHex;
    }
    return `${rgbHex}${channel(color.a * 255)}`;
  };
  const css = (): string => {
    const r = clamp(Math.round(color.r), 0, 255);
    const g = clamp(Math.round(color.g), 0, 255);
    const b = clamp(Math.round(color.b), 0, 255);
    if (color.a >= 1) {
      return `rgb(${r}, ${g}, ${b})`;
    }
    const a = Math.round(color.a * 1000) / 1000;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  return {rgb, rgba, hex, css};
}

function formatColor(color: Rgba, format: string): string {
  const scaleColor = toScaleColor(color);
  if (format === 'css') {
    return scaleColor.css();
  }
  if (format === 'rgb') {
    return `rgb(${scaleColor.rgb().map((c) => clamp(Math.round(c), 0, 255)).join(', ')})`;
  }
  return scaleColor.hex();
}

function sample(value: number, domain: number[], colors: Rgba[], mode: InterpolationMode): Rgba {
  if (value <= domain[0]) {
    return colors[0];
  }
  const last = domain.length - 1;
  if (value >= domain[last]) {
    return colors[last];
  }
  let i = 0;
  while (i < last - 1 && value >= domain[i + 1]) {
    i += 1;
  }
  const span = domain[i + 1] - domain[i];
  const t = span === 0 ? 1 : (value - domain[i]) / span;
  return interpolate(colors[i], colors[i + 1], t, mode);
}

function createScale(stops: Array<{value: number; color: Rgba}>, mode: InterpolationMode, nodata?: Rgba): Scale {
  const ordered = [...stops].sort((a, b) => a.value - b.value);
  const domain = ordered.map((stop) => stop.value);
  const colors = ordered.map((stop) => stop.color);
  const fallback = nodata ?? {r: 0, g: 0, b: 0, a: 1};

  const scale = ((value: number | null | undefined) => {
    if (value == null || Number.isNaN(Number(value))) {
      return toScaleColor(fallback);
    }
    if (domain.length === 0) {
      return toScaleColor(fallback);
    }
    if (domain.length === 1) {
      return toScaleColor(colors[0]);
    }
    return toScaleColor(sample(Number(value), domain, colors, mode));
  }) as Scale;

  scale.domain = () => domain.slice();
  scale.colors = (count?: number, format = 'hex') => {
    const sampled = count == null
      ? colors
      : Array.from({length: count}, (_, i) => {
        if (domain.length === 0) {
          return fallback;
        }
        if (count === 1) {
          return sample((domain[0] + domain[domain.length - 1]) / 2, domain, colors, mode);
        }
        const t = i / (count - 1);
        const value = domain[0] + t * (domain[domain.length - 1] - domain[0]);
        return sample(value, domain, colors, mode);
      });
    return sampled.map((color) => formatColor(color, format));
  };

  return scale;
}

function parseValue(value: string | number, bounds: [number, number]): number | null | undefined {
  if (typeof value === 'string') {
    if (value[value.length - 1] === '%') {
      const percentage = parseFloat(value) / 100;
      if (percentage < 0 || percentage > 1) {
        throw new Error(`Invalid value for a percentage ${value}`);
      }
      return bounds[0] + (bounds[1] - bounds[0]) * percentage;
    }
    if (value === 'N' || value === 'nv' || value === 'null' || value === 'nodata') {
      return null;
    }
    if (value === 'B' || value === 'F' || value === 'default') {
      return undefined;
    }
    return parseFloat(value);
  }
  if (typeof value === 'number') {
    return value;
  }
  throw new Error('Invalid state');
}

function parseColor(color: PaletteColor, mode: InterpolationMode): Rgba {
  if (Array.isArray(color)) {
    if (color.length !== 3 && color.length !== 4) {
      throw new Error(`Invalid color ${color}`);
    }
    const c0 = parseFloat(color[0].toString());
    const c1 = parseFloat(color[1].toString());
    const c2 = parseFloat(color[2].toString());
    const a = color.length === 4 ? parseFloat(color[3].toString()) / 255 : 1;
    return channelsToRgba(c0, c1, c2, a, mode);
  }
  if (typeof color === 'string' || typeof color === 'number') {
    if (/^\d+$/.test(color.toString()) || typeof color === 'number') {
      const gray = parseFloat(color.toString());
      return channelsToRgba(gray, gray, gray, 1, mode);
    }
    return parseCssColor(color.toString());
  }
  throw new Error(`Invalid color ${color}`);
}

function isLineComment(line: string): boolean {
  return line.startsWith('#');
}

function isGmt4Text(lines: string[]): boolean {
  return lines.some((line) => !isLineComment(line) && line.split(LINE_SEPARATOR_REGEX).length >= 8);
}

function isGmt5Text(lines: string[]): boolean {
  return lines.some((line) => !isLineComment(line) && (/\d+-\d+-\d+/.test(line) || /\d+\/\d+\/\d+/.test(line)));
}

function getMode(lines: string[]): InterpolationMode | undefined {
  const modeLine = lines.find((line) => isLineComment(line) && line.includes('COLOR_MODEL = '));
  if (!modeLine) {
    return undefined;
  }
  const match = modeLine.match(/COLOR_MODEL = ([a-zA-Z]+)/);
  if (!match) {
    return undefined;
  }
  const mode = match[1].toLowerCase();
  if (mode === 'rgb' || mode === 'hsl' || mode === 'hsv') {
    return mode;
  }
  return undefined;
}

function splitColor(color: string): PaletteColor {
  const colorArray = color.split(COLOR_SEPARATOR_REGEX);
  return colorArray.length === 1 ? colorArray[0] : colorArray as PaletteColor;
}

function parsePaletteTextInternal(paletteText: string): {paletteArray: PaletteArray; mode?: InterpolationMode} {
  const lines = paletteText.trim().split('\n');
  const isGmt4 = isGmt4Text(lines);
  const isGmt5 = isGmt5Text(lines);
  const mode = getMode(lines);
  const paletteArray: PaletteArray = [];

  for (const paletteLine of lines.filter((line) => line && !line.startsWith('#'))) {
    const fields = paletteLine.split(LINE_SEPARATOR_REGEX);
    if (isGmt4) {
      if (fields.length === 8 || fields.length === 9) {
        paletteArray.push([fields[0], [fields[1], fields[2], fields[3]]]);
        paletteArray.push([fields[4], [fields[5], fields[6], fields[7]]]);
      } else if (fields.length === 4 || fields.length === 5) {
        paletteArray.push([fields[0], [fields[1], fields[2], fields[3]]]);
      }
    } else if (isGmt5) {
      if (fields.length === 4 || fields.length === 5) {
        paletteArray.push([fields[0], splitColor(fields[1])]);
        paletteArray.push([fields[2], splitColor(fields[3])]);
      } else if (fields.length === 2 || fields.length === 3) {
        paletteArray.push([fields[0], splitColor(fields[1])]);
      }
    } else if (fields.length === 5) {
      paletteArray.push([fields[0], [fields[1], fields[2], fields[3], fields[4]]]);
    } else if (fields.length === 4) {
      paletteArray.push([fields[0], [fields[1], fields[2], fields[3]]]);
    } else if (fields.length === 2) {
      paletteArray.push([fields[0], fields[1]]);
    }
  }

  return {paletteArray, mode};
}

function parsePaletteArray(
  paletteArray: PaletteArray,
  {bounds = [0, 1], mode = DEFAULT_MODE}: ParseOptions & {mode?: InterpolationMode} = {},
): Scale {
  const stops: Array<{value: number; color: Rgba}> = [];
  let nodata: Rgba | undefined;

  for (const [value, color] of paletteArray) {
    const parsedValue = parseValue(value, bounds);
    const parsedColor = parseColor(color, mode);
    if (parsedValue != null) {
      stops.push({value: parsedValue, color: parsedColor});
    } else if (parsedValue === null) {
      nodata = parsedColor;
    }
  }

  return createScale(stops, mode, nodata);
}

function parsePaletteText(paletteText: string, {bounds = [0, 1]}: ParseOptions = {}): Scale {
  const {paletteArray, mode} = parsePaletteTextInternal(paletteText);
  return parsePaletteArray(paletteArray, {bounds, mode});
}

export function parsePalette(palette: Palette, {bounds = [0, 1]}: ParseOptions = {}): Scale {
  if (typeof palette === 'string') {
    return parsePaletteText(palette, {bounds});
  }
  if (Array.isArray(palette)) {
    return parsePaletteArray(palette, {bounds});
  }
  throw new Error('Invalid format');
}

export function colorRampCanvas(scale: Scale, {width = 256, height = 1}: ColorRampCanvasOptions = {}): HTMLCanvasElement {
  const colors = scale.colors(width, 'css');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.imageRendering = '-moz-crisp-edges';
  canvas.style.imageRendering = 'pixelated';

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  for (let i = 0; i < width; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(i, 0, 1, height);
  }

  return canvas;
}
