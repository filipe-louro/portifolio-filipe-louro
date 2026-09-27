export type PendulumMode = 'double' | 'lyapunov' | 'triple';
export type PendulumPresetName = 'standard' | 'lyapunov' | 'triple' | 'hamiltonian' | 'resonance';

export interface PendulumConfig {
    gravity: number;
    length1: number;
    length2: number;
    length3: number;
    mass1: number;
    mass2: number;
    mass3: number;
    damping: number;
    trailPersistence: number;
    mode: PendulumMode;
    isPaused: boolean;
    showPhaseSpace: boolean;
    preset: PendulumPresetName;
}

export const PENDULUM_PRESETS: Record<PendulumPresetName, { name: string; description: string; config: Partial<PendulumConfig> }> = {
    standard: {
        name: 'Caos Padrão',
        description: 'Pêndulo duplo com massas balanceadas e movimento caótico.',
        config: {
            mode: 'double',
            gravity: 9.81,
            length1: 140,
            length2: 130,
            mass1: 10,
            mass2: 10,
            damping: 0.0008,
            trailPersistence: 0.965,
        },
    },
    lyapunov: {
        name: 'Feixe de Lyapunov',
        description: '40 pêndulos com diferença infinitesimal (10⁻⁵ rad) divergindo em arco-íris.',
        config: {
            mode: 'lyapunov',
            gravity: 9.81,
            length1: 140,
            length2: 130,
            mass1: 10,
            mass2: 10,
            damping: 0.0004,
            trailPersistence: 0.98,
        },
    },
    triple: {
        name: 'Pêndulo Triplo',
        description: 'Três hastes acopladas com hipercaos e órbitas imprevisíveis.',
        config: {
            mode: 'triple',
            gravity: 9.81,
            length1: 100,
            length2: 90,
            length3: 80,
            mass1: 10,
            mass2: 8,
            mass3: 6,
            damping: 0.0006,
            trailPersistence: 0.96,
        },
    },
    hamiltonian: {
        name: 'Conservação Pura',
        description: 'Amortecimento nulo com conservação exata de energia mecânica.',
        config: {
            mode: 'double',
            gravity: 9.81,
            length1: 150,
            length2: 140,
            mass1: 12,
            mass2: 8,
            damping: 0.0,
            trailPersistence: 0.97,
        },
    },
    resonance: {
        name: 'Ressonância do Pivô',
        description: 'Pivô móvel excitado parametricamente gerando giros contínuos.',
        config: {
            mode: 'double',
            gravity: 12.0,
            length1: 130,
            length2: 120,
            mass1: 10,
            mass2: 10,
            damping: 0.0005,
            trailPersistence: 0.95,
        },
    },
};

export const DEFAULT_PENDULUM_CONFIG: PendulumConfig = {
    gravity: 9.81,
    length1: 140,
    length2: 130,
    length3: 80,
    mass1: 10,
    mass2: 10,
    mass3: 6,
    damping: 0.0008,
    trailPersistence: 0.965,
    mode: 'double',
    isPaused: false,
    showPhaseSpace: true,
    preset: 'standard',
};
