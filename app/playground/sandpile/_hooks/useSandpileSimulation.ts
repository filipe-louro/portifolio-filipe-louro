"use client";

import { useEffect, useRef, useCallback } from 'react';
import { SandpileConfig } from '../_utils/types';

const GRID_W = 240;
const GRID_H = 160;

const ABELIAN_W = 180;
const ABELIAN_H = 180;

export const useSandpileSimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: SandpileConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    // Estado da física granular
    const granularGridRef = useRef<Uint8Array>(new Uint8Array(GRID_W * GRID_H));
    const kineticEnergyRef = useRef<Float32Array>(new Float32Array(GRID_W * GRID_H));

    // Estado do modelo Abelian Sandpile
    const abelianGridRef = useRef<Int32Array>(new Int32Array(ABELIAN_W * ABELIAN_H));
    const abelianToppledRef = useRef<Uint8Array>(new Uint8Array(ABELIAN_W * ABELIAN_H));

    // Canvas de renderização offscreen em baixa resolução
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageDataRef = useRef<ImageData | null>(null);

    const mouseRef = useRef<{
        x: number;
        y: number;
        isDown: boolean;
        isRightDown: boolean;
    }>({ x: -1000, y: -1000, isDown: false, isRightDown: false });

    // Inicialização de obstáculos pré-configurados (rampas de ampulheta)
    const initObstacles = useCallback(() => {
        const grid = granularGridRef.current;
        grid.fill(0);
        kineticEnergyRef.current.fill(0);

        // Paredes laterais e chão
        for (let x = 0; x < GRID_W; x++) {
            grid[(GRID_H - 1) * GRID_W + x] = 4; // Chão
        }
        for (let y = 0; y < GRID_H; y++) {
            grid[y * GRID_W] = 4; // Esquerda
            grid[y * GRID_W + (GRID_W - 1)] = 4; // Direita
        }

        // Rampas de ampulheta se no preset de ampulheta
        if (configRef.current.preset === 'hourglass') {
            const midX = Math.floor(GRID_W / 2);
            const midY = Math.floor(GRID_H * 0.45);
            const rampLen = 45;

            // Rampa esquerda inclinada
            for (let i = 0; i < rampLen; i++) {
                const rx = midX - 12 - i;
                const ry = midY - Math.floor(i * 0.6);
                if (rx >= 0 && ry >= 0 && ry < GRID_H) {
                    grid[ry * GRID_W + rx] = 4;
                    grid[(ry + 1) * GRID_W + rx] = 4;
                }
            }

            // Rampa direita inclinada
            for (let i = 0; i < rampLen; i++) {
                const rx = midX + 12 + i;
                const ry = midY - Math.floor(i * 0.6);
                if (rx < GRID_W && ry >= 0 && ry < GRID_H) {
                    grid[ry * GRID_W + rx] = 4;
                    grid[(ry + 1) * GRID_W + rx] = 4;
                }
            }
        }
    }, []);

    const reset = useCallback(() => {
        if (configRef.current.mode === 'abelian') {
            abelianGridRef.current.fill(0);
            abelianToppledRef.current.fill(0);
            // Injetar uma pilha central inicial
            const centerIdx = Math.floor(ABELIAN_H / 2) * ABELIAN_W + Math.floor(ABELIAN_W / 2);
            abelianGridRef.current[centerIdx] = 2048;
        } else {
            initObstacles();
        }
    }, [initObstacles]);

    useEffect(() => {
        const prevMode = configRef.current.mode;
        const prevPreset = configRef.current.preset;
        configRef.current = config;

        if (config.mode !== prevMode || config.preset !== prevPreset) {
            reset();
        }
    }, [config, reset]);

    // Abalo sísmico / terremoto provocando avalanches massivas
    const triggerEarthquake = useCallback(() => {
        if (configRef.current.mode === 'abelian') {
            const grid = abelianGridRef.current;
            for (let i = 0; i < ABELIAN_W * ABELIAN_H; i++) {
                if (grid[i] > 1 && Math.random() < 0.25) {
                    grid[i] += 4;
                }
            }
        } else {
            const grid = granularGridRef.current;
            const energy = kineticEnergyRef.current;
            for (let y = 10; y < GRID_H - 2; y++) {
                for (let x = 1; x < GRID_W - 1; x++) {
                    const idx = y * GRID_W + x;
                    if (grid[idx] >= 1 && grid[idx] <= 3) {
                        energy[idx] = 1.0;
                        // Deslocar aleatoriamentegrãos na encosta
                        if (Math.random() < 0.35) {
                            const dir = Math.random() < 0.5 ? -1 : 1;
                            const target = (y + 1) * GRID_W + (x + dir);
                            if (grid[target] === 0) {
                                grid[target] = grid[idx];
                                grid[idx] = 0;
                            }
                        }
                    }
                }
            }
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let offscreen = offscreenCanvasRef.current;
        if (!offscreen) {
            offscreen = document.createElement('canvas');
            offscreenCanvasRef.current = offscreen;
        }

        let w = 0, h = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = container.clientWidth;
            h = container.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
            ctx.imageSmoothingEnabled = false;
        };

        reset();

        const render = () => {
            const { mode, flowRate, funnelSize, kineticGlow, preset } = configRef.current;
            const mouse = mouseRef.current;

            if (mode === 'abelian') {
                // SIMULAÇÃO DO MODELO ABELIAN SANDPILE
                if (!offscreen || offscreen.width !== ABELIAN_W || offscreen.height !== ABELIAN_H) {
                    offscreen.width = ABELIAN_W;
                    offscreen.height = ABELIAN_H;
                    imageDataRef.current = offscreen.getContext('2d')!.createImageData(ABELIAN_W, ABELIAN_H);
                }

                const grid = abelianGridRef.current;
                const toppled = abelianToppledRef.current;
                toppled.fill(0);

                // Despejo contínuo no mouse ou no centro (proporção quadrada preservada)
                const size = Math.min(w, h) * 0.94;
                const ox = (w - size) * 0.5;
                const oy = (h - size) * 0.5;

                if (mouse.isDown) {
                    const gx = Math.floor(((mouse.x - ox) / size) * ABELIAN_W);
                    const gy = Math.floor(((mouse.y - oy) / size) * ABELIAN_H);
                    if (gx >= 0 && gx < ABELIAN_W && gy >= 0 && gy < ABELIAN_H) {
                        grid[gy * ABELIAN_W + gx] += flowRate * 4;
                    }
                } else {
                    // Despejo automático suave no centro
                    const centerIdx = Math.floor(ABELIAN_H / 2) * ABELIAN_W + Math.floor(ABELIAN_W / 2);
                    grid[centerIdx] += flowRate;
                }

                // Ciclos de desabamento / toppling iterativo equilibrados para 60 FPS fluídos
                const maxSteps = 50;

                for (let step = 0; step < maxSteps; step++) {
                    let hadTopple = false;
                    for (let y = 1; y < ABELIAN_H - 1; y++) {
                        for (let x = 1; x < ABELIAN_W - 1; x++) {
                            const idx = y * ABELIAN_W + x;
                            if (grid[idx] >= 4) {
                                const count = Math.floor(grid[idx] / 4);
                                grid[idx] -= count * 4;
                                grid[idx - 1] += count;
                                grid[idx + 1] += count;
                                grid[idx - ABELIAN_W] += count;
                                grid[idx + ABELIAN_W] += count;
                                toppled[idx] = 1;
                                hadTopple = true;
                            }
                        }
                    }
                    if (!hadTopple) break;
                }

                // Renderizar buffer Abelian
                const img = imageDataRef.current!;
                const pixels = img.data;

                for (let i = 0; i < ABELIAN_W * ABELIAN_H; i++) {
                    const val = grid[i];
                    const isToppling = toppled[i] === 1;
                    const pIdx = i * 4;

                    if (isToppling && kineticGlow) {
                        // Flash incandescente de colapso crítico
                        pixels[pIdx] = 255;
                        pixels[pIdx + 1] = 255;
                        pixels[pIdx + 2] = 255;
                        pixels[pIdx + 3] = 255;
                    } else if (val === 0) {
                        pixels[pIdx] = 2;
                        pixels[pIdx + 1] = 6;
                        pixels[pIdx + 2] = 23;
                        pixels[pIdx + 3] = 255;
                    } else if (val === 1) {
                        pixels[pIdx] = 120;
                        pixels[pIdx + 1] = 53;
                        pixels[pIdx + 2] = 15;
                        pixels[pIdx + 3] = 255;
                    } else if (val === 2) {
                        pixels[pIdx] = 217;
                        pixels[pIdx + 1] = 119;
                        pixels[pIdx + 2] = 6;
                        pixels[pIdx + 3] = 255;
                    } else {
                        pixels[pIdx] = 251;
                        pixels[pIdx + 1] = 191;
                        pixels[pIdx + 2] = 36;
                        pixels[pIdx + 3] = 255;
                    }
                }

                offscreen.getContext('2d')!.putImageData(img, 0, 0);

                ctx.fillStyle = '#020617';
                ctx.fillRect(0, 0, w, h);
                ctx.save();
                ctx.drawImage(offscreen, ox, oy, size, size);
                ctx.restore();
            } else {
                // SIMULAÇÃO GRANULAR COM ÂNGULO DE REPOUSO E AVALANCHES
                if (!offscreen || offscreen.width !== GRID_W || offscreen.height !== GRID_H) {
                    offscreen.width = GRID_W;
                    offscreen.height = GRID_H;
                    imageDataRef.current = offscreen.getContext('2d')!.createImageData(GRID_W, GRID_H);
                }

                const grid = granularGridRef.current;
                const energy = kineticEnergyRef.current;

                // 1. Inserção pelo cursor do usuário
                if (mouse.isDown || mouse.isRightDown) {
                    const rect = container.getBoundingClientRect();
                    const gx = Math.floor((mouse.x / rect.width) * GRID_W);
                    const gy = Math.floor((mouse.y / rect.height) * GRID_H);

                    const type = mouse.isRightDown ? 4 : Math.random() < 0.5 ? 1 : 2;
                    const rad = mouse.isRightDown ? funnelSize + 1 : funnelSize;

                    for (let dy = -rad; dy <= rad; dy++) {
                        for (let dx = -rad; dx <= rad; dx++) {
                            const px = gx + dx;
                            const py = gy + dy;
                            if (px >= 1 && px < GRID_W - 1 && py >= 1 && py < GRID_H - 1) {
                                if (dx * dx + dy * dy <= rad * rad) {
                                    if (mouse.isRightDown) {
                                        grid[py * GRID_W + px] = 4;
                                    } else if (grid[py * GRID_W + px] === 0) {
                                        grid[py * GRID_W + px] = type;
                                        energy[py * GRID_W + px] = 1.0;
                                    }
                                }
                            }
                        }
                    }
                }

                // 2. Física Granular (Autômato celular com gravidade e deslizamento lateral)
                const leftToRight = Math.random() < 0.5;

                for (let y = GRID_H - 2; y >= 1; y--) {
                    const xStart = leftToRight ? 1 : GRID_W - 2;
                    const xEnd = leftToRight ? GRID_W - 1 : 0;
                    const xStep = leftToRight ? 1 : -1;

                    for (let x = xStart; x !== xEnd; x += xStep) {
                        const idx = y * GRID_W + x;
                        const cell = grid[idx];
                        if (cell === 0 || cell === 4) continue; // Vazio ou parede

                        // Decaimento suave da energia cinética
                        energy[idx] = Math.max(0, energy[idx] * 0.94);

                        const downIdx = (y + 1) * GRID_W + x;
                        const downLeft = (y + 1) * GRID_W + (x - 1);
                        const downRight = (y + 1) * GRID_W + (x + 1);

                        // Queda vertical livre
                        if (grid[downIdx] === 0) {
                            grid[downIdx] = cell;
                            grid[idx] = 0;
                            energy[downIdx] = 1.0;
                            continue;
                        }

                        // Deslizamento diagonal na encosta (não vazar por cantos de barreiras sólidas)
                        const canLeft = x > 1 && grid[downLeft] === 0 && grid[y * GRID_W + (x - 1)] !== 4;
                        const canRight = x < GRID_W - 2 && grid[downRight] === 0 && grid[y * GRID_W + (x + 1)] !== 4;

                        if (canLeft && canRight) {
                            const target = Math.random() < 0.5 ? downLeft : downRight;
                            grid[target] = cell;
                            grid[idx] = 0;
                            energy[target] = 0.85;
                        } else if (canLeft) {
                            grid[downLeft] = cell;
                            grid[idx] = 0;
                            energy[downLeft] = 0.85;
                        } else if (canRight) {
                            grid[downRight] = cell;
                            grid[idx] = 0;
                            energy[downRight] = 0.85;
                        }
                    }
                }

                // 3. Renderização no buffer ImageData
                const img = imageDataRef.current!;
                const pixels = img.data;

                for (let i = 0; i < GRID_W * GRID_H; i++) {
                    const cell = grid[i];
                    const pIdx = i * 4;
                    const en = energy[i];

                    if (cell === 0) {
                        // Fundo escuro
                        pixels[pIdx] = 2;
                        pixels[pIdx + 1] = 6;
                        pixels[pIdx + 2] = 23;
                        pixels[pIdx + 3] = 255;
                    } else if (cell === 4) {
                        // Barreiras / Rampas
                        pixels[pIdx] = 71;
                        pixels[pIdx + 1] = 85;
                        pixels[pIdx + 2] = 105;
                        pixels[pIdx + 3] = 255;
                    } else {
                        // Grãos de Areia com brilho de avalanche cinética
                        if (preset === 'magma') {
                            if (kineticGlow && en > 0.3) {
                                // Piroclasto em avalanche (branco/dourado incandescente)
                                pixels[pIdx] = 255;
                                pixels[pIdx + 1] = 230;
                                pixels[pIdx + 2] = 180;
                            } else {
                                pixels[pIdx] = cell === 1 ? 239 : 185;
                                pixels[pIdx + 1] = cell === 1 ? 68 : 28;
                                pixels[pIdx + 2] = cell === 1 ? 68 : 28;
                            }
                        } else if (preset === 'jade') {
                            if (kineticGlow && en > 0.3) {
                                pixels[pIdx] = 200;
                                pixels[pIdx + 1] = 255;
                                pixels[pIdx + 2] = 230;
                            } else {
                                pixels[pIdx] = cell === 1 ? 16 : 5;
                                pixels[pIdx + 1] = cell === 1 ? 185 : 150;
                                pixels[pIdx + 2] = cell === 1 ? 129 : 105;
                            }
                        } else {
                            // Dunas Douradas padrão
                            if (kineticGlow && en > 0.25) {
                                pixels[pIdx] = 255;
                                pixels[pIdx + 1] = 250;
                                pixels[pIdx + 2] = 210;
                            } else {
                                pixels[pIdx] = cell === 1 ? 251 : 217;
                                pixels[pIdx + 1] = cell === 1 ? 191 : 119;
                                pixels[pIdx + 2] = cell === 1 ? 36 : 6;
                            }
                        }
                        pixels[pIdx + 3] = 255;
                    }
                }

                offscreen.getContext('2d')!.putImageData(img, 0, 0);

                ctx.fillStyle = '#020617';
                ctx.fillRect(0, 0, w, h);
                ctx.save();
                ctx.drawImage(offscreen, 0, 0, w, h);
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

            mouseRef.current.x = posX;
            mouseRef.current.y = posY;

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

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'KeyS' || e.code === 'Space') {
                e.preventDefault();
                triggerEarthquake();
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        resize();
        render();

        window.addEventListener('resize', resize);
        window.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        canvas.addEventListener('contextmenu', handleContextMenu);

        canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('keydown', handleKeyDown);
            canvas.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            canvas.removeEventListener('contextmenu', handleContextMenu);

            canvas.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef, reset, triggerEarthquake]);

    return { reset, triggerEarthquake };
};
