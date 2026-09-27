export type QualityPreset = 'performance' | 'balanced' | 'cinematic';

export interface BlackHoleConfig {
    quality: QualityPreset;
    beamIntensity: number; // 0.0 to 2.5, padrão 1.0
    diskSpeed: number;     // 0.2 to 2.5, padrão 1.0
    cameraTilt: number;    // -0.8 to 0.8, padrão 0.0
    autoRotate: boolean;   // padrão true
}

export const DEFAULT_CONFIG: BlackHoleConfig = {
    quality: 'balanced',
    beamIntensity: 1.0,
    diskSpeed: 1.0,
    cameraTilt: 0.0,
    autoRotate: true,
};
