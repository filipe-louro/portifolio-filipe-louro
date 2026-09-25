import { PaletteId } from './types';

export interface PaletteOption {
    id: PaletteId;
    name: string;
    colors: string[];
    shaderCodeIndex: number;
}

export const PALETTE_OPTIONS: PaletteOption[] = [
    {
        id: 'neon-violet',
        name: 'Neon Violet',
        colors: ['#a855f7', '#ec4899', '#06b6d4'],
        shaderCodeIndex: 0,
    },
    {
        id: 'cyber-gold',
        name: 'Cyber Gold',
        colors: ['#f59e0b', '#8b5cf6', '#1e1b4b'],
        shaderCodeIndex: 1,
    },
    {
        id: 'emerald-deep',
        name: 'Emerald Deep',
        colors: ['#10b981', '#06b6d4', '#4c1d95'],
        shaderCodeIndex: 2,
    },
    {
        id: 'opal',
        name: 'Opal Hologram',
        colors: ['#c084fc', '#38bdf8', '#fb7185'],
        shaderCodeIndex: 3,
    },
];
