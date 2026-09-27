export type SandpileMode = 'granular' | 'abelian';
export type SandPresetName = 'dunes' | 'magma' | 'jade' | 'abelian' | 'hourglass';

export interface SandpileConfig {
    mode: SandpileMode;
    flowRate: number;
    friction: number;
    funnelSize: number;
    kineticGlow: boolean;
    preset: SandPresetName;
}

export const SANDPILE_PRESETS: Record<SandPresetName, { name: string; description: string; config: Partial<SandpileConfig> }> = {
    dunes: {
        name: 'Dunas do Saara',
        description: 'Areia dourada com ângulo natural de repouso (~32°) e avalanches em cascata.',
        config: {
            mode: 'granular',
            flowRate: 8,
            friction: 2,
            funnelSize: 3,
            kineticGlow: true,
        },
    },
    magma: {
        name: 'Brasas Vulcânicas',
        description: 'Fluxo piroclástico incandescente que resfria de branco ardente a magma escuro.',
        config: {
            mode: 'granular',
            flowRate: 12,
            friction: 1,
            funnelSize: 4,
            kineticGlow: true,
        },
    },
    jade: {
        name: 'Jade & Esmeralda',
        description: 'Grãos minerais fosforescentes que fluem com alta fluidez granular.',
        config: {
            mode: 'granular',
            flowRate: 6,
            friction: 3,
            funnelSize: 2,
            kineticGlow: true,
        },
    },
    abelian: {
        name: 'Fractal Bak-Tang',
        description: 'Modelo BTW puro de auto-organização crítica com colapso abeliano em 4 vizinhos.',
        config: {
            mode: 'abelian',
            flowRate: 15,
            friction: 2,
            funnelSize: 1,
            kineticGlow: true,
        },
    },
    hourglass: {
        name: 'Ampulheta com Rampas',
        description: 'Barreiras inclinadas e funis geométricos canalizando o fluxo de grãos.',
        config: {
            mode: 'granular',
            flowRate: 10,
            friction: 2,
            funnelSize: 2,
            kineticGlow: true,
        },
    },
};

export const DEFAULT_SANDPILE_CONFIG: SandpileConfig = {
    mode: 'granular',
    flowRate: 8,
    friction: 2,
    funnelSize: 3,
    kineticGlow: true,
    preset: 'dunes',
};
