"use client";

import { useEffect, useRef, useCallback } from 'react';
import { RipplesConfig, WaveEmitter } from '../_utils/types';

const GW = 200;
const GH = 130;

export const useRipplesSimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: RipplesConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    // Wave height field buffers
    const uCurrentRef = useRef<Float32Array>(new Float32Array(GW * GH));
    const uPrevRef = useRef<Float32Array>(new Float32Array(GW * GH));
    const uNextRef = useRef<Float32Array>(new Float32Array(GW * GH));
    const wallsRef = useRef<Uint8Array>(new Uint8Array(GW * GH));

    // Active wave emitters
    const emittersRef = useRef<WaveEmitter[]>([
        { id: 'e1', x: Math.floor(GW * 0.28), y: Math.floor(GH * 0.5), frequency: 0.16, amplitude: 2.2, phase: 0 },
    ]);

    const draggedEmitterRef = useRef<WaveEmitter | null>(null);

    const mouseRef = useRef({
        x: -1000,
        y: -1000,
        gridX: -1,
        gridY: -1,
        isDown: false,
    });

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const setupScene = useCallback((preset: RipplesConfig['preset']) => {
        const walls = wallsRef.current;
        walls.fill(0);
        uCurrentRef.current.fill(0);
        uPrevRef.current.fill(0);
        uNextRef.current.fill(0);

        if (preset === 'double-slit') {
            // Young's Double-Slit barrier at x = GW * 0.45
            const barrierX = Math.floor(GW * 0.45);
            const slit1 = Math.floor(GH * 0.38);
            const slit2 = Math.floor(GH * 0.62);
            const slitW = 5;

            for (let y = 0; y < GH; y++) {
                const isSlit1 = y >= slit1 - slitW && y <= slit1 + slitW;
                const isSlit2 = y >= slit2 - slitW && y <= slit2 + slitW;
                if (!isSlit1 && !isSlit2) {
                    for (let x = barrierX - 2; x <= barrierX + 2; x++) {
                        walls[y * GW + x] = 1;
                    }
                }
            }

            emittersRef.current = [
                { id: 'e1', x: Math.floor(GW * 0.18), y: Math.floor(GH * 0.5), frequency: 0.16, amplitude: 2.4, phase: 0 },
            ];
        } else if (preset === 'dipole') {
            emittersRef.current = [
                { id: 'e1', x: Math.floor(GW * 0.42), y: Math.floor(GH * 0.35), frequency: 0.18, amplitude: 2.0, phase: 0 },
                { id: 'e2', x: Math.floor(GW * 0.42), y: Math.floor(GH * 0.65), frequency: 0.18, amplitude: 2.0, phase: Math.PI },
            ];
        } else if (preset === 'basin') {
            // Circular boundary wall
            const cx = GW * 0.5;
            const cy = GH * 0.5;
            const radius = Math.min(GW, GH) * 0.45;

            for (let y = 0; y < GH; y++) {
                for (let x = 0; x < GW; x++) {
                    const dx = x - cx;
                    const dy = y - cy;
                    if (dx * dx + dy * dy >= radius * radius) {
                        walls[y * GW + x] = 1;
                    }
                }
            }

            emittersRef.current = [
                { id: 'e1', x: Math.floor(cx), y: Math.floor(cy), frequency: 0.15, amplitude: 2.0, phase: 0 },
            ];
        } else if (preset === 'doppler') {
            emittersRef.current = [
                { id: 'e1', x: Math.floor(GW * 0.25), y: Math.floor(GH * 0.5), frequency: 0.22, amplitude: 2.2, phase: 0 },
            ];
        } else {
            // Pool caustics
            emittersRef.current = [
                { id: 'e1', x: Math.floor(GW * 0.35), y: Math.floor(GH * 0.4), frequency: 0.12, amplitude: 1.8, phase: 0 },
                { id: 'e2', x: Math.floor(GW * 0.65), y: Math.floor(GH * 0.6), frequency: 0.14, amplitude: 1.8, phase: 1.2 },
            ];
        }
    }, []);

    const reset = useCallback(() => {
        setupScene(configRef.current.preset);
    }, [setupScene]);

    useEffect(() => {
        setupScene(config.preset);
    }, [config.preset, setupScene]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Offscreen image buffer for rendering the wave grid
        const offCanvas = document.createElement('canvas');
        offCanvas.width = GW;
        offCanvas.height = GH;
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) return;
        const imgData = offCtx.createImageData(GW, GH);
        const data32 = new Uint32Array(imgData.data.buffer);

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
        };

        let frame = 0;

        const render = () => {
            frame++;
            const cfg = configRef.current;
            const uCurr = uCurrentRef.current;
            const uPrev = uPrevRef.current;
            const uNext = uNextRef.current;
            const walls = wallsRef.current;
            const emitters = emittersRef.current;

            // 1. Excitation from harmonic emitters
            for (let e = 0; e < emitters.length; e++) {
                const em = emitters[e];
                const val = Math.sin(frame * em.frequency + em.phase) * em.amplitude * cfg.emitterAmplitude;
                const idx = em.y * GW + em.x;
                if (idx >= 0 && idx < GW * GH && walls[idx] === 0) {
                    uCurr[idx] = val;
                    uPrev[idx] = val;
                }
            }

            // 2. Discrete Wave Equation PDE Solve
            // c_sq: Courant wave speed parameter (< 0.5 for CFL stability)
            const c_sq = Math.min(0.48, (cfg.waveSpeed * 0.48) * 0.85);
            const damp = cfg.damping;

            for (let y = 1; y < GH - 1; y++) {
                const row = y * GW;
                for (let x = 1; x < GW - 1; x++) {
                    const idx = row + x;

                    if (walls[idx] === 1) {
                        uNext[idx] = 0;
                        continue;
                    }

                    // 5-point discrete Laplacian
                    const lap =
                        uCurr[idx + 1] +
                        uCurr[idx - 1] +
                        uCurr[idx + GW] +
                        uCurr[idx - GW] -
                        4.0 * uCurr[idx];

                    // Verlet wave integration
                    let nextVal = (2.0 * uCurr[idx] - uPrev[idx] + c_sq * lap) * damp;

                    // Clamp numerical overflow
                    if (nextVal > 15) nextVal = 15;
                    else if (nextVal < -15) nextVal = -15;

                    uNext[idx] = nextVal;
                }
            }

            // Absorbing boundary conditions on grid outer edges
            for (let x = 0; x < GW; x++) {
                uNext[x] = uNext[GW + x] * 0.5;
                uNext[(GH - 1) * GW + x] = uNext[(GH - 2) * GW + x] * 0.5;
            }
            for (let y = 0; y < GH; y++) {
                uNext[y * GW] = uNext[y * GW + 1] * 0.5;
                uNext[y * GW + (GW - 1)] = uNext[y * GW + (GW - 2)] * 0.5;
            }

            // Buffer cycle: Prev <- Curr <- Next
            uPrevRef.current.set(uCurr);
            uCurrentRef.current.set(uNext);

            // 3. Render Optical Caustics & Water Coloration
            const causticsGain = cfg.causticsIntensity * 48;
            const showCaustics = cfg.showCaustics;

            for (let y = 0; y < GH; y++) {
                const row = y * GW;
                for (let x = 0; x < GW; x++) {
                    const idx = row + x;

                    // Obstacle wall rendering: dark basalt rock / concrete
                    if (walls[idx] === 1) {
                        data32[idx] = 0xff1e293b; // Slate-800
                        continue;
                    }

                    const val = uCurr[idx];

                    // Spatial gradients (surface normal)
                    const gx = (x < GW - 1 ? uCurr[idx + 1] : val) - (x > 0 ? uCurr[idx - 1] : val);
                    const gy = (y < GH - 1 ? uCurr[idx + GW] : val) - (y > 0 ? uCurr[idx - GW] : val);

                    // Refraction Caustics: Divergence / curvature of surface normals
                    let caustic = 0;
                    if (showCaustics) {
                        const lap = (x > 0 && x < GW - 1 && y > 0 && y < GH - 1)
                            ? (uCurr[idx + 1] + uCurr[idx - 1] + uCurr[idx + GW] + uCurr[idx - GW] - 4 * val)
                            : 0;
                        caustic = -lap * causticsGain;
                        if (caustic < 0) caustic = 0;
                    }

                    // Underwater tile grid pattern
                    const tilePattern = ((x % 14 < 1 || y % 14 < 1) ? 25 : 0);

                    // Base deep pool ocean water color
                    let r = 8 + tilePattern * 0.3 + caustic * 0.7;
                    let g = 38 + tilePattern * 0.5 + caustic * 1.1 + val * 12;
                    let b = 78 + tilePattern * 0.8 + caustic * 1.3 + val * 18;

                    // Specular solar sparkle on wave crests
                    const slope = gx * gx + gy * gy;
                    if (slope > 0.08 && val > 0.2) {
                        const spec = Math.min(180, (slope - 0.08) * 450);
                        r += spec;
                        g += spec;
                        b += spec;
                    }

                    r = Math.min(255, Math.max(0, r));
                    g = Math.min(255, Math.max(0, g));
                    b = Math.min(255, Math.max(0, b));

                    // Packed 32-bit ABGR format
                    data32[idx] = (0xff << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);
                }
            }

            // Put image data into offscreen canvas and blit stretched with smoothing
            offCtx.putImageData(imgData, 0, 0);

            ctx.clearRect(0, 0, width, height);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(offCanvas, 0, 0, width, height);

            // 4. Render draggable emitter handles
            const scaleX = width / GW;
            const scaleY = height / GH;

            for (let e = 0; e < emitters.length; e++) {
                const em = emitters[e];
                const sx = em.x * scaleX;
                const sy = em.y * scaleY;

                // Pulsing wave ring around emitter
                const pulseR = 12 + (frame * 1.5) % 24;
                ctx.beginPath();
                ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - (pulseR - 12) / 24) * 0.5})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Emitter node pin
                ctx.beginPath();
                ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#0284c7';
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
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

            const gx = Math.floor((px / width) * GW);
            const gy = Math.floor((py / height) * GH);

            mouseRef.current.x = px;
            mouseRef.current.y = py;
            mouseRef.current.gridX = gx;
            mouseRef.current.gridY = gy;
            mouseRef.current.isDown = true;

            // Check if clicking existing emitter to drag
            for (const em of emittersRef.current) {
                const sx = em.x * (width / GW);
                const sy = em.y * (height / GH);
                const dist = Math.hypot(px - sx, py - sy);
                if (dist < 22) {
                    draggedEmitterRef.current = em;
                    return;
                }
            }

            const cfg = configRef.current;
            if (cfg.tool === 'emitter') {
                if (emittersRef.current.length < 5) {
                    const newEm: WaveEmitter = {
                        id: `e-${Date.now()}`,
                        x: Math.max(2, Math.min(GW - 3, gx)),
                        y: Math.max(2, Math.min(GH - 3, gy)),
                        frequency: cfg.emitterFrequency,
                        amplitude: cfg.emitterAmplitude,
                        phase: 0,
                    };
                    emittersRef.current.push(newEm);
                    draggedEmitterRef.current = newEm;
                }
            } else if (cfg.tool === 'ripple') {
                // Splash ripple
                const uCurr = uCurrentRef.current;
                const uPrev = uPrevRef.current;
                const r = 4;
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        const nx = gx + dx;
                        const ny = gy + dy;
                        if (nx >= 1 && nx < GW - 1 && ny >= 1 && ny < GH - 1) {
                            const added = 3.8 * Math.exp(-(dx * dx + dy * dy) / 4);
                            const idx = ny * GW + nx;
                            uCurr[idx] += added;
                            uPrev[idx] += added * 0.5;
                        }
                    }
                }
            } else if (cfg.tool === 'wall') {
                // Toggle obstacle wall (right-click or shift-click erases)
                const isErase = ('button' in e && e.button === 2) || ('shiftKey' in e && e.shiftKey);
                const wallVal = isErase ? 0 : 1;
                const walls = wallsRef.current;
                const r = 2;
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        const nx = gx + dx;
                        const ny = gy + dy;
                        if (nx >= 1 && nx < GW - 1 && ny >= 1 && ny < GH - 1) {
                            walls[ny * GW + nx] = wallVal;
                        }
                    }
                }
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

            const gx = Math.floor((px / width) * GW);
            const gy = Math.floor((py / height) * GH);

            mouseRef.current.x = px;
            mouseRef.current.y = py;
            mouseRef.current.gridX = gx;
            mouseRef.current.gridY = gy;

            if (draggedEmitterRef.current) {
                // Dragging emitter (Doppler compression happens naturally if moving fast!)
                draggedEmitterRef.current.x = Math.max(3, Math.min(GW - 4, gx));
                draggedEmitterRef.current.y = Math.max(3, Math.min(GH - 4, gy));
            } else if (mouseRef.current.isDown) {
                const cfg = configRef.current;
                if (cfg.tool === 'ripple') {
                    const uCurr = uCurrentRef.current;
                    const uPrev = uPrevRef.current;
                    if (gx >= 1 && gx < GW - 1 && gy >= 1 && gy < GH - 1) {
                        const idx = gy * GW + gx;
                        uCurr[idx] += 1.8;
                        uPrev[idx] += 0.9;
                    }
                } else if (cfg.tool === 'wall') {
                    const isErase = ('button' in e && e.button === 2) || ('shiftKey' in e && e.shiftKey);
                    const wallVal = isErase ? 0 : 1;
                    const walls = wallsRef.current;
                    const r = 2;
                    for (let dy = -r; dy <= r; dy++) {
                        for (let dx = -r; dx <= r; dx++) {
                            const nx = gx + dx;
                            const ny = gy + dy;
                            if (nx >= 1 && nx < GW - 1 && ny >= 1 && ny < GH - 1) {
                                walls[ny * GW + nx] = wallVal;
                            }
                        }
                    }
                }
            }
        };

        const handlePointerUp = () => {
            mouseRef.current.isDown = false;
            draggedEmitterRef.current = null;
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        resize();
        render();

        window.addEventListener('resize', resize);
        canvas.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        canvas.addEventListener('contextmenu', handleContextMenu);

        canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            canvas.removeEventListener('contextmenu', handleContextMenu);

            canvas.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef]);

    return { reset };
};
