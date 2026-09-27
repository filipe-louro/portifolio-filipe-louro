export type PhysarumPresetName = 'tokyo' | 'rhizome' | 'spiral' | 'maze' | 'microbiome';
export type PhysarumColorMode = 'lime' | 'coral' | 'cyan';

export interface FoodNode {
    x: number;
    y: number;
    radius: number;
    strength: number;
}

export interface PhysarumConfig {
    sensorAngle: number;
    sensorOffset: number;
    turnSpeed: number;
    stepSize: number;
    evaporationRate: number;
    diffusionRate: number;
    agentCount: number;
    colorMode: PhysarumColorMode;
    showFood: boolean;
    preset: PhysarumPresetName;
}

export const PHYSARUM_PRESETS: Record<PhysarumPresetName, { name: string; description: string; config: Partial<PhysarumConfig> }> = {
    tokyo: {
        name: 'Rede Rodoviária de Tóquio',
        description: 'Auto-organização que replica a malha ferroviária japonesa conectando nós de nutrientes.',
        config: {
            sensorAngle: 0.45,
            sensorOffset: 12,
            turnSpeed: 0.55,
            stepSize: 1.6,
            evaporationRate: 0.08,
            agentCount: 45000,
        },
    },
    rhizome: {
        name: 'Crescimento Rizomático',
        description: 'Veias tubulares espessas e micélio filamentoso com alta coesão estrutural.',
        config: {
            sensorAngle: 0.35,
            sensorOffset: 18,
            turnSpeed: 0.40,
            stepSize: 1.4,
            evaporationRate: 0.05,
            agentCount: 50000,
        },
    },
    spiral: {
        name: 'Galáxia Espiral',
        description: 'Turbilhões orgânicos e filamentos helicoidais em vórtices contínuos.',
        config: {
            sensorAngle: 1.1,
            sensorOffset: 16,
            turnSpeed: 0.85,
            stepSize: 2.2,
            evaporationRate: 0.09,
            agentCount: 40000,
        },
    },
    maze: {
        name: 'Labirinto Quimiotático',
        description: 'Forrageamento de alta sensibilidade explorando caminhos mínimos em frentes capilares.',
        config: {
            sensorAngle: 0.60,
            sensorOffset: 9,
            turnSpeed: 0.65,
            stepSize: 1.8,
            evaporationRate: 0.12,
            agentCount: 45000,
        },
    },
    microbiome: {
        name: 'Microbioma Caótico',
        description: 'Alta entropia e rápida renovação de trilhas com dinâmica biomórfica fervilhante.',
        config: {
            sensorAngle: 0.80,
            sensorOffset: 6,
            turnSpeed: 0.95,
            stepSize: 2.5,
            evaporationRate: 0.15,
            agentCount: 35000,
        },
    },
};

export const DEFAULT_PHYSARUM_CONFIG: PhysarumConfig = {
    sensorAngle: 0.45,
    sensorOffset: 12,
    turnSpeed: 0.55,
    stepSize: 1.6,
    evaporationRate: 0.08,
    diffusionRate: 0.35,
    agentCount: 45000,
    colorMode: 'lime',
    showFood: true,
    preset: 'tokyo',
};
