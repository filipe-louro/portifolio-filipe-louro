"use client";

import { useEffect, useRef, useCallback } from 'react';
import { JellyConfig } from '../_utils/types';

interface Point {
    x: number;
    y: number;
    ox: number;
    oy: number;
    mass: number;
}

interface Spring {
    p1: Point;
    p2: Point;
    length: number;
    stiffness: number;
}

interface Obstacle {
    x: number;
    y: number;
    radius: number;
}

const VERTEX_COUNT = 28;

export const useJellySimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: JellyConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    const centerPointRef = useRef<Point>({ x: 0, y: 0, ox: 0, oy: 0, mass: 2 });
    const perimeterPointsRef = useRef<Point[]>([]);
    const innerRingPointsRef = useRef<Point[]>([]);
    const springsRef = useRef<Spring[]>([]);
    const targetAreaRef = useRef<number>(0);

    const draggedNodeRef = useRef<Point | null>(null);
    const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const mouseRef = useRef<{
        x: number;
        y: number;
        prevX: number;
        prevY: number;
        vx: number;
        vy: number;
        isDown: boolean;
        isRightDown: boolean;
    }>({ x: -1000, y: -1000, prevX: -1000, prevY: -1000, vx: 0, vy: 0, isDown: false, isRightDown: false });

    const obstaclesRef = useRef<Obstacle[]>([]);

    const buildJelly = useCallback((w: number, h: number, targetRadius: number) => {
        const cx = w * 0.5;
        const cy = Math.max(120, h * 0.38);

        const center: Point = { x: cx, y: cy, ox: cx, oy: cy, mass: 2.5 };
        centerPointRef.current = center;

        const perimeter: Point[] = [];
        const innerRing: Point[] = [];
        const springs: Spring[] = [];

        // Geometria inicial: círculo regular
        for (let i = 0; i < VERTEX_COUNT; i++) {
            const angle = (i / VERTEX_COUNT) * Math.PI * 2;
            const px = cx + Math.cos(angle) * targetRadius;
            const py = cy + Math.sin(angle) * targetRadius;
            perimeter.push({ x: px, y: py, ox: px, oy: py, mass: 1 });

            // Anel intermediário para integridade estrutural contra auto-inversão
            const rx = cx + Math.cos(angle) * (targetRadius * 0.55);
            const ry = cy + Math.sin(angle) * (targetRadius * 0.55);
            innerRing.push({ x: rx, y: ry, ox: rx, oy: ry, mass: 1 });
        }

        // Molas perimétricas
        for (let i = 0; i < VERTEX_COUNT; i++) {
            const next = (i + 1) % VERTEX_COUNT;
            const dx = perimeter[next].x - perimeter[i].x;
            const dy = perimeter[next].y - perimeter[i].y;
            springs.push({
                p1: perimeter[i],
                p2: perimeter[next],
                length: Math.sqrt(dx * dx + dy * dy),
                stiffness: 0.8,
            });

            // Conexões intermediárias
            const inNext = (i + 1) % VERTEX_COUNT;
            const idx = innerRing[inNext].x - innerRing[i].x;
            const idy = innerRing[inNext].y - innerRing[i].y;
            springs.push({
                p1: innerRing[i],
                p2: innerRing[inNext],
                length: Math.sqrt(idx * idx + idy * idy),
                stiffness: 0.6,
            });

            // Raios: perímetro para anel interno e anel para centro
            springs.push({
                p1: perimeter[i],
                p2: innerRing[i],
                length: targetRadius * 0.45,
                stiffness: 0.7,
            });
            springs.push({
                p1: innerRing[i],
                p2: center,
                length: targetRadius * 0.55,
                stiffness: 0.7,
            });

            // Reforço em cruz (strut) para rigidez ao cisalhamento
            const crossIdx = (i + Math.floor(VERTEX_COUNT / 4)) % VERTEX_COUNT;
            const cdx = perimeter[crossIdx].x - perimeter[i].x;
            const cdy = perimeter[crossIdx].y - perimeter[i].y;
            springs.push({
                p1: perimeter[i],
                p2: perimeter[crossIdx],
                length: Math.sqrt(cdx * cdx + cdy * cdy),
                stiffness: 0.35,
            });
        }

        perimeterPointsRef.current = perimeter;
        innerRingPointsRef.current = innerRing;
        springsRef.current = springs;
        targetAreaRef.current = Math.PI * targetRadius * targetRadius;
        draggedNodeRef.current = null;

        // Obstáculos fixos estilizados
        obstaclesRef.current = [
            { x: w * 0.3, y: h * 0.62, radius: Math.min(50, w * 0.08) },
            { x: w * 0.7, y: h * 0.65, radius: Math.min(65, w * 0.1) },
        ];
    }, []);

    useEffect(() => {
        const prevRadius = configRef.current.radius;
        configRef.current = config;

        if (Math.abs(config.radius - prevRadius) > 2) {
            const container = containerRef.current;
            if (container) {
                buildJelly(container.clientWidth, container.clientHeight, config.radius);
            }
        }
    }, [config, buildJelly, containerRef]);

    const reset = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        buildJelly(container.clientWidth, container.clientHeight, configRef.current.radius);
    }, [buildJelly, containerRef]);

    const launchJelly = useCallback(() => {
        const center = centerPointRef.current;
        const perimeter = perimeterPointsRef.current;
        const innerRing = innerRingPointsRef.current;
        const all = [center, ...perimeter, ...innerRing];

        const impulseX = (Math.random() - 0.5) * 28;
        const impulseY = -18 - Math.random() * 8;

        for (let i = 0; i < all.length; i++) {
            all[i].ox = all[i].x - impulseX;
            all[i].oy = all[i].y - impulseY;
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
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

            if (perimeterPointsRef.current.length === 0 || Math.abs(w - prevW) > 30 || Math.abs(h - prevH) > 30) {
                prevW = w;
                prevH = h;
                buildJelly(w, h, configRef.current.radius);
            }
        };

        const render = () => {
            const { pressure, stiffness, damping, gravity, showSkeleton, showObstacles } = configRef.current;
            const mouse = mouseRef.current;

            const center = centerPointRef.current;
            const perimeter = perimeterPointsRef.current;
            const innerRing = innerRingPointsRef.current;
            const springs = springsRef.current;
            const obstacles = obstaclesRef.current;
            const allPoints = [center, ...perimeter, ...innerRing];

            const pLen = perimeter.length;
            const sLen = springs.length;
            const allLen = allPoints.length;

            // 1. Interação do Mouse / Toque
            if (draggedNodeRef.current) {
                draggedNodeRef.current.x = mouse.x + dragOffsetRef.current.x;
                draggedNodeRef.current.y = mouse.y + dragOffsetRef.current.y;
            } else if (mouse.isDown || mouse.isRightDown) {
                // Squeeze / Poke repulsor sob o cursor
                const pokeRadius = mouse.isRightDown ? 120 : 80;
                const pokeForce = mouse.isRightDown ? 18 : 10;
                for (let i = 0; i < allLen; i++) {
                    const pt = allPoints[i];
                    const dx = pt.x - mouse.x;
                    const dy = pt.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0 && dist < pokeRadius) {
                        const factor = (1 - dist / pokeRadius) * pokeForce;
                        pt.x += (dx / dist) * factor;
                        pt.y += (dy / dist) * factor;
                    }
                }
            }

            // 2. Integração Verlet para todos os pontos
            for (let i = 0; i < allLen; i++) {
                const pt = allPoints[i];
                if (pt === draggedNodeRef.current) continue;

                const vx = (pt.x - pt.ox) * damping;
                const vy = (pt.y - pt.oy) * damping;

                pt.ox = pt.x;
                pt.oy = pt.y;

                pt.x += vx;
                pt.y += vy + gravity;
            }

            // 3. Cálculo da Área do Polígono Perimétrico (Teorema de Gauss / Shoelace)
            let currentArea = 0;
            for (let i = 0; i < pLen; i++) {
                const next = (i + 1) % pLen;
                currentArea += perimeter[i].x * perimeter[next].y - perimeter[next].x * perimeter[i].y;
            }
            currentArea = Math.abs(currentArea * 0.5);

            // Força de Pressão Hidrostática Normal para Conservação Volumétrica
            const targetArea = targetAreaRef.current;
            const areaDelta = (targetArea - currentArea) / targetArea;
            const pressureForce = areaDelta * pressure * 2.8;

            for (let i = 0; i < pLen; i++) {
                const next = (i + 1) % pLen;
                const p1 = perimeter[i];
                const p2 = perimeter[next];

                const edgeX = p2.x - p1.x;
                const edgeY = p2.y - p1.y;
                const edgeLen = Math.sqrt(edgeX * edgeX + edgeY * edgeY);

                if (edgeLen > 0.001) {
                    // Vetor normal apontando para fora em coordenadas de tela (sentido horário)
                    const nx = edgeY / edgeLen;
                    const ny = -edgeX / edgeLen;

                    const fx = nx * edgeLen * pressureForce * 0.5;
                    const fy = ny * edgeLen * pressureForce * 0.5;

                    if (p1 !== draggedNodeRef.current) {
                        p1.x += fx;
                        p1.y += fy;
                    }
                    if (p2 !== draggedNodeRef.current) {
                        p2.x += fx;
                        p2.y += fy;
                    }
                }
            }

            // 4. Relaxamento iterativo de molas elásticas
            const iterations = 5;
            for (let iter = 0; iter < iterations; iter++) {
                for (let i = 0; i < sLen; i++) {
                    const s = springs[i];
                    const p1 = s.p1;
                    const p2 = s.p2;

                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 0.0001) {
                        const diff = ((dist - s.length) / dist) * s.stiffness * stiffness;
                        const offsetX = dx * diff * 0.5;
                        const offsetY = dy * diff * 0.5;

                        if (p1 !== draggedNodeRef.current) {
                            p1.x += offsetX;
                            p1.y += offsetY;
                        }
                        if (p2 !== draggedNodeRef.current) {
                            p2.x -= offsetX;
                            p2.y -= offsetY;
                        }
                    }
                }

                // 5. Colisão com limites da tela (Paredes, Teto e Chão)
                const margin = 10;
                const floorY = h - margin;
                const wallFriction = 0.94;
                const bounce = 0.45;

                for (let i = 0; i < allLen; i++) {
                    const pt = allPoints[i];
                    if (pt === draggedNodeRef.current) continue;

                    // Chão
                    if (pt.y > floorY) {
                        const vy = pt.y - pt.oy;
                        pt.y = floorY;
                        pt.oy = floorY + vy * bounce;
                        pt.ox = pt.x - (pt.x - pt.ox) * wallFriction;
                    }
                    // Teto
                    if (pt.y < margin) {
                        const vy = pt.y - pt.oy;
                        pt.y = margin;
                        pt.oy = margin + vy * bounce;
                    }
                    // Parede Esquerda
                    if (pt.x < margin) {
                        const vx = pt.x - pt.ox;
                        pt.x = margin;
                        pt.ox = margin + vx * bounce;
                    }
                    // Parede Direita
                    if (pt.x > w - margin) {
                        const vx = pt.x - pt.ox;
                        pt.x = w - margin;
                        pt.ox = (w - margin) + vx * bounce;
                    }

                    // Colisão com Obstáculos circulares
                    if (showObstacles) {
                        for (let o = 0; o < obstacles.length; o++) {
                            const obs = obstacles[o];
                            const odx = pt.x - obs.x;
                            const ody = pt.y - obs.y;
                            const odist = Math.sqrt(odx * odx + ody * ody);
                            if (odist < obs.radius) {
                                const push = obs.radius - odist;
                                const nx = odx / odist;
                                const ny = ody / odist;
                                pt.x += nx * push;
                                pt.y += ny * push;
                                pt.ox = pt.x - (pt.x - pt.ox) * 0.9;
                                pt.oy = pt.y - (pt.y - pt.oy) * 0.9;
                            }
                        }
                    }
                }
            }

            // Atualização de velocidade do mouse
            mouse.vx = mouse.x - mouse.prevX;
            mouse.vy = mouse.y - mouse.prevY;
            mouse.prevX = mouse.x;
            mouse.prevY = mouse.y;

            // RENDERIZAÇÃO
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);

            // Sombra no chão projetada pela gelatina
            let minY = Infinity;
            let maxY = -Infinity;
            let minX = Infinity;
            let maxX = -Infinity;
            for (let i = 0; i < pLen; i++) {
                if (perimeter[i].y > maxY) maxY = perimeter[i].y;
                if (perimeter[i].y < minY) minY = perimeter[i].y;
                if (perimeter[i].x < minX) minX = perimeter[i].x;
                if (perimeter[i].x > maxX) maxX = perimeter[i].x;
            }

            const groundDist = Math.max(0, h - 10 - maxY);
            const shadowAlpha = Math.max(0.05, 0.45 - groundDist * 0.0015);
            const shadowWidth = Math.max(40, (maxX - minX) * 0.9 + groundDist * 0.1);
            const shadowHeight = Math.max(10, 22 - groundDist * 0.05);

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(center.x, h - 8, shadowWidth * 0.5, shadowHeight * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
            ctx.filter = 'blur(10px)';
            ctx.fill();
            ctx.restore();

            // Desenhar Obstáculos circulares se ativos
            if (showObstacles) {
                for (let o = 0; o < obstacles.length; o++) {
                    const obs = obstacles[o];
                    const grad = ctx.createRadialGradient(
                        obs.x - obs.radius * 0.3,
                        obs.y - obs.radius * 0.3,
                        obs.radius * 0.1,
                        obs.x,
                        obs.y,
                        obs.radius
                    );
                    grad.addColorStop(0, 'rgba(51, 65, 85, 0.8)');
                    grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');

                    ctx.beginPath();
                    ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.stroke();
                }
            }

            // Construir o contorno suave da Gelatina com curvas Bezier
            ctx.save();
            ctx.beginPath();
            const firstMidX = (perimeter[0].x + perimeter[1].x) * 0.5;
            const firstMidY = (perimeter[0].y + perimeter[1].y) * 0.5;
            ctx.moveTo(firstMidX, firstMidY);

            for (let i = 1; i <= pLen; i++) {
                const cur = perimeter[i % pLen];
                const next = perimeter[(i + 1) % pLen];
                const midX = (cur.x + next.x) * 0.5;
                const midY = (cur.y + next.y) * 0.5;
                ctx.quadraticCurveTo(cur.x, cur.y, midX, midY);
            }
            ctx.closePath();

            // Preenchimento com gradiente translúcido de gelatina esmeralda
            const jellyGrad = ctx.createRadialGradient(
                center.x - 20,
                center.y - 25,
                10,
                center.x,
                center.y,
                (maxX - minX) * 0.65
            );
            jellyGrad.addColorStop(0, 'rgba(52, 211, 153, 0.75)'); // emerald-400
            jellyGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.55)'); // emerald-500
            jellyGrad.addColorStop(0.85, 'rgba(5, 150, 105, 0.65)'); // emerald-600
            jellyGrad.addColorStop(1, 'rgba(6, 78, 59, 0.85)'); // emerald-900

            ctx.fillStyle = jellyGrad;
            ctx.fill();

            // Borda externa bioluminescente
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'rgba(167, 243, 208, 0.8)'; // emerald-200
            ctx.stroke();

            // Núcleo interno de refração (sensação de profundidade líquida)
            ctx.beginPath();
            const coreMidX = (innerRing[0].x + innerRing[1].x) * 0.5;
            const coreMidY = (innerRing[0].y + innerRing[1].y) * 0.5;
            ctx.moveTo(coreMidX, coreMidY);
            for (let i = 1; i <= pLen; i++) {
                const cur = innerRing[i % pLen];
                const next = innerRing[(i + 1) % pLen];
                const midX = (cur.x + next.x) * 0.5;
                const midY = (cur.y + next.y) * 0.5;
                ctx.quadraticCurveTo(cur.x, cur.y, midX, midY);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(110, 231, 183, 0.22)';
            ctx.fill();

            // Brilho especular (highlight curvado)
            ctx.beginPath();
            ctx.ellipse(center.x - 22, center.y - 32, 28, 14, -Math.PI / 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(center.x + 22, center.y - 36, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();

            ctx.restore();

            // Renderizar malha interna se o toggle estiver ativo
            if (showSkeleton) {
                ctx.save();
                ctx.strokeStyle = 'rgba(167, 243, 208, 0.35)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let i = 0; i < sLen; i++) {
                    const s = springs[i];
                    ctx.moveTo(s.p1.x, s.p1.y);
                    ctx.lineTo(s.p2.x, s.p2.y);
                }
                ctx.stroke();

                ctx.fillStyle = '#6ee7b7';
                for (let i = 0; i < allLen; i++) {
                    ctx.beginPath();
                    ctx.arc(allPoints[i].x, allPoints[i].y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            // Indicador visual do cursor quando pressionado
            if (mouse.isDown || mouse.isRightDown) {
                ctx.save();
                ctx.beginPath();
                const r = mouse.isRightDown ? 120 : 80;
                ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
                ctx.strokeStyle = mouse.isRightDown ? 'rgba(244, 63, 94, 0.3)' : 'rgba(52, 211, 153, 0.3)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.restore();
            }

            requestRef.current = requestAnimationFrame(render);
        };

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            if (isTouch && (!e.touches || e.touches.length === 0)) return;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            const rect = canvas.getBoundingClientRect();
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
                mouseRef.current.isDown = true;

                // Testar se clicou perto de algum nó para arrastar diretamente
                const allPoints = [centerPointRef.current, ...perimeterPointsRef.current, ...innerRingPointsRef.current];
                let closestPt: Point | null = null;
                let minDistSq = 60 * 60;

                for (let i = 0; i < allPoints.length; i++) {
                    const pt = allPoints[i];
                    const dx = pt.x - posX;
                    const dy = pt.y - posY;
                    const dSq = dx * dx + dy * dy;
                    if (dSq < minDistSq) {
                        minDistSq = dSq;
                        closestPt = pt;
                    }
                }

                if (closestPt) {
                    draggedNodeRef.current = closestPt;
                    dragOffsetRef.current = { x: closestPt.x - posX, y: closestPt.y - posY };
                }
            }
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            if (isTouch && (!e.touches || e.touches.length === 0)) return;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = clientX - rect.left;
            mouseRef.current.y = clientY - rect.top;
        };

        const handlePointerUp = (e: MouseEvent | TouchEvent) => {
            const isRight = 'button' in e && e.button === 2;
            if (isRight) {
                mouseRef.current.isRightDown = false;
            } else {
                mouseRef.current.isDown = false;
                if (draggedNodeRef.current) {
                    // Lançar com a inércia do movimento do ponteiro
                    const pt = draggedNodeRef.current;
                    pt.ox = pt.x - mouseRef.current.vx * 1.2;
                    pt.oy = pt.y - mouseRef.current.vy * 1.2;
                    draggedNodeRef.current = null;
                }
            }
        };

        const handleMouseLeave = () => {
            mouseRef.current.isDown = false;
            mouseRef.current.isRightDown = false;
            draggedNodeRef.current = null;
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
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('contextmenu', handleContextMenu);

        canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('contextmenu', handleContextMenu);

            canvas.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef, buildJelly]);

    return { reset, launchJelly };
};
