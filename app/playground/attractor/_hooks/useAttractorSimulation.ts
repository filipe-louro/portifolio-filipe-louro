"use client";

import { useEffect, useRef, useCallback } from 'react';
import { AttractorConfig, ATTRACTOR_PRESETS } from '../_utils/types';

interface Particle3D {
    x: number;
    y: number;
    z: number;
    prevScreenX: number;
    prevScreenY: number;
    life: number;
    maxLife: number;
    speed: number;
}

// Differential equations evaluated at state (x, y, z)
const evaluateDerivatives = (
    x: number,
    y: number,
    z: number,
    type: AttractorConfig['type'],
    p1: number,
    p2: number,
    p3: number
): [number, number, number] => {
    if (type === 'lorenz') {
        // sigma = p1, rho = p2, beta = p3
        const dx = p1 * (y - x);
        const dy = x * (p2 - z) - y;
        const dz = x * y - p3 * z;
        return [dx, dy, dz];
    }
    if (type === 'aizawa') {
        // a = p1, b = p2, c = p3, d = 3.5, e = 0.25, f = 0.1
        const d = 3.5;
        const e = 0.25;
        const f = 0.1;
        const dx = (z - p2) * x - d * y;
        const dy = d * x + (z - p2) * y;
        const dz = p3 + p1 * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * (x * x * x);
        return [dx, dy, dz];
    }
    if (type === 'rossler') {
        // a = p1, b = p2, c = p3
        const dx = -y - z;
        const dy = x + p1 * y;
        const dz = p2 + z * (x - p3);
        return [dx, dy, dz];
    }
    if (type === 'thomas') {
        // b = p1
        const b = p1;
        const dx = Math.sin(y) - b * x;
        const dy = Math.sin(z) - b * y;
        const dz = Math.sin(x) - b * z;
        return [dx, dy, dz];
    }
    // halvorsen
    const a = p1;
    const dx = -a * x - 4 * y - 4 * z - y * y;
    const dy = -a * y - 4 * z - 4 * x - z * z;
    const dz = -a * z - 4 * x - 4 * y - x * x;
    return [dx, dy, dz];
};

// RK4 Integrator
const rk4Step = (
    x: number,
    y: number,
    z: number,
    dt: number,
    type: AttractorConfig['type'],
    p1: number,
    p2: number,
    p3: number
): [number, number, number, number] => {
    const [k1x, k1y, k1z] = evaluateDerivatives(x, y, z, type, p1, p2, p3);
    const [k2x, k2y, k2z] = evaluateDerivatives(
        x + 0.5 * dt * k1x,
        y + 0.5 * dt * k1y,
        z + 0.5 * dt * k1z,
        type,
        p1,
        p2,
        p3
    );
    const [k3x, k3y, k3z] = evaluateDerivatives(
        x + 0.5 * dt * k2x,
        y + 0.5 * dt * k2y,
        z + 0.5 * dt * k2z,
        type,
        p1,
        p2,
        p3
    );
    const [k4x, k4y, k4z] = evaluateDerivatives(
        x + dt * k3x,
        y + dt * k3y,
        z + dt * k3z,
        type,
        p1,
        p2,
        p3
    );

    const nx = x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    const ny = y + (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    const nz = z + (dt / 6) * (k1z + 2 * k2z + 2 * k3z + k4z);

    const speed = Math.sqrt(k1x * k1x + k1y * k1y + k1z * k1z);
    return [nx, ny, nz, speed];
};

export const useAttractorSimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: AttractorConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    const particlesRef = useRef<Particle3D[]>([]);

    // 3D Orbit Camera angles
    const cameraRef = useRef({
        rotX: 0.35,
        rotY: 0.65,
        targetRotX: 0.35,
        targetRotY: 0.65,
        zoom: 1.0,
        targetZoom: 1.0,
        isDragging: false,
        lastMouseX: 0,
        lastMouseY: 0,
    });

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const spawnParticle = useCallback((type: AttractorConfig['type']): Particle3D => {
        let x = (Math.random() - 0.5) * 2;
        let y = (Math.random() - 0.5) * 2;
        let z = (Math.random() - 0.5) * 2;

        if (type === 'lorenz') {
            x = 0.1 + (Math.random() - 0.5) * 1.5;
            y = 0.1 + (Math.random() - 0.5) * 1.5;
            z = 25 + (Math.random() - 0.5) * 5;
        } else if (type === 'aizawa') {
            x = 0.1 + (Math.random() - 0.5) * 0.2;
            y = (Math.random() - 0.5) * 0.2;
            z = (Math.random() - 0.5) * 0.2;
        } else if (type === 'rossler') {
            x = 1.0 + (Math.random() - 0.5) * 0.5;
            y = 1.0 + (Math.random() - 0.5) * 0.5;
            z = 0.1;
        }

        return {
            x,
            y,
            z,
            prevScreenX: -1,
            prevScreenY: -1,
            life: 0,
            maxLife: 600 + Math.random() * 400,
            speed: 0,
        };
    }, []);

    const initParticles = useCallback((count: number, type: AttractorConfig['type']) => {
        const particles: Particle3D[] = [];
        for (let i = 0; i < count; i++) {
            particles.push(spawnParticle(type));
        }
        particlesRef.current = particles;
    }, [spawnParticle]);

    // The Butterfly Effect: cluster all particles in a micro-sphere to watch exponential divergence
    const triggerButterflyBurst = useCallback(() => {
        const type = configRef.current.type;
        const seed = spawnParticle(type);
        const eps = 0.002;
        particlesRef.current.forEach((p) => {
            p.x = seed.x + (Math.random() - 0.5) * eps;
            p.y = seed.y + (Math.random() - 0.5) * eps;
            p.z = seed.z + (Math.random() - 0.5) * eps;
            p.prevScreenX = -1;
            p.prevScreenY = -1;
            p.life = 0;
        });
    }, [spawnParticle]);

    const reset = useCallback(() => {
        const cfg = configRef.current;
        initParticles(cfg.particleCount, cfg.type);
        cameraRef.current.targetRotX = 0.35;
        cameraRef.current.targetRotY = 0.65;
        cameraRef.current.targetZoom = 1.0;
    }, [initParticles]);



    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.scale(dpr, dpr);

            if (particlesRef.current.length === 0) {
                initParticles(configRef.current.particleCount, configRef.current.type);
            }
        };

        const render = () => {
            const cfg = configRef.current;
            const presetInfo = ATTRACTOR_PRESETS[cfg.type];
            const cam = cameraRef.current;

            // Camera inertia smoothing
            cam.rotX += (cam.targetRotX - cam.rotX) * 0.1;
            cam.rotY += (cam.targetRotY - cam.rotY) * 0.1;
            cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;

            // Trail persistence fade
            ctx.fillStyle = `rgba(2, 6, 23, ${1 - cfg.trailPersistence * 0.98})`;
            ctx.fillRect(0, 0, width, height);

            const cosY = Math.cos(cam.rotY);
            const sinY = Math.sin(cam.rotY);
            const cosX = Math.cos(cam.rotX);
            const sinX = Math.sin(cam.rotX);

            const scale = presetInfo.scale * cam.zoom;
            const cx = width * 0.5;
            const cy = height * 0.52;

            // Offset attractor center for specific geometries
            let centerZ = 0;
            if (cfg.type === 'lorenz') centerZ = -25;
            else if (cfg.type === 'aizawa') centerZ = 0;

            const baseDt = (cfg.type === 'aizawa' ? 0.015 : cfg.type === 'thomas' ? 0.04 : 0.0075) * cfg.speed;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineWidth = 1.3;

            const particles = particlesRef.current;
            // Adjust count if changed
            if (particles.length < cfg.particleCount) {
                const diff = cfg.particleCount - particles.length;
                for (let k = 0; k < diff; k++) particles.push(spawnParticle(cfg.type));
            } else if (particles.length > cfg.particleCount) {
                particles.splice(cfg.particleCount);
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.life++;

                // Integrate 1 step
                const [nx, ny, nz, speed] = rk4Step(
                    p.x,
                    p.y,
                    p.z,
                    baseDt,
                    cfg.type,
                    cfg.param1,
                    cfg.param2,
                    cfg.param3
                );

                p.x = nx;
                p.y = ny;
                p.z = nz;
                p.speed = speed;

                // Check divergence or life limit
                if (isNaN(p.x) || Math.abs(p.x) > 200 || p.life > p.maxLife) {
                    const fresh = spawnParticle(cfg.type);
                    p.x = fresh.x;
                    p.y = fresh.y;
                    p.z = fresh.z;
                    p.life = 0;
                    p.prevScreenX = -1;
                    p.prevScreenY = -1;
                    continue;
                }

                // Center coordinates
                const rx = p.x;
                const ry = p.y;
                const rz = p.z + centerZ;

                // 3D rotation
                const x1 = rx * cosY - rz * sinY;
                const z1 = rx * sinY + rz * cosY;
                const y1 = ry * cosX - z1 * sinX;
                const zFinal = ry * sinX + z1 * cosX;

                // 3D perspective projection
                const fov = 650;
                const cameraDist = 800;
                const zFactor = fov / (cameraDist - zFinal * scale * 0.015);

                const sx = cx + x1 * scale * zFactor;
                const sy = cy - y1 * scale * zFactor;

                if (p.prevScreenX >= 0 && p.prevScreenY >= 0) {
                    // Spectral coloring based on speed & scheme
                    let strokeColor = '';
                    const speedNorm = Math.min(speed / 35, 1.0);

                    if (cfg.colorScheme === 'aurora') {
                        // Cyan to Purple to Emerald
                        const hue = 160 + speedNorm * 140;
                        strokeColor = `hsla(${hue}, 90%, 65%, 0.45)`;
                    } else if (cfg.colorScheme === 'fire') {
                        // Red to Gold to White
                        const hue = speedNorm * 55;
                        strokeColor = `hsla(${hue}, 100%, ${50 + speedNorm * 30}%, 0.45)`;
                    } else if (cfg.colorScheme === 'cyber') {
                        // Hot pink to electric cyan
                        const hue = 300 - speedNorm * 120;
                        strokeColor = `hsla(${hue}, 95%, 60%, 0.45)`;
                    } else {
                        // Electric blue
                        strokeColor = `hsla(210, 100%, ${60 + speedNorm * 35}%, 0.45)`;
                    }

                    ctx.strokeStyle = strokeColor;
                    ctx.beginPath();
                    ctx.moveTo(p.prevScreenX, p.prevScreenY);
                    ctx.lineTo(sx, sy);
                    ctx.stroke();
                }

                p.prevScreenX = sx;
                p.prevScreenY = sy;
            }

            ctx.restore();

            // Auto slow orbit rotation when idle
            if (!cam.isDragging) {
                cam.targetRotY += 0.0025;
            }

            requestRef.current = requestAnimationFrame(render);
        };

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;

            cameraRef.current.isDragging = true;
            cameraRef.current.lastMouseX = clientX;
            cameraRef.current.lastMouseY = clientY;
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            if (!cameraRef.current.isDragging) return;
            const isTouch = 'touches' in e;
            if (isTouch && (!e.touches || e.touches.length === 0)) return;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;

            const dx = clientX - cameraRef.current.lastMouseX;
            const dy = clientY - cameraRef.current.lastMouseY;
            cameraRef.current.lastMouseX = clientX;
            cameraRef.current.lastMouseY = clientY;

            cameraRef.current.targetRotY += dx * 0.007;
            cameraRef.current.targetRotX += dy * 0.007;
            cameraRef.current.targetRotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, cameraRef.current.targetRotX));
        };

        const handlePointerUp = () => {
            cameraRef.current.isDragging = false;
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            cameraRef.current.targetZoom = Math.max(0.3, Math.min(4.0, cameraRef.current.targetZoom * delta));
        };

        resize();
        render();

        window.addEventListener('resize', resize);
        canvas.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            canvas.removeEventListener('wheel', handleWheel);

            canvas.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef, initParticles, spawnParticle]);

    return { reset, triggerButterflyBurst };
};
