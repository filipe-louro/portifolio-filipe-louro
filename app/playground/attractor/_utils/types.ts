export type AttractorType = 'lorenz' | 'aizawa' | 'rossler' | 'thomas' | 'halvorsen';

export interface AttractorConfig {
    type: AttractorType;
    speed: number;          // dt multiplier
    particleCount: number;  // active tracers
    trailPersistence: number; // canvas fade trail
    glowIntensity: number;
    colorScheme: 'fire' | 'aurora' | 'cyber' | 'electric';
    param1: number;         // custom parameter 1 (e.g. sigma / a)
    param2: number;         // custom parameter 2 (e.g. rho / b)
    param3: number;         // custom parameter 3 (e.g. beta / c)
}

export interface AttractorPresetInfo {
    name: string;
    description: string;
    type: AttractorType;
    scale: number;
    defaultParams: [number, number, number];
    paramLabels: [string, string, string];
    paramRanges: [[number, number], [number, number], [number, number]];
}

export const ATTRACTOR_PRESETS: Record<AttractorType, AttractorPresetInfo> = {
    lorenz: {
        name: 'Borboleta de Lorenz',
        description: 'Convecção atmosférica e atrator estranho fundador da teoria do caos.',
        type: 'lorenz',
        scale: 13.0,
        defaultParams: [10.0, 28.0, 8.0 / 3.0],
        paramLabels: ['σ (Prandtl)', 'ρ (Rayleigh)', 'β (Geometria)'],
        paramRanges: [[2, 25], [10, 50], [0.5, 6.0]],
    },
    aizawa: {
        name: 'Nebulosa de Aizawa',
        description: 'Fluxo 3D toroidal esférico com funil e quebra espontânea de simetria.',
        type: 'aizawa',
        scale: 210.0,
        defaultParams: [0.95, 0.7, 0.6],
        paramLabels: ['a (Escala Z)', 'b (Vórtice)', 'c (Constante)'],
        paramRanges: [[0.5, 1.5], [0.2, 1.2], [0.1, 1.0]],
    },
    rossler: {
        name: 'Fita de Rössler',
        description: 'Manifold caótico em formato de fita de Möbius com dobra e estiramento contínuos.',
        type: 'rossler',
        scale: 16.0,
        defaultParams: [0.2, 0.2, 5.7],
        paramLabels: ['a (Dobra)', 'b (Torção)', 'c (Escape)'],
        paramRanges: [[0.05, 0.4], [0.05, 0.4], [2.0, 10.0]],
    },
    thomas: {
        name: 'Labirinto de Thomas',
        description: 'Atrator ciclicamente simétrico composto por funções periódicas tridimensionais.',
        type: 'thomas',
        scale: 65.0,
        defaultParams: [0.208186, 1.0, 1.0],
        paramLabels: ['b (Dissipação)', 'Amplitude', 'Frequência'],
        paramRanges: [[0.1, 0.35], [0.5, 2.0], [0.5, 2.0]],
    },
    halvorsen: {
        name: 'Ciclone de Halvorsen',
        description: 'Três vórtices interligados com simetria cíclica tripla e divergência rápida.',
        type: 'halvorsen',
        scale: 22.0,
        defaultParams: [1.89, 4.0, 1.0],
        paramLabels: ['a (Amortecimento)', 'Acoplamento', 'Escala'],
        paramRanges: [[1.0, 3.0], [2.0, 6.0], [0.5, 2.0]],
    },
};

export const DEFAULT_ATTRACTOR_CONFIG: AttractorConfig = {
    type: 'lorenz',
    speed: 1.0,
    particleCount: 3000,
    trailPersistence: 0.92,
    glowIntensity: 1.2,
    colorScheme: 'aurora',
    param1: ATTRACTOR_PRESETS.lorenz.defaultParams[0],
    param2: ATTRACTOR_PRESETS.lorenz.defaultParams[1],
    param3: ATTRACTOR_PRESETS.lorenz.defaultParams[2],
};
