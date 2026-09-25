export type PinMode = 'top-rod' | 'two-corners' | 'four-corners' | 'draped';
export type ToolMode = 'grab' | 'cut';

export interface ClothConfig {
    gravity: number;
    windStrength: number;
    solverIterations: number;
    friction: number;
    pinMode: PinMode;
    toolMode: ToolMode;
    tearable: boolean;
}

export const DEFAULT_CLOTH_CONFIG: ClothConfig = {
    gravity: 0.25,
    windStrength: 0.15,
    solverIterations: 5,
    friction: 0.985,
    pinMode: 'top-rod',
    toolMode: 'grab',
    tearable: true,
};
