export type PlateShape = 'square' | 'circle';

export interface ChladniConfig {
    m: number;
    n: number;
    intensity: number;
    particleCount: number;
    shape: PlateShape;
    soundEnabled: boolean;
    soundVolume: number;
}

export const DEFAULT_CHLADNI_CONFIG: ChladniConfig = {
    m: 4,
    n: 2,
    intensity: 1.0,
    particleCount: 16000,
    shape: 'square',
    soundEnabled: false,
    soundVolume: 40,
};
