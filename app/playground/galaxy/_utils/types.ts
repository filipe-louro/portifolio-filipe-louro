export type GalaxyPreset = 'mice' | 'head-on' | 'cannibal' | 'single' | 'triple';

export interface BlackHoleBody {
    id: string;
    mass: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    radius: number;
    color: string;
}

export interface StarParticle {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    galaxyId: number; // 0 for primary (blue), 1 for secondary (gold), 2 for tertiary
    mass: number;
    size: number;
    brightness: number;
    prevX: number;
    prevY: number;
}

export interface GalaxyConfig {
    darkMatterHalo: number;  // halo mass multiplier
    gravityConstant: number; // G
    timeStep: number;        // dt
    starCount: number;       // total simulated stars
    softening: number;       // Plummer softening epsilon
    showVelocityTrails: boolean;
    preset: GalaxyPreset;
}

export const GALAXY_PRESETS: Record<GalaxyPreset, {
    name: string;
    description: string;
    config: Omit<GalaxyConfig, 'preset'>;
}> = {
    mice: {
        name: 'Galáxias do Rato (Tidal Tails)',
        description: 'Passagem rasante parabólica de duas galáxias espirais gerando imensas caudas de maré.',
        config: {
            darkMatterHalo: 1.4,
            gravityConstant: 1.0,
            timeStep: 0.9,
            starCount: 3000,
            softening: 14.0,
            showVelocityTrails: true,
        },
    },
    'head-on': {
        name: 'Colisão Frontal (Roda de Carroça)',
        description: 'Impacto direto no disco central que dispara ondas de choque radiais em formato de anel estelar.',
        config: {
            darkMatterHalo: 1.2,
            gravityConstant: 1.1,
            timeStep: 0.8,
            starCount: 3200,
            softening: 12.0,
            showVelocityTrails: true,
        },
    },
    cannibal: {
        name: 'Canibalismo Galáctico',
        description: 'Galáxia elíptica massiva engolindo e esticando uma galáxia anã espiral por forças de maré.',
        config: {
            darkMatterHalo: 1.8,
            gravityConstant: 1.0,
            timeStep: 0.85,
            starCount: 2800,
            softening: 15.0,
            showVelocityTrails: true,
        },
    },
    single: {
        name: 'Via Láctea Isolada',
        description: 'Disco espiral estável em equilíbrio com curva de rotação plana mantida por matéria escura.',
        config: {
            darkMatterHalo: 1.5,
            gravityConstant: 1.0,
            timeStep: 0.7,
            starCount: 3000,
            softening: 16.0,
            showVelocityTrails: false,
        },
    },
    triple: {
        name: 'Caos Tri-Galáctico',
        description: 'Dança gravitacional de três núcleos de buracos negros supermassivos com ejeções estelares.',
        config: {
            darkMatterHalo: 1.3,
            gravityConstant: 1.2,
            timeStep: 0.85,
            starCount: 3600,
            softening: 14.0,
            showVelocityTrails: true,
        },
    },
};

export const DEFAULT_GALAXY_CONFIG: GalaxyConfig = {
    darkMatterHalo: GALAXY_PRESETS.mice.config.darkMatterHalo,
    gravityConstant: GALAXY_PRESETS.mice.config.gravityConstant,
    timeStep: GALAXY_PRESETS.mice.config.timeStep,
    starCount: GALAXY_PRESETS.mice.config.starCount,
    softening: GALAXY_PRESETS.mice.config.softening,
    showVelocityTrails: true,
    preset: 'mice',
};
