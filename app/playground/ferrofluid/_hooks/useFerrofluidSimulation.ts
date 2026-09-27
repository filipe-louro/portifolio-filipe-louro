"use client";

import { useEffect, useRef, useCallback } from 'react';
import { FerrofluidConfig, MagnetPole } from '../_utils/types';

interface FluidParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    life: number;
}

export const useFerrofluidSimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: FerrofluidConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    // Draggable magnetic poles
    const polesRef = useRef<MagnetPole[]>([
        { id: 'pole-1', x: 0, y: 0, strength: 1.0, radius: 24 },
        { id: 'pole-2', x: 0, y: 0, strength: -1.0, radius: 24 },
    ]);

    // Fluid core position & velocity
    const fluidCoreRef = useRef({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        baseRadius: 100,
    });

    // Mesh vertices for the Rosensweig spike perimeter
    const VERTICES = 180;
    const perimeterRadiiRef = useRef<Float32Array>(new Float32Array(VERTICES));
    const perimeterVelRef = useRef<Float32Array>(new Float32Array(VERTICES));

    // Satellite micro-droplets
    const dropletsRef = useRef<FluidParticle[]>([]);

    // Dragging state
    const draggedItemRef = useRef<{
        type: 'pole' | 'core' | null;
        index: number;
        offsetX: number;
        offsetY: number;
    }>({ type: null, index: -1, offsetX: 0, offsetY: 0 });

    const mouseRef = useRef({ x: -1000, y: -1000, isDown: false });

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const initScene = useCallback((width: number, height: number) => {
        const cx = width * 0.5;
        const cy = height * 0.5;

        fluidCoreRef.current = {
            x: cx,
            y: cy,
            vx: 0,
            vy: 0,
            baseRadius: Math.min(width, height) * 0.16,
        };

        // Initialize 2 poles flanking the ferrofluid
        const offset = Math.min(width, height) * 0.28;
        polesRef.current = [
            { id: 'pole-1', x: cx - offset, y: cy, strength: 1.2, radius: 22 },
            { id: 'pole-2', x: cx + offset, y: cy, strength: -1.2, radius: 22 },
        ];

        // Reset perimeter
        for (let i = 0; i < VERTICES; i++) {
            perimeterRadiiRef.current[i] = fluidCoreRef.current.baseRadius;
            perimeterVelRef.current[i] = 0;
        }

        // Spawn magnetic microdroplets
        const drops: FluidParticle[] = [];
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = fluidCoreRef.current.baseRadius * (1.2 + Math.random() * 1.5);
            drops.push({
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                radius: 2 + Math.random() * 4,
                life: 1,
            });
        }
        dropletsRef.current = drops;
    }, []);

    const reset = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        initScene(canvas.clientWidth, canvas.clientHeight);
    }, [canvasRef, initScene]);

    const togglePolesPolarity = useCallback(() => {
        polesRef.current.forEach((p) => {
            p.strength = -p.strength;
        });
    }, []);

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

            if (fluidCoreRef.current.x === 0 && fluidCoreRef.current.y === 0) {
                initScene(width, height);
            }
        };

        const calcMagneticField = (x: number, y: number, cfgStrength: number) => {
            let bx = 0;
            let by = 0;
            for (let i = 0; i < polesRef.current.length; i++) {
                const pole = polesRef.current[i];
                const dx = x - pole.x;
                const dy = y - pole.y;
                const distSq = dx * dx + dy * dy + 400; // softening
                const dist = Math.sqrt(distSq);
                const q = pole.strength * cfgStrength * 16000;
                // Field vector from pole: B = q / r^2 * r_hat
                bx += (dx / dist) * (q / distSq);
                by += (dy / dist) * (q / distSq);
            }
            const mag = Math.sqrt(bx * bx + by * by);
            return { bx, by, mag };
        };

        let lastTime = performance.now();

        const render = () => {
            const now = performance.now();
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            const cfg = configRef.current;
            const core = fluidCoreRef.current;
            const poles = polesRef.current;

            // Clear frame
            ctx.fillStyle = '#030712';
            ctx.fillRect(0, 0, width, height);

            // 1. Draw magnetic field lines / flux visualization
            if (cfg.showFieldLines) {
                ctx.save();
                const step = 42;
                const cols = Math.ceil(width / step);
                const rows = Math.ceil(height / step);

                for (let r = 0; r <= rows; r++) {
                    const py = r * step;
                    for (let c = 0; c <= cols; c++) {
                        const px = c * step;
                        const f = calcMagneticField(px, py, cfg.fieldStrength);
                        if (f.mag > 0.05) {
                            const angle = Math.atan2(f.by, f.bx);
                            const intensity = Math.min(f.mag * 0.45, 1.0);
                            const lineLen = Math.min(step * 0.45, 6 + intensity * 14);

                            ctx.strokeStyle = `rgba(56, 189, 248, ${0.06 + intensity * 0.22})`;
                            ctx.lineWidth = 1.0 + intensity * 1.2;
                            ctx.beginPath();
                            const hx = Math.cos(angle) * lineLen * 0.5;
                            const hy = Math.sin(angle) * lineLen * 0.5;
                            ctx.moveTo(px - hx, py - hy);
                            ctx.lineTo(px + hx, py + hy);
                            ctx.stroke();
                        }
                    }
                }
                ctx.restore();
            }

            // 2. Physics: update ferrofluid core position
            if (draggedItemRef.current.type !== 'core') {
                // Attracted toward the weighted center of magnetic flux
                let targetX = 0;
                let targetY = 0;
                let totalWeight = 0;

                for (const pole of poles) {
                    const w = Math.abs(pole.strength);
                    targetX += pole.x * w;
                    targetY += pole.y * w;
                    totalWeight += w;
                }

                if (totalWeight > 0) {
                    targetX /= totalWeight;
                    targetY /= totalWeight;
                    const fx = (targetX - core.x) * 2.2 * cfg.fieldStrength;
                    const fy = (targetY - core.y) * 2.2 * cfg.fieldStrength;

                    core.vx = (core.vx + fx * dt) * cfg.viscosity;
                    core.vy = (core.vy + fy * dt) * cfg.viscosity;

                    core.x += core.vx;
                    core.y += core.vy;
                }
            }

            // 3. Compute Rosensweig perimeter spikes
            const radii = perimeterRadiiRef.current;
            const vels = perimeterVelRef.current;
            const targetRadii = new Float32Array(VERTICES);

            const baseR = core.baseRadius;
            const B_CRITICAL = 0.45;

            for (let i = 0; i < VERTICES; i++) {
                const theta = (i / VERTICES) * Math.PI * 2;
                const vx = core.x + Math.cos(theta) * baseR;
                const vy = core.y + Math.sin(theta) * baseR;

                const f = calcMagneticField(vx, vy, cfg.fieldStrength);
                let spike = 0;

                if (f.mag > B_CRITICAL) {
                    // Rosensweig instability: Spikes align with field vector
                    const fieldAngle = Math.atan2(f.by, f.bx);
                    // Angle difference between surface normal and field direction
                    const alignment = Math.abs(Math.cos(theta - fieldAngle));
                    const excess = f.mag - B_CRITICAL;
                    // Spike harmonic modulation
                    const frequencyMod = Math.cos(theta * 14 + now * 0.002);
                    spike = (excess * 24 * cfg.spikeSharpness) * Math.pow(alignment, 1.8) * (0.8 + 0.3 * frequencyMod);
                }

                targetRadii[i] = baseR + Math.min(spike, baseR * 1.5);
            }

            // Surface tension & viscous relaxation
            const tens = cfg.surfaceTension;
            const visc = cfg.viscosity;

            for (let i = 0; i < VERTICES; i++) {
                const prev = (i - 1 + VERTICES) % VERTICES;
                const next = (i + 1) % VERTICES;
                // Laplacian smoothing for surface tension
                const smoothedTarget = targetRadii[i] * (1 - tens) + (targetRadii[prev] + targetRadii[next]) * 0.5 * tens;

                const diff = smoothedTarget - radii[i];
                vels[i] = (vels[i] + diff * 12.0 * dt) * visc;
                radii[i] += vels[i];
            }

            // 4. Render Ferrofluid body
            ctx.save();
            const polyPoints: { x: number; y: number }[] = [];
            for (let i = 0; i < VERTICES; i++) {
                const theta = (i / VERTICES) * Math.PI * 2;
                const r = radii[i];
                polyPoints.push({
                    x: core.x + Math.cos(theta) * r,
                    y: core.y + Math.sin(theta) * r,
                });
            }

            // Path creation with smooth bezier / spline
            ctx.beginPath();
            if (polyPoints.length > 0) {
                const first = polyPoints[0];
                const last = polyPoints[polyPoints.length - 1];
                ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);

                for (let i = 0; i < polyPoints.length; i++) {
                    const current = polyPoints[i];
                    const next = polyPoints[(i + 1) % polyPoints.length];
                    const midX = (current.x + next.x) / 2;
                    const midY = (current.y + next.y) / 2;
                    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
                }
            }
            ctx.closePath();

            // Liquid base fill - Deep Metallic Obsidian with blue specular
            const bodyGrad = ctx.createRadialGradient(
                core.x - baseR * 0.3,
                core.y - baseR * 0.3,
                baseR * 0.1,
                core.x,
                core.y,
                baseR * 2.2
            );

            if (cfg.metallicSheen) {
                bodyGrad.addColorStop(0, '#38bdf8'); // metallic core highlight
                bodyGrad.addColorStop(0.18, '#1e293b'); // gunmetal sheen
                bodyGrad.addColorStop(0.55, '#090d16'); // deep ferro liquid
                bodyGrad.addColorStop(0.9, '#020617'); // edge black
                bodyGrad.addColorStop(1, '#0f172a'); // rim light
            } else {
                bodyGrad.addColorStop(0, '#1e293b');
                bodyGrad.addColorStop(1, '#05070c');
            }

            ctx.fillStyle = bodyGrad;
            ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
            ctx.shadowBlur = 24;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Metallic rim stroke
            ctx.strokeStyle = cfg.metallicSheen ? 'rgba(147, 197, 253, 0.7)' : 'rgba(100, 116, 139, 0.5)';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Inner specular liquid reflection ring
            ctx.save();
            ctx.clip();
            const specGrad = ctx.createLinearGradient(
                core.x - baseR,
                core.y - baseR,
                core.x + baseR,
                core.y + baseR
            );
            specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            specGrad.addColorStop(0.2, 'rgba(56, 189, 248, 0.15)');
            specGrad.addColorStop(0.5, 'transparent');
            specGrad.addColorStop(0.85, 'rgba(125, 211, 252, 0.25)');
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

            ctx.fillStyle = specGrad;
            ctx.fillRect(core.x - baseR * 3, core.y - baseR * 3, baseR * 6, baseR * 6);
            ctx.restore();
            ctx.restore();

            // 5. Update and render satellite micro-droplets
            const drops = dropletsRef.current;
            for (let i = 0; i < drops.length; i++) {
                const d = drops[i];
                const f = calcMagneticField(d.x, d.y, cfg.fieldStrength);

                // Magnetic acceleration
                d.vx = (d.vx + f.bx * 0.15 * dt) * 0.96;
                d.vy = (d.vy + f.by * 0.15 * dt) * 0.96;

                // Drift toward core if too far, repelled if inside
                const dxCore = core.x - d.x;
                const dyCore = core.y - d.y;
                const distCore = Math.sqrt(dxCore * dxCore + dyCore * dyCore);

                if (distCore > baseR * 3.5) {
                    d.vx += (dxCore / distCore) * 0.8;
                    d.vy += (dyCore / distCore) * 0.8;
                }

                d.x += d.vx;
                d.y += d.vy;

                // Render micro droplet
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#0f172a';
                ctx.fill();
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Specular highlight on drop
                ctx.beginPath();
                ctx.arc(d.x - d.radius * 0.3, d.y - d.radius * 0.3, d.radius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fill();
            }

            // 6. Draw magnetic poles
            if (cfg.showPoles) {
                poles.forEach((pole, idx) => {
                    const isNorth = pole.strength > 0;
                    const isDragging = draggedItemRef.current.type === 'pole' && draggedItemRef.current.index === idx;

                    // Glow halo
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(pole.x, pole.y, pole.radius + 14, 0, Math.PI * 2);
                    ctx.fillStyle = isNorth ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)';
                    ctx.fill();

                    // Magnet Body Ring
                    ctx.beginPath();
                    ctx.arc(pole.x, pole.y, pole.radius, 0, Math.PI * 2);
                    const poleGrad = ctx.createRadialGradient(
                        pole.x - 4,
                        pole.y - 4,
                        2,
                        pole.x,
                        pole.y,
                        pole.radius
                    );
                    if (isNorth) {
                        poleGrad.addColorStop(0, '#f87171');
                        poleGrad.addColorStop(0.7, '#dc2626');
                        poleGrad.addColorStop(1, '#991b1b');
                    } else {
                        poleGrad.addColorStop(0, '#60a5fa');
                        poleGrad.addColorStop(0.7, '#2563eb');
                        poleGrad.addColorStop(1, '#1e40af');
                    }
                    ctx.fillStyle = poleGrad;
                    ctx.shadowColor = isNorth ? '#ef4444' : '#3b82f6';
                    ctx.shadowBlur = isDragging ? 22 : 12;
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = isDragging ? 2.5 : 1.5;
                    ctx.stroke();

                    // Polarity label N / S
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(isNorth ? 'N' : 'S', pole.x, pole.y);

                    ctx.restore();
                });
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
            mouseRef.current.isDown = true;

            // Check if clicking pole
            for (let i = 0; i < polesRef.current.length; i++) {
                const pole = polesRef.current[i];
                const dx = px - pole.x;
                const dy = py - pole.y;
                if (Math.sqrt(dx * dx + dy * dy) <= pole.radius + 12) {
                    draggedItemRef.current = {
                        type: 'pole',
                        index: i,
                        offsetX: dx,
                        offsetY: dy,
                    };
                    return;
                }
            }

            // Check if clicking fluid core
            const core = fluidCoreRef.current;
            const dx = px - core.x;
            const dy = py - core.y;
            if (Math.sqrt(dx * dx + dy * dy) <= core.baseRadius * 1.2) {
                draggedItemRef.current = {
                    type: 'core',
                    index: 0,
                    offsetX: dx,
                    offsetY: dy,
                };
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

            mouseRef.current.x = px;
            mouseRef.current.y = py;

            const drag = draggedItemRef.current;
            if (drag.type === 'pole' && drag.index >= 0) {
                const pole = polesRef.current[drag.index];
                if (pole) {
                    pole.x = px - drag.offsetX;
                    pole.y = py - drag.offsetY;
                }
            } else if (drag.type === 'core') {
                const core = fluidCoreRef.current;
                core.x = px - drag.offsetX;
                core.y = py - drag.offsetY;
                core.vx = 0;
                core.vy = 0;
            }
        };

        const handlePointerUp = () => {
            mouseRef.current.isDown = false;
            draggedItemRef.current = { type: null, index: -1, offsetX: 0, offsetY: 0 };
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
    }, [canvasRef, containerRef, initScene]);

    return { reset, togglePolesPolarity };
};
