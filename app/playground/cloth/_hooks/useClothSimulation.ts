"use client";

import { useEffect, useRef, useCallback } from 'react';
import { ClothConfig, PinMode } from '../_utils/types';
import { checkSegmentIntersection } from '../_utils/constants';

interface Point {
    x: number;
    y: number;
    ox: number;
    oy: number;
    pinned: boolean;
}

interface Constraint {
    p1: Point;
    p2: Point;
    length: number;
    isCut: boolean;
    isShear?: boolean;
}

export const useClothSimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: ClothConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    const pointsRef = useRef<Point[]>([]);
    const constraintsRef = useRef<Constraint[]>([]);
    const draggedPointRef = useRef<Point | null>(null);

    const mouseRef = useRef<{
        x: number;
        y: number;
        prevX: number;
        prevY: number;
        isLeftDown: boolean;
        isRightDown: boolean;
    }>({ x: -1000, y: -1000, prevX: -1000, prevY: -1000, isLeftDown: false, isRightDown: false });

    const cutTrailRef = useRef<{ x: number; y: number; time: number }[]>([]);

    const buildCloth = useCallback((w: number, h: number, pinMode: PinMode) => {
        const isMobile = w < 768;
        const cols = isMobile ? 26 : 42;
        const rows = isMobile ? 20 : 30;

        const maxAvailableW = w * 0.82;
        const maxAvailableH = h * 0.58;
        const spacing = Math.min(maxAvailableW / cols, maxAvailableH / rows, 17);

        const startX = (w - (cols - 1) * spacing) / 2;
        const startY = Math.max(65, h * 0.12);

        const grid: Point[][] = [];
        const allPoints: Point[] = [];
        const allConstraints: Constraint[] = [];

        for (let r = 0; r < rows; r++) {
            grid[r] = [];
            for (let c = 0; c < cols; c++) {
                const px = startX + c * spacing;
                const py = startY + r * spacing;

                let pinned = false;
                if (pinMode === 'top-rod') {
                    pinned = r === 0;
                } else if (pinMode === 'two-corners') {
                    pinned = r === 0 && (c === 0 || c === cols - 1);
                } else if (pinMode === 'four-corners') {
                    pinned = (r === 0 || r === rows - 1) && (c === 0 || c === cols - 1);
                } else if (pinMode === 'draped') {
                    pinned = r === 0 && (c % 5 === 0 || c === cols - 1);
                }

                const pt: Point = { x: px, y: py, ox: px, oy: py, pinned };
                grid[r][c] = pt;
                allPoints.push(pt);
            }
        }

        // Restrições estruturais horizontais e verticais
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (c < cols - 1) {
                    allConstraints.push({
                        p1: grid[r][c],
                        p2: grid[r][c + 1],
                        length: spacing,
                        isCut: false,
                    });
                }
                if (r < rows - 1) {
                    allConstraints.push({
                        p1: grid[r][c],
                        p2: grid[r + 1][c],
                        length: spacing,
                        isCut: false,
                    });
                }
                // Cisalhamento estrutural suave
                if (r < rows - 1 && c < cols - 1) {
                    allConstraints.push({
                        p1: grid[r][c],
                        p2: grid[r + 1][c + 1],
                        length: spacing * 1.4142,
                        isCut: false,
                        isShear: true,
                    });
                }
            }
        }

        pointsRef.current = allPoints;
        constraintsRef.current = allConstraints;
        draggedPointRef.current = null;
    }, []);

    useEffect(() => {
        const prevPinMode = configRef.current.pinMode;
        configRef.current = config;

        if (config.pinMode !== prevPinMode) {
            const container = containerRef.current;
            if (container) {
                buildCloth(container.clientWidth, container.clientHeight, config.pinMode);
            }
        }
    }, [config, buildCloth, containerRef]);

    const reset = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        buildCloth(container.clientWidth, container.clientHeight, configRef.current.pinMode);
    }, [buildCloth, containerRef]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let w = 0, h = 0;
        let prevW = 0, prevH = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = container.clientWidth;
            h = container.clientHeight;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);

            if (pointsRef.current.length === 0 || Math.abs(w - prevW) > 25 || Math.abs(h - prevH) > 25) {
                prevW = w;
                prevH = h;
                buildCloth(w, h, configRef.current.pinMode);
            }
        };

        const startTime = performance.now();

        const render = () => {
            const now = performance.now();
            const time = (now - startTime) * 0.001;

            const { gravity, windStrength, solverIterations, friction, toolMode, tearable } = configRef.current;
            const mouse = mouseRef.current;

            const isCutting = mouse.isRightDown || (toolMode === 'cut' && mouse.isLeftDown);

            // Corte de conexões sob a trajetória do ponteiro ou clique direto
            if (isCutting && mouse.prevX > -100 && mouse.x > -100) {
                cutTrailRef.current.push({ x: mouse.x, y: mouse.y, time: now });

                const constraints = constraintsRef.current;
                const cLen = constraints.length;
                for (let i = 0; i < cLen; i++) {
                    const c = constraints[i];
                    if (c.isCut) continue;

                    const intersected = checkSegmentIntersection(
                        mouse.prevX, mouse.prevY,
                        mouse.x, mouse.y,
                        c.p1.x, c.p1.y,
                        c.p2.x, c.p2.y
                    );

                    if (intersected) {
                        c.isCut = true;
                    } else {
                        // Corte por proximidade (clique ou toque estático sobre a fibra)
                        const segX = c.p2.x - c.p1.x;
                        const segY = c.p2.y - c.p1.y;
                        const segLenSq = segX * segX + segY * segY;
                        if (segLenSq > 0) {
                            const t = Math.max(0, Math.min(1, ((mouse.x - c.p1.x) * segX + (mouse.y - c.p1.y) * segY) / segLenSq));
                            const projX = c.p1.x + t * segX;
                            const projY = c.p1.y + t * segY;
                            const distSq = (mouse.x - projX) * (mouse.x - projX) + (mouse.y - projY) * (mouse.y - projY);
                            if (distSq < 64) {
                                c.isCut = true;
                            }
                        }
                    }
                }
            }

            // Vento procedural senoidal em rajadas
            const windX = windStrength * (Math.sin(time * 2.8) * 0.5 + Math.cos(time * 1.5) * 0.3 + 0.2);
            const windY = windStrength * Math.sin(time * 2.0) * 0.1;

            const points = pointsRef.current;
            const pLen = points.length;

            // Integração Verlet dos nós livres
            for (let i = 0; i < pLen; i++) {
                const pt = points[i];
                if (pt.pinned) continue;

                if (pt === draggedPointRef.current) {
                    pt.ox = pt.x;
                    pt.oy = pt.y;
                    pt.x = mouse.x;
                    pt.y = mouse.y;
                    continue;
                }

                const vx = (pt.x - pt.ox) * friction;
                const vy = (pt.y - pt.oy) * friction;

                pt.ox = pt.x;
                pt.oy = pt.y;

                pt.x += vx + windX;
                pt.y += vy + gravity + windY;
            }

            // Relaxamento de restrições (solver iterativo)
            const constraints = constraintsRef.current;
            const cLen = constraints.length;

            for (let iter = 0; iter < solverIterations; iter++) {
                for (let i = 0; i < cLen; i++) {
                    const c = constraints[i];
                    if (c.isCut) continue;

                    const p1 = c.p1;
                    const p2 = c.p2;

                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist === 0) continue;

                    // Rasgo por tração excessiva
                    if (tearable && dist > c.length * 4.8) {
                        c.isCut = true;
                        continue;
                    }

                    const diff = (dist - c.length) / dist;

                    const f1 = p1.pinned ? 0 : p2.pinned ? 1 : 0.5;
                    const f2 = p2.pinned ? 0 : p1.pinned ? 1 : 0.5;

                    p1.x += dx * diff * f1;
                    p1.y += dy * diff * f1;
                    p2.x -= dx * diff * f2;
                    p2.y -= dy * diff * f2;
                }
            }

            // Atualizar rastro do corte
            cutTrailRef.current = cutTrailRef.current.filter((t) => now - t.time < 350);

            mouse.prevX = mouse.x;
            mouse.prevY = mouse.y;

            // Renderização no Canvas 2D
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);

            // Desenhar linhas do tecido
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(251, 113, 133, 0.45)'; // rose-400 suave
            ctx.beginPath();

            for (let i = 0; i < cLen; i++) {
                const c = constraints[i];
                if (c.isCut || c.isShear) continue;
                ctx.moveTo(c.p1.x, c.p1.y);
                ctx.lineTo(c.p2.x, c.p2.y);
            }
            ctx.stroke();

            // Desenhar conexões de cisalhamento mais sutis
            ctx.strokeStyle = 'rgba(251, 113, 133, 0.12)';
            ctx.beginPath();
            for (let i = 0; i < cLen; i++) {
                const c = constraints[i];
                if (c.isCut || !c.isShear) continue;
                ctx.moveTo(c.p1.x, c.p1.y);
                ctx.lineTo(c.p2.x, c.p2.y);
            }
            ctx.stroke();

            // Pinos de fixação no topo
            ctx.fillStyle = '#f43f5e';
            for (let i = 0; i < pLen; i++) {
                const pt = points[i];
                if (pt.pinned) {
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Traço visual da tesoura/corte
            if (cutTrailRef.current.length > 1) {
                const trail = cutTrailRef.current;
                ctx.beginPath();
                ctx.moveTo(trail[0].x, trail[0].y);
                for (let i = 1; i < trail.length; i++) {
                    ctx.lineTo(trail[i].x, trail[i].y);
                }
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            requestRef.current = requestAnimationFrame(render);
        };

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            const rect = container.getBoundingClientRect();
            const posX = clientX - rect.left;
            const posY = clientY - rect.top;

            const isRight = 'button' in e && e.button === 2;

            mouseRef.current.x = posX;
            mouseRef.current.y = posY;
            mouseRef.current.prevX = posX;
            mouseRef.current.prevY = posY;

            if (isRight) {
                mouseRef.current.isRightDown = true;
            } else {
                mouseRef.current.isLeftDown = true;

                // Selecionar ponto mais próximo para arrastar
                if (configRef.current.toolMode === 'grab') {
                    let closestPt: Point | null = null;
                    let minDistSq = 45 * 45;

                    const points = pointsRef.current;
                    for (let i = 0; i < points.length; i++) {
                        const pt = points[i];
                        if (pt.pinned) continue;
                        const dx = pt.x - posX;
                        const dy = pt.y - posY;
                        const dSq = dx * dx + dy * dy;
                        if (dSq < minDistSq) {
                            minDistSq = dSq;
                            closestPt = pt;
                        }
                    }
                    draggedPointRef.current = closestPt;
                }
            }
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            const rect = container.getBoundingClientRect();
            mouseRef.current.x = clientX - rect.left;
            mouseRef.current.y = clientY - rect.top;
        };

        const handlePointerUp = (e: MouseEvent | TouchEvent) => {
            const isRight = 'button' in e && e.button === 2;
            if (isRight) {
                mouseRef.current.isRightDown = false;
            } else {
                mouseRef.current.isLeftDown = false;
                draggedPointRef.current = null;
            }
        };

        const handleMouseLeave = () => {
            mouseRef.current.isLeftDown = false;
            mouseRef.current.isRightDown = false;
            draggedPointRef.current = null;
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        resize();
        render();

        window.addEventListener('resize', resize);
        container.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        container.addEventListener('mouseleave', handleMouseLeave);
        container.addEventListener('contextmenu', handleContextMenu);

        container.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            container.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            container.removeEventListener('mouseleave', handleMouseLeave);
            container.removeEventListener('contextmenu', handleContextMenu);

            container.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef, buildCloth]);

    return { reset };
};
