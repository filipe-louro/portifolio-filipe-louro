export interface OrbitConfig {
    particleCount: number;
    gravityStrength: number;
    initialSpread: number;
    initialVelocity: number;
    tailLength: number;
    coreSize: number;
    particleHue: number;
    coreHue: number;
    repulsionStrength: number;
}

export const INITIAL_CONFIG: OrbitConfig = {
    particleCount: 1500,
    gravityStrength: 0.2,
    initialSpread: 250,
    initialVelocity: 0.5,
    tailLength: 0.7,
    coreSize: 20,
    particleHue: 200,
    coreHue: 210,
    repulsionStrength: 2.0
};