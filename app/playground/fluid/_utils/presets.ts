import { CONFIG_RANGES, ColorMode, FluidConfig, PresetName } from './types';

export const FLUID_PRESETS: Record<PresetName, FluidConfig> = {
    smoke: { brushSize: 16, force: 4000, viscosity: 1.2, dissipation: 1.4, pressureIterations: 20, vorticity: 6, colorMode: 'monochrome' },
    ink: { brushSize: 8, force: 7000, viscosity: 0.15, dissipation: 0.15, pressureIterations: 30, vorticity: 12, colorMode: 'ocean' },
    vortex: { brushSize: 7, force: 8500, viscosity: 0.3, dissipation: 0.5, pressureIterations: 26, vorticity: 38, colorMode: 'neon' },
    plasma: { brushSize: 6, force: 11000, viscosity: 0.2, dissipation: 0.4, pressureIterations: 22, vorticity: 20, colorMode: 'fire' },
    calm: { brushSize: 20, force: 2500, viscosity: 1.6, dissipation: 1.0, pressureIterations: 16, vorticity: 3, colorMode: 'rainbow' },
};

export const PRESET_LABELS: Record<PresetName, string> = {
    smoke: 'Smoke',
    ink: 'Ink',
    vortex: 'Vortex',
    plasma: 'Plasma',
    calm: 'Calm',
};

const COLOR_MODES: ColorMode[] = ['rainbow', 'neon', 'fire', 'ocean', 'monochrome'];

function randomInRange(min: number, max: number, step: number): number {
    const steps = Math.round((max - min) / step);
    const value = min + Math.floor(Math.random() * (steps + 1)) * step;
    const decimals = Math.max(0, (step.toString().split('.')[1] || '').length);
    return Number(value.toFixed(decimals));
}

export function randomizeConfig(): FluidConfig {
    return {
        brushSize: randomInRange(CONFIG_RANGES.brushSize.min, CONFIG_RANGES.brushSize.max, CONFIG_RANGES.brushSize.step),
        force: randomInRange(CONFIG_RANGES.force.min, CONFIG_RANGES.force.max, CONFIG_RANGES.force.step),
        viscosity: randomInRange(CONFIG_RANGES.viscosity.min, CONFIG_RANGES.viscosity.max, CONFIG_RANGES.viscosity.step),
        dissipation: randomInRange(CONFIG_RANGES.dissipation.min, CONFIG_RANGES.dissipation.max, CONFIG_RANGES.dissipation.step),
        pressureIterations: randomInRange(CONFIG_RANGES.pressureIterations.min, CONFIG_RANGES.pressureIterations.max, CONFIG_RANGES.pressureIterations.step),
        vorticity: randomInRange(CONFIG_RANGES.vorticity.min, CONFIG_RANGES.vorticity.max, CONFIG_RANGES.vorticity.step),
        colorMode: COLOR_MODES[Math.floor(Math.random() * COLOR_MODES.length)],
    };
}
