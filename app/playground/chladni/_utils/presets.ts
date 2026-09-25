import { PlateShape } from './types';

export interface ChladniPreset {
    name: string;
    m: number;
    n: number;
    shape: PlateShape;
}

export const CHLADNI_PRESETS: ChladniPreset[] = [
    { name: 'Cruz Harmônica', m: 2, n: 2, shape: 'square' },
    { name: 'Estrela Dupla', m: 4, n: 2, shape: 'square' },
    { name: 'Mandala Quântica', m: 5, n: 3, shape: 'circle' },
    { name: 'Matriz Fina', m: 6, n: 4, shape: 'square' },
    { name: 'Roseta Acústica', m: 7, n: 2, shape: 'circle' },
    { name: 'Flor Complexa', m: 8, n: 5, shape: 'circle' },
];
