export type InkPreset = 'rayleigh-taylor' | 'turbulent' | 'chromatic' | 'abyssal' | 'collision';

export type InkTool = 'drop' | 'stream' | 'stir';

export interface InkColorPalette {
    name: string;
    colors: [number, number, number][]; // RGB tuples
}

export const INK_PALETTES: Record<string, InkColorPalette> = {
    aurora: {
        name: 'Aurora Boreal',
        colors: [
            [34, 211, 238],  // cyan
            [168, 85, 247],  // purple
            [236, 72, 153],  // pink
            [52, 211, 153],  // emerald
        ],
    },
    abyssal: {
        name: 'Abissal & Dourado',
        colors: [
            [245, 158, 11],  // amber gold
            [59, 130, 246],  // royal blue
            [244, 63, 94],   // rose
            [250, 204, 21],  // bright yellow
        ],
    },
    monochrome: {
        name: 'Nanquim Clássico',
        colors: [
            [15, 23, 42],    // slate black
            [51, 65, 85],    // charcoal
            [148, 163, 184], // liquid silver
            [226, 232, 240], // mist white
        ],
    },
    neon: {
        name: 'Cyberpunk Neon',
        colors: [
            [0, 255, 200],   // neon teal
            [255, 0, 128],   // neon magenta
            [130, 0, 255],   // neon violet
            [255, 230, 0],   // neon yellow
        ],
    },
};

export interface InkConfig {
    buoyancy: number;      // sinking force
    viscosity: number;     // damping / thickness
    vorticity: number;     // curling strength
    diffusion: number;     // particle spreading
    dropletSize: number;   // size of injected drops
    palette: string;       // active palette key
    tool: InkTool;         // active tool
    preset: InkPreset;
}

export const INK_PRESETS: Record<InkPreset, {
    name: string;
    description: string;
    config: Omit<InkConfig, 'preset' | 'tool'>;
}> = {
    'rayleigh-taylor': {
        name: 'Pluma Rayleigh-Taylor',
        description: 'Gotas densas que afundam criando cogumelos e vórtices bifurcados clássicos.',
        config: {
            buoyancy: 1.4,
            viscosity: 0.982,
            vorticity: 1.8,
            diffusion: 0.35,
            dropletSize: 1.0,
            palette: 'aurora',
        },
    },
    turbulent: {
        name: 'Turbilhão Caótico',
        description: 'Alta vorticidade com rápida mistura e filamentos rodopiantes finos.',
        config: {
            buoyancy: 0.8,
            viscosity: 0.99,
            vorticity: 2.8,
            diffusion: 0.25,
            dropletSize: 0.9,
            palette: 'neon',
        },
    },
    chromatic: {
        name: 'Florescimento Cromático',
        description: 'Baixa gravidade com difusão expansiva em véus e camadas suaves de cor.',
        config: {
            buoyancy: 0.3,
            viscosity: 0.97,
            vorticity: 1.2,
            diffusion: 0.7,
            dropletSize: 1.4,
            palette: 'abyssal',
        },
    },
    abyssal: {
        name: 'Nanquim em Repouso',
        description: 'Tinta densa com alta viscosidade escorrendo em filamentos aveludados.',
        config: {
            buoyancy: 1.8,
            viscosity: 0.94,
            vorticity: 0.8,
            diffusion: 0.15,
            dropletSize: 1.2,
            palette: 'monochrome',
        },
    },
    collision: {
        name: 'Colisão de Jatos',
        description: 'Camadas de cisalhamento que geram ondas de Kelvin-Helmholtz na interface.',
        config: {
            buoyancy: 0.6,
            viscosity: 0.985,
            vorticity: 2.2,
            diffusion: 0.4,
            dropletSize: 1.1,
            palette: 'aurora',
        },
    },
};

export const DEFAULT_INK_CONFIG: InkConfig = {
    buoyancy: INK_PRESETS['rayleigh-taylor'].config.buoyancy,
    viscosity: INK_PRESETS['rayleigh-taylor'].config.viscosity,
    vorticity: INK_PRESETS['rayleigh-taylor'].config.vorticity,
    diffusion: INK_PRESETS['rayleigh-taylor'].config.diffusion,
    dropletSize: INK_PRESETS['rayleigh-taylor'].config.dropletSize,
    palette: 'aurora',
    tool: 'drop',
    preset: 'rayleigh-taylor',
};
