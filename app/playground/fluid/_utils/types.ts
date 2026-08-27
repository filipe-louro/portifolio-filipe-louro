export type ColorMode = 'rainbow' | 'neon' | 'fire' | 'ocean' | 'monochrome';

export interface FluidConfig {
    brushSize: number;
    force: number;
    viscosity: number;
    dissipation: number;
    pressureIterations: number;
    vorticity: number;
    colorMode: ColorMode;
}

export interface RangeSpec {
    label: string;
    min: number;
    max: number;
    step: number;
}

export const CONFIG_RANGES: Record<Exclude<keyof FluidConfig, 'colorMode'>, RangeSpec> = {
    brushSize: { label: 'Brush Size', min: 1, max: 25, step: 0.5 },
    force: { label: 'Force', min: 500, max: 15000, step: 100 },
    viscosity: { label: 'Viscosity', min: 0, max: 2, step: 0.05 },
    dissipation: { label: 'Dissipation', min: 0, max: 2, step: 0.05 },
    pressureIterations: { label: 'Pressure', min: 0, max: 40, step: 1 },
    vorticity: { label: 'Vorticity', min: 0, max: 50, step: 1 },
};

export const COLOR_MODE_OPTIONS: { value: ColorMode; label: string }[] = [
    { value: 'rainbow', label: 'Rainbow' },
    { value: 'neon', label: 'Neon' },
    { value: 'fire', label: 'Fire' },
    { value: 'ocean', label: 'Ocean' },
    { value: 'monochrome', label: 'Monochrome' },
];

export const DEFAULT_CONFIG: FluidConfig = {
    brushSize: 10,
    force: 6000,
    viscosity: 0.4,
    dissipation: 0.6,
    pressureIterations: 20,
    vorticity: 18,
    colorMode: 'neon',
};

export type PresetName = 'smoke' | 'ink' | 'vortex' | 'plasma' | 'calm';
