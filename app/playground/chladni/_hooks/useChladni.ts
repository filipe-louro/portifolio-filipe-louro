"use client";

import { useEffect, useRef, useCallback } from 'react';
import { ChladniConfig } from '../_utils/types';
import { playChladniChime } from '../_utils/chladniAudio';

export const useChladni = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: ChladniConfig,
    isPaused: boolean
) => {
    const configRef = useRef(config);
    const isPausedRef = useRef(isPaused);
    const requestRef = useRef<number>(0);

    const particlesPosRef = useRef<Float32Array | null>(null);
    const particlesVelRef = useRef<Float32Array | null>(null);

    const mouseRef = useRef<{ x: number; y: number; isDown: boolean }>({ x: -1000, y: -1000, isDown: false });

    const initParticles = useCallback((count: number, shape: 'square' | 'circle') => {
        const pos = new Float32Array(count * 2);
        const vel = new Float32Array(count * 2);

        for (let i = 0; i < count; i++) {
            if (shape === 'circle') {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random()) * 0.95;
                pos[i * 2] = r * Math.cos(angle);
                pos[i * 2 + 1] = r * Math.sin(angle);
            } else {
                pos[i * 2] = (Math.random() * 2 - 1) * 0.95;
                pos[i * 2 + 1] = (Math.random() * 2 - 1) * 0.95;
            }
            vel[i * 2] = 0;
            vel[i * 2 + 1] = 0;
        }

        particlesPosRef.current = pos;
        particlesVelRef.current = vel;
    }, []);

    useEffect(() => {
        const prevM = configRef.current.m;
        const prevN = configRef.current.n;
        const prevShape = configRef.current.shape;
        const prevCount = configRef.current.particleCount;
        const prevSoundEnabled = configRef.current.soundEnabled;

        configRef.current = config;

        if (config.particleCount !== prevCount || config.shape !== prevShape) {
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const targetCount = isMobile ? Math.min(config.particleCount, 8000) : config.particleCount;
            initParticles(targetCount, config.shape);
        }

        const justEnabled = config.soundEnabled && !prevSoundEnabled;
        if (config.soundEnabled && (justEnabled || config.m !== prevM || config.n !== prevN || config.shape !== prevShape)) {
            playChladniChime(config.m, config.n, config.soundVolume);
        }
    }, [config, initParticles]);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    const scatter = useCallback(() => {
        const currentCount = configRef.current.particleCount;
        const currentShape = configRef.current.shape;
        initParticles(currentCount, currentShape);
        if (configRef.current.soundEnabled) {
            playChladniChime(configRef.current.m, configRef.current.n, configRef.current.soundVolume);
        }
    }, [initParticles]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let w = 0, h = 0;
        let cx = 0, cy = 0;
        let plateSize = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = container.clientWidth;
            h = container.clientHeight;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);

            cx = w / 2;
            cy = h / 2;
            plateSize = Math.min(w, h) * 0.42;

            const isMobile = w < 768;
            const targetCount = isMobile ? Math.min(configRef.current.particleCount, 8000) : configRef.current.particleCount;

            if (!particlesPosRef.current || particlesPosRef.current.length !== targetCount * 2) {
                initParticles(targetCount, configRef.current.shape);
            }
        };

        const computeWave = (u: number, v: number, m: number, n: number, shape: 'square' | 'circle'): number => {
            if (shape === 'circle') {
                const r = Math.sqrt(u * u + v * v);
                const theta = Math.atan2(v, u);
                return Math.cos(m * theta) * Math.sin(n * Math.PI * r);
            }
            if (m === n) {
                return Math.cos(n * Math.PI * u) * Math.cos(m * Math.PI * v);
            }
            return Math.cos(n * Math.PI * u) * Math.cos(m * Math.PI * v) - Math.cos(m * Math.PI * u) * Math.cos(n * Math.PI * v);
        };

        const render = () => {
            if (!isPausedRef.current && particlesPosRef.current && particlesVelRef.current) {
                const pos = particlesPosRef.current;
                const vel = particlesVelRef.current;
                const count = pos.length / 2;

                const { m, n, intensity, shape } = configRef.current;
                const mouse = mouseRef.current;

                const mouseNormX = (mouse.x - cx) / plateSize;
                const mouseNormY = (mouse.y - cy) / plateSize;
                const isMouseDown = mouse.isDown;

                const eps = 0.008;

                for (let i = 0; i < count; i++) {
                    const idx = i * 2;
                    let u = pos[idx];
                    let v = pos[idx + 1];

                    const wVal = computeWave(u, v, m, n, shape);
                    const absW = Math.abs(wVal);

                    // Gradiente numérico do potencial w^2
                    const wUPlus = computeWave(u + eps, v, m, n, shape);
                    const wUMinus = computeWave(u - eps, v, m, n, shape);
                    const wVPlus = computeWave(u, v + eps, m, n, shape);
                    const wVMinus = computeWave(u, v - eps, m, n, shape);

                    const gradU = (wUPlus * wUPlus - wUMinus * wUMinus) / (2 * eps);
                    const gradV = (wVPlus * wVPlus - wVMinus * wVMinus) / (2 * eps);

                    // Força acústica em direção aos nós
                    let fx = -gradU * 0.0035 * intensity;
                    let fy = -gradV * 0.0035 * intensity;

                    // Agitação browniana proporcional à intensidade de vibração do antinó
                    const kick = absW * intensity * 0.012;
                    fx += (Math.random() - 0.5) * kick;
                    fy += (Math.random() - 0.5) * kick;

                    // Interação do mouse (agitação do meio ou dispersão)
                    if (isMouseDown) {
                        const mdx = u - mouseNormX;
                        const mdy = v - mouseNormY;
                        const mDistSq = mdx * mdx + mdy * mdy;
                        if (mDistSq < 0.04) {
                            const mDist = Math.sqrt(mDistSq) || 0.001;
                            const force = (0.2 - mDist) * 0.04;
                            fx += (mdx / mDist) * force;
                            fy += (mdy / mDist) * force;
                        }
                    }

                    // Amortecimento dinâmico: partículas no nó desaceleram rapidamente
                    const damping = absW < 0.05 ? 0.65 : 0.88;
                    vel[idx] = (vel[idx] + fx) * damping;
                    vel[idx + 1] = (vel[idx + 1] + fy) * damping;

                    u += vel[idx];
                    v += vel[idx + 1];

                    // Limites da placa
                    if (shape === 'circle') {
                        const rSq = u * u + v * v;
                        if (rSq > 0.94) {
                            const r = Math.sqrt(rSq);
                            u = (u / r) * 0.93;
                            v = (v / r) * 0.93;
                            vel[idx] *= -0.4;
                            vel[idx + 1] *= -0.4;
                        }
                    } else {
                        if (u > 0.97) { u = 0.97; vel[idx] *= -0.4; }
                        if (u < -0.97) { u = -0.97; vel[idx] *= -0.4; }
                        if (v > 0.97) { v = 0.97; vel[idx + 1] *= -0.4; }
                        if (v < -0.97) { v = -0.97; vel[idx + 1] *= -0.4; }
                    }

                    pos[idx] = u;
                    pos[idx + 1] = v;
                }
            }

            // Renderização no Canvas
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);

            const { shape } = configRef.current;

            // Fundo e borda da placa acústica
            ctx.save();
            ctx.translate(cx, cy);

            ctx.fillStyle = '#090d16';
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
            ctx.lineWidth = 2;

            if (shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, plateSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Anéis guia discretos
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.05)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, plateSize * 0.66, 0, Math.PI * 2);
                ctx.arc(0, 0, plateSize * 0.33, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.roundRect(-plateSize, -plateSize, plateSize * 2, plateSize * 2, 16);
                ctx.fill();
                ctx.stroke();

                // Eixos guia discretos
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.05)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-plateSize, 0);
                ctx.lineTo(plateSize, 0);
                ctx.moveTo(0, -plateSize);
                ctx.lineTo(0, plateSize);
                ctx.stroke();
            }

            // Renderizar partículas
            if (particlesPosRef.current && particlesVelRef.current) {
                const pos = particlesPosRef.current;
                const vel = particlesVelRef.current;
                const count = pos.length / 2;

                ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';

                for (let i = 0; i < count; i++) {
                    const idx = i * 2;
                    const screenX = pos[idx] * plateSize;
                    const screenY = pos[idx + 1] * plateSize;

                    const speed = Math.abs(vel[idx]) + Math.abs(vel[idx + 1]);
                    const pSize = speed < 0.001 ? 1.6 : 1.2;

                    ctx.fillRect(screenX - pSize / 2, screenY - pSize / 2, pSize, pSize);
                }
            }

            ctx.restore();

            requestRef.current = requestAnimationFrame(render);
        };

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const rect = container.getBoundingClientRect();
            mouseRef.current.x = clientX - rect.left;
            mouseRef.current.y = clientY - rect.top;
            mouseRef.current.isDown = true;
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const rect = container.getBoundingClientRect();
            mouseRef.current.x = clientX - rect.left;
            mouseRef.current.y = clientY - rect.top;
        };

        const handlePointerUp = () => {
            mouseRef.current.isDown = false;
        };

        resize();
        render();

        window.addEventListener('resize', resize);
        container.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);

        container.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            container.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);

            container.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef, initParticles]);

    return { scatter };
};
