export type PaletteId = 'neon-violet' | 'cyber-gold' | 'emerald-deep' | 'opal';

export interface MandelbulbConfig {
    power: number;
    maxIterations: number;
    palette: PaletteId;
    glow: number;
    autoRotate: boolean;
}

export const DEFAULT_MANDELBULB_CONFIG: MandelbulbConfig = {
    power: 8.0,
    maxIterations: 8,
    palette: 'neon-violet',
    glow: 1.0,
    autoRotate: true,
};
