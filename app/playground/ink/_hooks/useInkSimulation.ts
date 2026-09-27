"use client";

import { useEffect, useRef, useCallback } from 'react';
import { InkConfig, INK_PALETTES } from '../_utils/types';

interface DyeParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    g: number;
    b: number;
    alpha: number;
    radius: number;
    life: number;
    maxLife: number;
}

interface VortexPoint {
    x: number;
    y: number;
    vx: number;
    vy: number;
    strength: number; // circulation Gamma
    radius: number;
    decay: number;
    life: number;
}

export const useInkSimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: InkConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    const particlesRef = useRef<DyeParticle[]>([]);
    const vorticesRef = useRef<VortexPoint[]>([]);

    const mouseRef = useRef({
        x: -1000,
        y: -1000,
        prevX: -1000,
        prevY: -1000,
        vx: 0,
        vy: 0,
        isDown: false,
    });

    const paletteIndexRef = useRef(0);
    const lastAutoDropRef = useRef(0);

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const injectDroplet = useCallback((x: number, y: number, colorOverride?: [number, number, number], customVy = 1.8) => {
        const cfg = configRef.current;
        const pal = INK_PALETTES[cfg.palette] || INK_PALETTES.aurora;
        const color = colorOverride || pal.colors[paletteIndexRef.current % pal.colors.length];
        paletteIndexRef.current++;

        const particleCount = Math.floor(180 * cfg.dropletSize);
        const newParticles: DyeParticle[] = [];

        // Center cluster of dye
        const baseRadius = 14 * cfg.dropletSize;
        for (let i = 0; i < particleCount; i++) {
            const rad = Math.sqrt(Math.random()) * baseRadius;
            const angle = Math.random() * Math.PI * 2;
            newParticles.push({
                x: x + Math.cos(angle) * rad,
                y: y + Math.sin(angle) * rad,
                vx: (Math.random() - 0.5) * 0.4,
                vy: customVy + (Math.random() - 0.5) * 0.5,
                r: color[0],
                g: color[1],
                b: color[2],
                alpha: 0.65 + Math.random() * 0.35,
                radius: 1.8 + Math.random() * 2.2,
                life: 0,
                maxLife: 900 + Math.random() * 300,
            });
        }

        // Create Counter-Rotating Vortex Dipole pair (Rayleigh-Taylor plume engine)
        const vortexSep = baseRadius * 0.75;
        const gamma = 32 * cfg.vorticity;
        const newVortices: VortexPoint[] = [
            {
                x: x - vortexSep,
                y: y,
                vx: 0,
                vy: customVy * 0.8,
                strength: -gamma, // counter-clockwise left
                radius: 28,
                decay: 0.994,
                life: 1,
            },
            {
                x: x + vortexSep,
                y: y,
                vx: 0,
                vy: customVy * 0.8,
                strength: gamma, // clockwise right
                radius: 28,
                decay: 0.994,
                life: 1,
            },
        ];

        // Cap arrays to ensure fast performance
        const maxP = 7000;
        if (particlesRef.current.length + newParticles.length > maxP) {
            particlesRef.current.splice(0, newParticles.length);
        }
        particlesRef.current.push(...newParticles);

        if (vorticesRef.current.length > 50) {
            vorticesRef.current.splice(0, newVortices.length);
        }
        vorticesRef.current.push(...newVortices);
    }, []);

    const reset = useCallback(() => {
        particlesRef.current = [];
        vorticesRef.current = [];
        const canvas = canvasRef.current;
        if (canvas) {
            injectDroplet(canvas.clientWidth * 0.35, 70);
            injectDroplet(canvas.clientWidth * 0.65, 70);
        }
    }, [canvasRef, injectDroplet]);

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
                injectDroplet(width * 0.35, 70);
                injectDroplet(width * 0.65, 70);
            }
        };

        let lastTime = performance.now();

        const render = () => {
            const now = performance.now();
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            const cfg = configRef.current;

            // Semi-transparent fade background for fluid motion trail
            ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
            ctx.fillRect(0, 0, width, height);

            const particles = particlesRef.current;
            const vortices = vorticesRef.current;

            // 1. Update vortices (Biot-Savart advection & decay)
            for (let i = vortices.length - 1; i >= 0; i--) {
                const v = vortices[i];
                v.y += v.vy * dt * 60;
                v.x += v.vx * dt * 60;
                v.vy *= v.decay;
                v.vx *= v.decay;
                v.strength *= v.decay;
                v.life *= 0.997;

                // Gravitational sinking for plumes
                v.vy += cfg.buoyancy * 0.06;

                if (Math.abs(v.strength) < 0.5 || v.y > height + 50 || v.life < 0.05) {
                    vortices.splice(i, 1);
                }
            }

            // 2. Continuous stream tool
            if (mouseRef.current.isDown && cfg.tool === 'stream') {
                injectDroplet(mouseRef.current.x, mouseRef.current.y, undefined, 0.8);
            }

            // 3. Stir tool (mouse vortex injection)
            if (mouseRef.current.isDown && cfg.tool === 'stir') {
                const speed = Math.sqrt(mouseRef.current.vx * mouseRef.current.vx + mouseRef.current.vy * mouseRef.current.vy);
                if (speed > 1.5 && vortices.length < 50) {
                    vortices.push({
                        x: mouseRef.current.x,
                        y: mouseRef.current.y,
                        vx: mouseRef.current.vx * 0.4,
                        vy: mouseRef.current.vy * 0.4,
                        strength: (mouseRef.current.vx * mouseRef.current.vy) * 2.5 * cfg.vorticity,
                        radius: 36,
                        decay: 0.985,
                        life: 1,
                    });
                }
            }

            // 4. Update and render dye particles
            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.life++;

                // Gravitational buoyancy (sinking)
                p.vy += cfg.buoyancy * 0.045;

                // Fluid velocity induced by all active vortices (Vortex particle method)
                let indVx = 0;
                let indVy = 0;

                for (let j = 0; j < vortices.length; j++) {
                    const vort = vortices[j];
                    const dx = p.x - vort.x;
                    const dy = p.y - vort.y;
                    const distSq = dx * dx + dy * dy + vort.radius * vort.radius;
                    // Biot-Savart circular velocity: u = Gamma / (2*pi*r) * (-dy/r, dx/r)
                    const factor = vort.strength / (distSq * 0.65);
                    indVx += -dy * factor;
                    indVy += dx * factor;
                }

                p.vx = (p.vx + indVx) * cfg.viscosity;
                p.vy = (p.vy + indVy) * cfg.viscosity;

                // Brownian / thermal diffusion
                if (cfg.diffusion > 0) {
                    p.vx += (Math.random() - 0.5) * cfg.diffusion * 0.4;
                    p.vy += (Math.random() - 0.5) * cfg.diffusion * 0.4;
                }

                p.x += p.vx * dt * 60;
                p.y += p.vy * dt * 60;

                // Secondary instability: split falling clusters if speed is high
                if (p.life % 90 === 0 && Math.abs(p.vy) > 3.0 && vortices.length < 40 && Math.random() < 0.05) {
                    vortices.push({
                        x: p.x,
                        y: p.y,
                        vx: p.vx * 0.5,
                        vy: p.vy * 0.5,
                        strength: (Math.random() - 0.5) * 16 * cfg.vorticity,
                        radius: 18,
                        decay: 0.99,
                        life: 1,
                    });
                }

                // Boundary reflection with damping
                if (p.x < 10) { p.x = 10; p.vx *= -0.5; }
                if (p.x > width - 10) { p.x = width - 10; p.vx *= -0.5; }
                if (p.y > height - 10) {
                    p.y = height - 10;
                    p.vy = -Math.abs(p.vy) * 0.2;
                    p.vx *= 0.8;
                }

                // Alpha decay over particle life
                const lifeRatio = p.life / p.maxLife;
                const currentAlpha = p.alpha * (1 - lifeRatio * lifeRatio);

                if (lifeRatio >= 1 || currentAlpha <= 0.02) {
                    particles.splice(i, 1);
                    continue;
                }

                // Render particle with luminous soft radial dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * (1 + lifeRatio * 0.8), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${currentAlpha.toFixed(3)})`;
                ctx.fill();
            }

            ctx.restore();

            // Periodic auto injection if tank gets quiet
            if (particles.length < 400 && now - lastAutoDropRef.current > 3000) {
                lastAutoDropRef.current = now;
                const rx = width * (0.25 + Math.random() * 0.5);
                injectDroplet(rx, 60);
            }

            requestRef.current = requestAnimationFrame(render);
        };

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            const rect = canvas.getBoundingClientRect();
            const px = clientX - rect.left;
            const py = clientY - rect.top;

            mouseRef.current.x = px;
            mouseRef.current.y = py;
            mouseRef.current.prevX = px;
            mouseRef.current.prevY = py;
            mouseRef.current.isDown = true;

            const cfg = configRef.current;
            if (cfg.tool === 'drop') {
                injectDroplet(px, py);
            }
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            if (isTouch && (!e.touches || e.touches.length === 0)) return;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            const rect = canvas.getBoundingClientRect();
            const px = clientX - rect.left;
            const py = clientY - rect.top;

            mouseRef.current.vx = px - mouseRef.current.x;
            mouseRef.current.vy = py - mouseRef.current.y;
            mouseRef.current.prevX = mouseRef.current.x;
            mouseRef.current.prevY = mouseRef.current.y;
            mouseRef.current.x = px;
            mouseRef.current.y = py;
        };

        const handlePointerUp = () => {
            mouseRef.current.isDown = false;
        };

        resize();
        render();

        window.addEventListener('resize', resize);
        canvas.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);

        canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);

            canvas.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef, injectDroplet]);

    return { reset, injectDroplet };
};
