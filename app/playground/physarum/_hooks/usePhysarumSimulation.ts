"use client";

import { useEffect, useRef, useCallback } from 'react';
import { PhysarumConfig, FoodNode } from '../_utils/types';

export const usePhysarumSimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: PhysarumConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    const simSizeRef = useRef<{ w: number; h: number }>({ w: 320, h: 220 });

    // Buffers de trilha de feromônio
    const trailRef = useRef<Float32Array>(new Float32Array(0));
    const diffuseBufferRef = useRef<Float32Array>(new Float32Array(0));

    // Agentes: x, y, angle (Float32Array compacto)
    const agentsRef = useRef<Float32Array>(new Float32Array(0));

    // Nós de nutrientes (alimento)
    const foodNodesRef = useRef<FoodNode[]>([]);

    // Offscreen rendering
    const offscreenRef = useRef<HTMLCanvasElement | null>(null);
    const imageDataRef = useRef<ImageData | null>(null);

    const mouseRef = useRef<{
        x: number;
        y: number;
        isDown: boolean;
        isRightDown: boolean;
    }>({ x: -1000, y: -1000, isDown: false, isRightDown: false });

    // Inicializar rede de agentes e nutrientes com proporção isotrópica
    const initSimulation = useCallback(() => {
        const container = containerRef.current;
        const cw = container ? container.clientWidth : 1000;
        const ch = container ? container.clientHeight : 700;
        const aspect = (cw || 1) / (ch || 1);

        let simW = Math.round(Math.sqrt(70000 * aspect));
        let simH = Math.round(70000 / simW);
        simW = Math.max(160, Math.min(480, simW));
        simH = Math.max(160, Math.min(480, simH));
        simSizeRef.current = { w: simW, h: simH };

        const count = configRef.current.agentCount;
        const agents = new Float32Array(count * 3);

        const cx = simW * 0.5;
        const cy = simH * 0.5;
        const radius = Math.min(simW, simH) * 0.38;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * radius;
            agents[i * 3] = cx + Math.cos(angle) * dist;
            agents[i * 3 + 1] = cy + Math.sin(angle) * dist;
            // Orientação inicial voltada para fora
            agents[i * 3 + 2] = angle + (Math.random() - 0.5) * 0.5;
        }

        agentsRef.current = agents;
        trailRef.current = new Float32Array(simW * simH);
        diffuseBufferRef.current = new Float32Array(simW * simH);

        if (offscreenRef.current) {
            offscreenRef.current.width = simW;
            offscreenRef.current.height = simH;
            imageDataRef.current = offscreenRef.current.getContext('2d')!.createImageData(simW, simH);
        }

        // Nós de nutrientes padrão (inspirados no experimento ferroviário de Tóquio)
        foodNodesRef.current = [
            { x: simW * 0.5, y: simH * 0.5, radius: 10, strength: 6.0 }, // Centro
            { x: simW * 0.28, y: simH * 0.35, radius: 8, strength: 5.0 }, // Noroeste
            { x: simW * 0.72, y: simH * 0.32, radius: 8, strength: 5.0 }, // Nordeste
            { x: simW * 0.35, y: simH * 0.70, radius: 8, strength: 5.0 }, // Sudoeste
            { x: simW * 0.68, y: simH * 0.68, radius: 8, strength: 5.0 }, // Sudeste
        ];
    }, [containerRef]);

    const reset = useCallback(() => {
        initSimulation();
    }, [initSimulation]);

    const addFoodNode = useCallback((canvasX?: number, canvasY?: number) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const { w: simW, h: simH } = simSizeRef.current;

        const x = canvasX !== undefined ? (canvasX / rect.width) * simW : Math.random() * (simW - 40) + 20;
        const y = canvasY !== undefined ? (canvasY / rect.height) * simH : Math.random() * (simH - 40) + 20;

        foodNodesRef.current.push({
            x,
            y,
            radius: 8 + Math.random() * 4,
            strength: 5.0,
        });

        // Limita a 10 nós para manter elegância estrutural
        if (foodNodesRef.current.length > 10) {
            foodNodesRef.current.shift();
        }
    }, [containerRef]);

    useEffect(() => {
        const prevCount = configRef.current.agentCount;
        configRef.current = config;

        if (config.agentCount !== prevCount) {
            initSimulation();
        }
    }, [config, initSimulation]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let offscreen = offscreenRef.current;
        if (!offscreen) {
            offscreen = document.createElement('canvas');
            offscreen.width = simSizeRef.current.w;
            offscreen.height = simSizeRef.current.h;
            offscreenRef.current = offscreen;
            imageDataRef.current = offscreen.getContext('2d')!.createImageData(simSizeRef.current.w, simSizeRef.current.h);
        }

        let w = 0, h = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = container.clientWidth;
            h = container.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
            ctx.imageSmoothingEnabled = true;

            const aspect = (w || 1) / (h || 1);
            const currentSimAspect = simSizeRef.current.w / simSizeRef.current.h;
            if (Math.abs(aspect - currentSimAspect) > 0.3) {
                initSimulation();
            }
        };

        if (agentsRef.current.length === 0) {
            initSimulation();
        }

        // Tabela pré-computada de cores (LUT) para ultra-performance
        const createPaletteLut = (mode: string) => {
            const lut = new Uint8Array(256 * 3);
            for (let i = 0; i < 256; i++) {
                const t = i / 255;
                if (mode === 'coral') {
                    // Coral ácido / rosa choque para âmbar
                    lut[i * 3] = Math.min(255, Math.floor(t * 320));
                    lut[i * 3 + 1] = Math.min(255, Math.floor(Math.pow(t, 2) * 160));
                    lut[i * 3 + 2] = Math.min(255, Math.floor(Math.pow(t, 1.5) * 180));
                } else if (mode === 'cyan') {
                    // Ciano elétrico neural
                    lut[i * 3] = Math.min(255, Math.floor(Math.pow(t, 2) * 140));
                    lut[i * 3 + 1] = Math.min(255, Math.floor(t * 240));
                    lut[i * 3 + 2] = Math.min(255, Math.floor(t * 255));
                } else {
                    // Lima bioluminescente clássico (Physarum)
                    lut[i * 3] = Math.min(255, Math.floor(t * 210));
                    lut[i * 3 + 1] = Math.min(255, Math.floor(t * 255));
                    lut[i * 3 + 2] = Math.min(255, Math.floor(Math.pow(t, 2.5) * 110));
                }
            }
            return lut;
        };

        let currentPaletteLut = createPaletteLut(configRef.current.colorMode);
        let activeColorMode = configRef.current.colorMode;

        const render = () => {
            const {
                sensorAngle,
                sensorOffset,
                turnSpeed,
                stepSize,
                evaporationRate,
                diffusionRate,
                colorMode,
                showFood,
            } = configRef.current;

            if (colorMode !== activeColorMode) {
                currentPaletteLut = createPaletteLut(colorMode);
                activeColorMode = colorMode;
            }

            const { w: SIM_W, h: SIM_H } = simSizeRef.current;
            const mouse = mouseRef.current;
            const trail = trailRef.current;
            const diffBuf = diffuseBufferRef.current;
            const agents = agentsRef.current;
            const foodNodes = foodNodesRef.current;
            const agentCount = agents.length / 3;

            // 1. Interação do ponteiro (plantar nutrientes ou espalhar repelente)
            if (mouse.isDown || mouse.isRightDown) {
                const rect = canvas.getBoundingClientRect();
                const mx = (mouse.x / rect.width) * SIM_W;
                const my = (mouse.y / rect.height) * SIM_H;

                if (mouse.isRightDown) {
                    // Repelente salino: zera feromônios na área
                    const rad = 22;
                    for (let dy = -rad; dy <= rad; dy++) {
                        for (let dx = -rad; dx <= rad; dx++) {
                            const px = Math.floor(mx + dx);
                            const py = Math.floor(my + dy);
                            if (px >= 0 && px < SIM_W && py >= 0 && py < SIM_H) {
                                if (dx * dx + dy * dy < rad * rad) {
                                    trail[py * SIM_W + px] = 0;
                                }
                            }
                        }
                    }
                } else {
                    // Plantar nutriente sob o cursor
                    const rad = 14;
                    for (let dy = -rad; dy <= rad; dy++) {
                        for (let dx = -rad; dx <= rad; dx++) {
                            const px = Math.floor(mx + dx);
                            const py = Math.floor(my + dy);
                            if (px >= 0 && px < SIM_W && py >= 0 && py < SIM_H) {
                                if (dx * dx + dy * dy < rad * rad) {
                                    trail[py * SIM_W + px] = Math.min(8.0, trail[py * SIM_W + px] + 0.35);
                                }
                            }
                        }
                    }
                }
            }

            // Emissão constante dos nós de alimento
            for (let f = 0; f < foodNodes.length; f++) {
                const fn = foodNodes[f];
                const rad = Math.floor(fn.radius);
                for (let dy = -rad; dy <= rad; dy++) {
                    for (let dx = -rad; dx <= rad; dx++) {
                        const px = Math.floor(fn.x + dx);
                        const py = Math.floor(fn.y + dy);
                        if (px >= 0 && px < SIM_W && py >= 0 && py < SIM_H) {
                            if (dx * dx + dy * dy < rad * rad) {
                                trail[py * SIM_W + px] = fn.strength;
                            }
                        }
                    }
                }
            }

            // 2. Fase Sensorial e Motora dos Agentes
            for (let i = 0; i < agentCount; i++) {
                const idx = i * 3;
                let x = agents[idx];
                let y = agents[idx + 1];
                let angle = agents[idx + 2];

                // Coordenadas dos 3 sensores
                const sfX = Math.floor(x + Math.cos(angle) * sensorOffset);
                const sfY = Math.floor(y + Math.sin(angle) * sensorOffset);

                const slX = Math.floor(x + Math.cos(angle - sensorAngle) * sensorOffset);
                const slY = Math.floor(y + Math.sin(angle - sensorAngle) * sensorOffset);

                const srX = Math.floor(x + Math.cos(angle + sensorAngle) * sensorOffset);
                const srY = Math.floor(y + Math.sin(angle + sensorAngle) * sensorOffset);

                // Leituras de feromônio com wrap toroidal
                const wrapX = (px: number) => ((px % SIM_W) + SIM_W) % SIM_W;
                const wrapY = (py: number) => ((py % SIM_H) + SIM_H) % SIM_H;

                const valF = trail[wrapY(sfY) * SIM_W + wrapX(sfX)];
                const valL = trail[wrapY(slY) * SIM_W + wrapX(slX)];
                const valR = trail[wrapY(srY) * SIM_W + wrapX(srX)];

                // Tomada de decisão quimiotática
                if (valF > valL && valF > valR) {
                    // Mantém direção reta
                } else if (valF < valL && valF < valR) {
                    // Bifurcação aleatória
                    angle += (Math.random() < 0.5 ? -1 : 1) * turnSpeed;
                } else if (valL > valR) {
                    angle -= turnSpeed;
                } else if (valR > valL) {
                    angle += turnSpeed;
                } else {
                    angle += (Math.random() - 0.5) * 0.2;
                }

                // Fase motora: avança no espaço
                x += Math.cos(angle) * stepSize;
                y += Math.sin(angle) * stepSize;

                // Fronteiras reflexivas suaves
                if (x < 1) {
                    x = 1;
                    angle = Math.PI - angle;
                } else if (x >= SIM_W - 1) {
                    x = SIM_W - 2;
                    angle = Math.PI - angle;
                }
                if (y < 1) {
                    y = 1;
                    angle = -angle;
                } else if (y >= SIM_H - 1) {
                    y = SIM_H - 2;
                    angle = -angle;
                }

                agents[idx] = x;
                agents[idx + 1] = y;
                agents[idx + 2] = angle;

                // Depósito químico
                const intX = Math.floor(x);
                const intY = Math.floor(y);
                const tIdx = intY * SIM_W + intX;
                trail[tIdx] = Math.min(6.0, trail[tIdx] + 1.0);
            }

            // 3. Difusão e Evaporação da Trilha Química (Box Blur 3x3 otimizado)
            const decay = 1.0 - evaporationRate;
            const diffWeight = diffusionRate;
            const centerWeight = 1.0 - diffWeight;

            for (let y = 1; y < SIM_H - 1; y++) {
                const row = y * SIM_W;
                for (let x = 1; x < SIM_W - 1; x++) {
                    const idx = row + x;

                    // Média dos 8 vizinhos
                    const neighborSum =
                        trail[idx - 1] +
                        trail[idx + 1] +
                        trail[idx - SIM_W] +
                        trail[idx + SIM_W] +
                        trail[idx - SIM_W - 1] +
                        trail[idx - SIM_W + 1] +
                        trail[idx + SIM_W - 1] +
                        trail[idx + SIM_W + 1];

                    const diffused = (trail[idx] * centerWeight + (neighborSum / 8) * diffWeight) * decay;
                    diffBuf[idx] = diffused;
                }
            }

            // Copia de volta buffer difuso
            trail.set(diffBuf);

            // 4. Renderização no buffer ImageData
            const img = imageDataRef.current!;
            const pixels = img.data;

            for (let i = 0; i < SIM_W * SIM_H; i++) {
                const val = trail[i];
                const pIdx = i * 4;

                if (val < 0.04) {
                    pixels[pIdx] = 2;
                    pixels[pIdx + 1] = 6;
                    pixels[pIdx + 2] = 23;
                    pixels[pIdx + 3] = 255;
                } else {
                    const lutIdx = Math.min(255, Math.floor(val * 70));
                    pixels[pIdx] = currentPaletteLut[lutIdx * 3];
                    pixels[pIdx + 1] = currentPaletteLut[lutIdx * 3 + 1];
                    pixels[pIdx + 2] = currentPaletteLut[lutIdx * 3 + 2];
                    pixels[pIdx + 3] = 255;
                }
            }

            offscreen!.getContext('2d')!.putImageData(img, 0, 0);

            // Desenhar na tela principal escalando suavemente
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);
            ctx.save();
            ctx.drawImage(offscreen!, 0, 0, w, h);

            // Desenhar halos suaves dos nós de nutrientes se ativos
            if (showFood) {
                const scaleX = w / SIM_W;
                const scaleY = h / SIM_H;

                for (let f = 0; f < foodNodes.length; f++) {
                    const fn = foodNodes[f];
                    const cx = fn.x * scaleX;
                    const cy = fn.y * scaleY;
                    const r = fn.radius * scaleX;

                    ctx.beginPath();
                    ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(163, 230, 53, 0.12)';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
                    ctx.fill();
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = 'rgba(163, 230, 53, 0.9)';
                    ctx.stroke();
                }
            }

            ctx.restore();

            requestRef.current = requestAnimationFrame(render);
        };

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            if (isTouch && (!e.touches || e.touches.length === 0)) return;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            const rect = canvas.getBoundingClientRect();

            mouseRef.current.x = clientX - rect.left;
            mouseRef.current.y = clientY - rect.top;

            const isRight = 'button' in e && e.button === 2;
            if (isRight) {
                mouseRef.current.isRightDown = true;
            } else {
                mouseRef.current.isDown = true;
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
            }
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
        canvas.addEventListener('mouseleave', () => {
            mouseRef.current.isDown = false;
            mouseRef.current.isRightDown = false;
        });
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
    }, [canvasRef, containerRef, initSimulation]);

    return { reset, addFoodNode };
};
