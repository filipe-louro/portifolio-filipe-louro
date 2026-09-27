export type RipplesPreset = 'double-slit' | 'doppler' | 'dipole' | 'pool-caustics' | 'basin';

export type RipplesTool = 'ripple' | 'emitter' | 'wall';

export interface WaveEmitter {
    id: string;
    x: number;
    y: number;
    frequency: number;
    amplitude: number;
    phase: number;
}

export interface RipplesConfig {
    waveSpeed: number;     // propagation speed c
    damping: number;       // wave energy loss
    causticsIntensity: number; // refraction brightness
    emitterFrequency: number;
    emitterAmplitude: number;
    showObstacles: boolean;
    showCaustics: boolean;
    tool: RipplesTool;
    preset: RipplesPreset;
}

export const RIPPLES_PRESETS: Record<RipplesPreset, {
    name: string;
    description: string;
    config: Omit<RipplesConfig, 'preset' | 'tool'>;
}> = {
    'double-slit': {
        name: 'Interferência de Fenda Dupla',
        description: 'Experimento clássico de Young com barreiras difratoras e franjas de interferência.',
        config: {
            waveSpeed: 0.9,
            damping: 0.994,
            causticsIntensity: 1.5,
            emitterFrequency: 0.16,
            emitterAmplitude: 2.2,
            showObstacles: true,
            showCaustics: true,
        },
    },
    doppler: {
        name: 'Efeito Doppler & Onda de Choque',
        description: 'Emissor oscilante veloz criando compressão de frentes de onda e cone de Mach.',
        config: {
            waveSpeed: 0.75,
            damping: 0.99,
            causticsIntensity: 1.2,
            emitterFrequency: 0.22,
            emitterAmplitude: 2.0,
            showObstacles: false,
            showCaustics: true,
        },
    },
    dipole: {
        name: 'Dipolo Harmônico',
        description: 'Dois emissores com defasagem gerando hipérboles de interferência construtiva.',
        config: {
            waveSpeed: 0.85,
            damping: 0.992,
            causticsIntensity: 1.6,
            emitterFrequency: 0.18,
            emitterAmplitude: 2.0,
            showObstacles: false,
            showCaustics: true,
        },
    },
    'pool-caustics': {
        name: 'Cáusticas de Piscina Solar',
        description: 'Refração subaquática hiper-realista com mosaico de fundo e foco de raios de luz.',
        config: {
            waveSpeed: 0.8,
            damping: 0.988,
            causticsIntensity: 2.2,
            emitterFrequency: 0.12,
            emitterAmplitude: 1.6,
            showObstacles: false,
            showCaustics: true,
        },
    },
    basin: {
        name: 'Bacia Ressonante Circular',
        description: 'Reflexões contínuas em paredes criando nós estacionários de Bessel.',
        config: {
            waveSpeed: 0.92,
            damping: 0.997,
            causticsIntensity: 1.8,
            emitterFrequency: 0.15,
            emitterAmplitude: 1.8,
            showObstacles: true,
            showCaustics: true,
        },
    },
};

export const DEFAULT_RIPPLES_CONFIG: RipplesConfig = {
    waveSpeed: RIPPLES_PRESETS['double-slit'].config.waveSpeed,
    damping: RIPPLES_PRESETS['double-slit'].config.damping,
    causticsIntensity: RIPPLES_PRESETS['double-slit'].config.causticsIntensity,
    emitterFrequency: RIPPLES_PRESETS['double-slit'].config.emitterFrequency,
    emitterAmplitude: RIPPLES_PRESETS['double-slit'].config.emitterAmplitude,
    showObstacles: true,
    showCaustics: true,
    tool: 'ripple',
    preset: 'double-slit',
};
