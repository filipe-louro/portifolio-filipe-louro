export type MorphogenesisPresetName = 'mitosis' | 'labyrinth' | 'spots' | 'corals' | 'solitons';
export type ColorPalette = 'electric' | 'biolum' | 'thermal' | 'obsidian';

export interface MorphogenesisConfig {
    feed: number;
    kill: number;
    diffU: number;
    diffV: number;
    speed: number;
    brushRadius: number;
    palette: ColorPalette;
    bumpLight: boolean;
    preset: MorphogenesisPresetName;
}

export const MORPHOGENESIS_PRESETS: Record<MorphogenesisPresetName, { name: string; description: string; config: Partial<MorphogenesisConfig> }> = {
    mitosis: {
        name: 'Mitose Celular',
        description: 'Células individuais que crescem, dividem e formam colônias vivas.',
        config: {
            feed: 0.0367,
            kill: 0.0649,
            diffU: 0.2097,
            diffV: 0.105,
            speed: 8,
        },
    },
    labyrinth: {
        name: 'Labirinto de Turing',
        description: 'Estruturas vermiformes e sulcos convolutos autorregulados.',
        config: {
            feed: 0.029,
            kill: 0.057,
            diffU: 0.2097,
            diffV: 0.105,
            speed: 8,
        },
    },
    spots: {
        name: 'Manchas de Leopardo',
        description: 'Padrão estável de gotas pigmentares isoladas em equilíbrio dinâmico.',
        config: {
            feed: 0.038,
            kill: 0.061,
            diffU: 0.2097,
            diffV: 0.105,
            speed: 8,
        },
    },
    corals: {
        name: 'Corais & Espirais',
        description: 'Ramificações dendríticas marinhas e frentes de onda espirais.',
        config: {
            feed: 0.0545,
            kill: 0.062,
            diffU: 0.2097,
            diffV: 0.105,
            speed: 8,
        },
    },
    solitons: {
        name: 'Solitons Caóticos',
        description: 'Pulsos solitários colidindo e aniquilando em meio reativo.',
        config: {
            feed: 0.014,
            kill: 0.054,
            diffU: 0.2097,
            diffV: 0.105,
            speed: 9,
        },
    },
};

export const DEFAULT_MORPHOGENESIS_CONFIG: MorphogenesisConfig = {
    feed: 0.0367,
    kill: 0.0649,
    diffU: 0.2097,
    diffV: 0.105,
    speed: 8,
    brushRadius: 28,
    palette: 'electric',
    bumpLight: true,
    preset: 'mitosis',
};
