import { ColorMode } from './types';

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: return [v, t, p];
        case 1: return [q, v, p];
        case 2: return [p, v, t];
        case 3: return [p, q, v];
        case 4: return [t, p, v];
        default: return [v, p, q];
    }
}

export function nextSplatColor(mode: ColorMode, hueRef: { current: number }): [number, number, number] {
    switch (mode) {
        case 'rainbow':
            hueRef.current = (hueRef.current + 0.035) % 1;
            return hsvToRgb(hueRef.current, 0.85, 1);
        case 'neon':
            return hsvToRgb((0.75 + Math.random() * 0.3) % 1, 1, 1);
        case 'fire':
            return hsvToRgb(Math.random() * 0.12, 0.95, 1);
        case 'ocean':
            return hsvToRgb(0.5 + Math.random() * 0.12, 0.8, 1);
        case 'monochrome':
            return hsvToRgb(0.58, 0.12, 1);
    }
}
