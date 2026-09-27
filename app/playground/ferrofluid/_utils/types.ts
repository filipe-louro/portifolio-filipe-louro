export type FerrofluidPreset = 'rosensweig' | 'dipole' | 'vortex' | 'relax' | 'extreme';

export interface MagnetPole {
    id: string;
    x: number;
    y: number;
    strength: number; // positive = North, negative = South
    radius: number;
}

export interface FerrofluidConfig {
    fieldStrength: number;
    viscosity: number;
    spikeSharpness: number;
    surfaceTension: number;
    dropletDensity: number;
    showFieldLines: boolean;
    showPoles: boolean;
    metallicSheen: boolean;
    preset: FerrofluidPreset;
}

export const FERROFLUID_PRESETS: Record<FerrofluidPreset, {
    name: string;
    description: string;
    config: Omit<FerrofluidConfig, 'preset' | 'showFieldLines' | 'showPoles'>;
}> = {
    rosensweig: {
        name: 'Instabilidade de Rosensweig',
        description: 'Espinhas cônicas clássicas formadas pelo limiar crítico de campo magnético.',
        config: {
            fieldStrength: 1.4,
            viscosity: 0.88,
            spikeSharpness: 1.6,
            surfaceTension: 0.75,
            dropletDensity: 1.0,
            metallicSheen: true,
        },
    },
    dipole: {
        name: 'Dipolo Magnético N-S',
        description: 'Dois pólos opostos gerando pontes e curvas de fluxo magnético interligadas.',
        config: {
            fieldStrength: 1.8,
            viscosity: 0.82,
            spikeSharpness: 2.0,
            surfaceTension: 0.65,
            dropletDensity: 1.2,
            metallicSheen: true,
        },
    },
    vortex: {
        name: 'Vórtice Magnético',
        description: 'Rotação contínua e turbilhonamento do fluido com alta viscosidade.',
        config: {
            fieldStrength: 2.2,
            viscosity: 0.95,
            spikeSharpness: 2.4,
            surfaceTension: 0.5,
            dropletDensity: 1.4,
            metallicSheen: true,
        },
    },
    relax: {
        name: 'Relaxação Suave',
        description: 'Baixo campo magnético: o ferrofluido retorna ao estado de gota líquida.',
        config: {
            fieldStrength: 0.6,
            viscosity: 0.92,
            spikeSharpness: 0.5,
            surfaceTension: 0.9,
            dropletDensity: 0.8,
            metallicSheen: true,
        },
    },
    extreme: {
        name: 'Super-Condutividade Flux',
        description: 'Campo magnético saturado com espinhos hiper-afiados e projeção extrema.',
        config: {
            fieldStrength: 2.8,
            viscosity: 0.78,
            spikeSharpness: 3.0,
            surfaceTension: 0.4,
            dropletDensity: 1.6,
            metallicSheen: true,
        },
    },
};

export const DEFAULT_FERROFLUID_CONFIG: FerrofluidConfig = {
    fieldStrength: FERROFLUID_PRESETS.rosensweig.config.fieldStrength,
    viscosity: FERROFLUID_PRESETS.rosensweig.config.viscosity,
    spikeSharpness: FERROFLUID_PRESETS.rosensweig.config.spikeSharpness,
    surfaceTension: FERROFLUID_PRESETS.rosensweig.config.surfaceTension,
    dropletDensity: FERROFLUID_PRESETS.rosensweig.config.dropletDensity,
    showFieldLines: true,
    showPoles: true,
    metallicSheen: true,
    preset: 'rosensweig',
};
