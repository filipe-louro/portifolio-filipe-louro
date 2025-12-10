"use client";

import { useEffect, useRef, useCallback } from 'react';
import { OrbitConfig } from '../_utils/types';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    hueVar: number;
    life: number;
}

interface PointerState {
    x: number;
    y: number;
    active: boolean;
}

type InteractionEvent = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;

export const useOrbitalPhysics = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    config: OrbitConfig,
    isRunning: boolean,
    interactionMode: string
) => {
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number>(0);
    const centerRef = useRef({ x: 0, y: 0 });
    const pointerRef = useRef<PointerState>({ x: 0, y: 0, active: false });

    const configRef = useRef(config);
    const interactionModeRef = useRef(interactionMode);
    const isRunningRef = useRef(isRunning);


    useEffect(() => {
        configRef.current = config;
    }, [config]);

    useEffect(() => {
        interactionModeRef.current = interactionMode;
    }, [interactionMode]);

    useEffect(() => {
        isRunningRef.current = isRunning;
        if (!isRunning && animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        } else if (isRunning) {
            animationFrameRef.current = requestAnimationFrame(loop);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning]);

    const initParticles = useCallback(() => {
        if (!canvasRef.current) return;
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        centerRef.current.x = width / 2;
        centerRef.current.y = height / 2;

        const cfg = configRef.current;
        particlesRef.current = [];

        for (let i = 0; i < cfg.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = (Math.random() * 0.2 + 0.8) * Math.random() * cfg.initialSpread + 60;

            const x = centerRef.current.x + radius * Math.cos(angle);
            const y = centerRef.current.y + radius * Math.sin(angle);

            const dx = x - centerRef.current.x;
            const dy = y - centerRef.current.y;

            let vx = -dy;
            let vy = dx;

            const mag = Math.sqrt(vx * vx + vy * vy);
            if (mag > 0) { vx /= mag; vy /= mag; }

            const orbitalSpeed = Math.sqrt(Math.max(0.1, cfg.gravityStrength) * 1000 / radius);
            const speed = orbitalSpeed * cfg.initialVelocity * (0.8 + Math.random() * 0.4);

            const hueVar = Math.random() * 40 - 20;

            particlesRef.current.push({
                x, y,
                vx: vx * speed,
                vy: vy * speed,
                size: Math.random() * 2 + 0.5,
                hueVar,
                life: Math.random() * 100
            });
        }
    }, [canvasRef]);

    const updatePointerPos = useCallback((e: InteractionEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();

        let clientX: number;
        let clientY: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        pointerRef.current.x = clientX - rect.left;
        pointerRef.current.y = clientY - rect.top;
    }, [canvasRef]);

    const updatePhysics = useCallback(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d', { alpha: false });
        if (!ctx) return;

        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        const cfg = configRef.current;
        const mode = interactionModeRef.current;

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(5, 10, 20, ${1 - cfg.tailLength})`;
        ctx.fillRect(0, 0, width, height);

        const centerGradient = ctx.createRadialGradient(
            centerRef.current.x, centerRef.current.y, cfg.coreSize * 0.2,
            centerRef.current.x, centerRef.current.y, cfg.coreSize * 4
        );
        const coreH = cfg.coreHue;
        centerGradient.addColorStop(0, `hsla(${coreH}, 80%, 90%, 1)`);
        centerGradient.addColorStop(0.2, `hsla(${coreH}, 80%, 70%, 0.8)`);
        centerGradient.addColorStop(0.5, `hsla(${coreH}, 80%, 50%, 0.2)`);
        centerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(centerRef.current.x, centerRef.current.y, cfg.coreSize * 4, 0, Math.PI * 2);
        ctx.fill();

        if (pointerRef.current.active) {
            const mouseGrad = ctx.createRadialGradient(
                pointerRef.current.x, pointerRef.current.y, 0,
                pointerRef.current.x, pointerRef.current.y, 100
            );

            if (mode === 'attract') {
                mouseGrad.addColorStop(0, 'rgba(255, 50, 200, 0.4)');
                mouseGrad.addColorStop(1, 'rgba(255, 50, 200, 0)');
            } else {
                mouseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                mouseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }

            ctx.fillStyle = mouseGrad;
            ctx.beginPath();
            ctx.arc(pointerRef.current.x, pointerRef.current.y, 100, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < particlesRef.current.length; i++) {
            const p = particlesRef.current[i];

            const dx = centerRef.current.x - p.x;
            const dy = centerRef.current.y - p.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            const force = (cfg.gravityStrength * 800) / (distSq + 100);
            const nx = dx / dist;
            const ny = dy / dist;

            p.vx += nx * force;
            p.vy += ny * force;

            if (pointerRef.current.active) {
                const mdx = p.x - pointerRef.current.x;
                const mdy = p.y - pointerRef.current.y;
                const mDistSq = mdx * mdx + mdy * mdy;

                if (mDistSq < 22500) {
                    const mDist = Math.sqrt(mDistSq);
                    const mForce = (cfg.repulsionStrength * 50) / (mDist + 1);

                    const mnx = mdx / mDist;
                    const mny = mdy / mDist;

                    const direction = mode === 'attract' ? -1 : 1;

                    p.vx += mnx * mForce * direction;
                    p.vy += mny * mForce * direction;
                }
            }

            p.x += p.vx;
            p.y += p.vy;

            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const colorIntensity = Math.min(100, 40 + speed * 30);
            const finalHue = cfg.particleHue + p.hueVar;

            ctx.fillStyle = `hsla(${finalHue}, ${colorIntensity}%, 60%, ${speed > 2 ? 0.9 : 0.6})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }, [canvasRef]);

    const loop = useCallback(() => {
        if (isRunningRef.current) {
            updatePhysics();
            animationFrameRef.current = requestAnimationFrame(loop);
        }
    }, [updatePhysics]);

    useEffect(() => {
        if (isRunning) {
            animationFrameRef.current = requestAnimationFrame(loop);
        }
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isRunning, loop]);

    const handlePointerDown = (e: InteractionEvent) => {
        pointerRef.current.active = true;
        updatePointerPos(e);
    };

    const handlePointerUp = () => {
        pointerRef.current.active = false;
    };

    const handlePointerMove = (e: InteractionEvent) => {
        updatePointerPos(e);
    };

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                initParticles();
            }
        };
        window.addEventListener('resize', handleResize);
        setTimeout(handleResize, 100);
        return () => window.removeEventListener('resize', handleResize);
    }, [initParticles, canvasRef]);

    return {
        initParticles,
        handlePointerDown,
        handlePointerUp,
        handlePointerMove
    };
};