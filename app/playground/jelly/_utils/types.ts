export type JellyPresetName = 'bouncy' | 'hyper' | 'mercury' | 'waterballoon' | 'zerog';

export interface JellyConfig {
    pressure: number;
    stiffness: number;
    damping: number;
    gravity: number;
    radius: number;
    showSkeleton: boolean;
    showObstacles: boolean;
    preset: JellyPresetName;
}

export const JELLY_PRESETS: Record<JellyPresetName, { name: string; description: string; config: Omit<JellyConfig, 'preset' | 'showSkeleton' | 'showObstacles'> }> = {
    bouncy: {
        name: 'Gelatina Bouncy',
        description: 'Equilíbrio clássico de elasticidade e retenção volumétrica.',
        config: {
            pressure: 1.2,
            stiffness: 0.45,
            damping: 0.982,
            gravity: 0.28,
            radius: 110,
        },
    },
    hyper: {
        name: 'Hiper Elástico',
        description: 'Vibração rápida, ricochete enérgico e jiggle prolongado.',
        config: {
            pressure: 1.8,
            stiffness: 0.75,
            damping: 0.994,
            gravity: 0.32,
            radius: 95,
        },
    },
    mercury: {
        name: 'Gota de Mercúrio',
        description: 'Alta tensão superficial, massa densa e deformação viscosa.',
        config: {
            pressure: 2.2,
            stiffness: 0.6,
            damping: 0.94,
            gravity: 0.42,
            radius: 100,
        },
    },
    waterballoon: {
        name: 'Balão d’Água',
        description: 'Parede maleável com onda interna e grande achatamento no impacto.',
        config: {
            pressure: 0.85,
            stiffness: 0.22,
            damping: 0.975,
            gravity: 0.30,
            radius: 120,
        },
    },
    zerog: {
        name: 'Gravidade Zero',
        description: 'Flutuação orbital no espaço reagindo puramente a impulsos e toques.',
        config: {
            pressure: 1.4,
            stiffness: 0.5,
            damping: 0.99,
            gravity: 0.0,
            radius: 115,
        },
    },
};

export const DEFAULT_JELLY_CONFIG: JellyConfig = {
    pressure: JELLY_PRESETS.bouncy.config.pressure,
    stiffness: JELLY_PRESETS.bouncy.config.stiffness,
    damping: JELLY_PRESETS.bouncy.config.damping,
    gravity: JELLY_PRESETS.bouncy.config.gravity,
    radius: JELLY_PRESETS.bouncy.config.radius,
    showSkeleton: false,
    showObstacles: true,
    preset: 'bouncy',
};
