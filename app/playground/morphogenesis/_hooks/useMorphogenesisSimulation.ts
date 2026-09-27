"use client";

import { useEffect, useRef, useCallback } from 'react';
import { MorphogenesisConfig, ColorPalette } from '../_utils/types';
import { vertexShaderSource, simulationShaderSource, renderShaderSource } from '../_utils/shaders';

interface FBO {
    texture: WebGLTexture;
    fbo: WebGLFramebuffer;
}

interface DoubleFBO {
    read: FBO;
    write: FBO;
    swap: () => void;
}

export const useMorphogenesisSimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: MorphogenesisConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);
    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const doubleFboRef = useRef<DoubleFBO | null>(null);
    const simSizeRef = useRef<{ w: number; h: number }>({ w: 512, h: 512 });

    const mouseRef = useRef<{
        x: number;
        y: number;
        isDown: boolean;
        isRightDown: boolean;
    }>({ x: -1000, y: -1000, isDown: false, isRightDown: false });

    const seedField = useCallback((randomize = false) => {
        const gl = glRef.current;
        const doubleFbo = doubleFboRef.current;
        if (!gl || !doubleFbo) return;

        const { w, h } = simSizeRef.current;
        const data = new Float32Array(w * h * 4);

        // Preenche com U = 1.0 e V = 0.0
        for (let i = 0; i < w * h; i++) {
            data[i * 4] = 1.0;
            data[i * 4 + 1] = 0.0;
            data[i * 4 + 2] = 0.0;
            data[i * 4 + 3] = 1.0;
        }

        const seedSpot = (cx: number, cy: number, radius: number) => {
            for (let y = Math.max(0, cy - radius); y < Math.min(h, cy + radius); y++) {
                for (let x = Math.max(0, cx - radius); x < Math.min(w, cx + radius); x++) {
                    const dx = x - cx;
                    const dy = y - cy;
                    if (dx * dx + dy * dy < radius * radius) {
                        const idx = (y * w + x) * 4;
                        data[idx] = 0.5 + Math.random() * 0.08; // U cai
                        data[idx + 1] = 0.7 + Math.random() * 0.2; // V sobe
                    }
                }
            }
        };

        if (randomize) {
            // Sementes aleatórias espalhadas
            const count = 12 + Math.floor(Math.random() * 8);
            for (let i = 0; i < count; i++) {
                seedSpot(
                    Math.floor(w * (0.15 + Math.random() * 0.7)),
                    Math.floor(h * (0.15 + Math.random() * 0.7)),
                    Math.floor(8 + Math.random() * 14)
                );
            }
        } else {
            // Semente central clássica e satélites
            seedSpot(Math.floor(w / 2), Math.floor(h / 2), 16);
            seedSpot(Math.floor(w * 0.35), Math.floor(h * 0.35), 10);
            seedSpot(Math.floor(w * 0.65), Math.floor(h * 0.65), 10);
        }

        const hasFloat = Boolean(
            gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')
        );

        // Upload para ambas as texturas do ping-pong
        [doubleFbo.read, doubleFbo.write].forEach((fbo) => {
            gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
            if (hasFloat) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.FLOAT, data);
            } else {
                const u8 = new Uint8Array(w * h * 4);
                for (let i = 0; i < w * h * 4; i++) u8[i] = Math.floor(data[i] * 255);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, u8);
            }
        });
    }, []);

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const reset = useCallback(() => {
        seedField(false);
    }, [seedField]);

    const randomize = useCallback(() => {
        seedField(true);
    }, [seedField]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const gl = canvas.getContext('webgl2', {
            alpha: false,
            depth: false,
            antialias: false,
            powerPreference: 'high-performance',
        });
        if (!gl) return;
        glRef.current = gl;

        // Compilar shader helper
        const createShader = (type: number, src: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            return shader;
        };

        const vertShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const simFragShader = createShader(gl.FRAGMENT_SHADER, simulationShaderSource);
        const renderFragShader = createShader(gl.FRAGMENT_SHADER, renderShaderSource);

        if (!vertShader || !simFragShader || !renderFragShader) return;

        const simProgram = gl.createProgram();
        if (!simProgram) return;
        gl.attachShader(simProgram, vertShader);
        gl.attachShader(simProgram, simFragShader);
        gl.linkProgram(simProgram);

        const renderProgram = gl.createProgram();
        if (!renderProgram) return;
        gl.attachShader(renderProgram, vertShader);
        gl.attachShader(renderProgram, renderFragShader);
        gl.linkProgram(renderProgram);

        // Uniforms de Simulação
        const simUniforms = {
            u_texture: gl.getUniformLocation(simProgram, 'u_texture'),
            u_resolution: gl.getUniformLocation(simProgram, 'u_resolution'),
            u_feed: gl.getUniformLocation(simProgram, 'u_feed'),
            u_kill: gl.getUniformLocation(simProgram, 'u_kill'),
            u_diffU: gl.getUniformLocation(simProgram, 'u_diffU'),
            u_diffV: gl.getUniformLocation(simProgram, 'u_diffV'),
            u_mouse: gl.getUniformLocation(simProgram, 'u_mouse'),
        };

        // Uniforms de Renderização
        const renderUniforms = {
            u_texture: gl.getUniformLocation(renderProgram, 'u_texture'),
            u_resolution: gl.getUniformLocation(renderProgram, 'u_resolution'),
            u_palette: gl.getUniformLocation(renderProgram, 'u_palette'),
            u_bumpLight: gl.getUniformLocation(renderProgram, 'u_bumpLight'),
        };

        // Fullscreen Quad Buffer
        const quadVao = gl.createVertexArray();
        const quadVbo = gl.createBuffer();
        gl.bindVertexArray(quadVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                 1, -1,
                -1,  1,
                -1,  1,
                 1, -1,
                 1,  1,
            ]),
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        // Suporte a texturas de ponto flutuante para precisão numérica do Gray-Scott
        const hasFloat = Boolean(
            gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')
        );
        gl.getExtension('OES_texture_float_linear');

        const internalFormat = hasFloat ? gl.RGBA16F : gl.RGBA8;
        const texType = hasFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

        // Criar FBOs Ping-Pong
        const createFBO = (width: number, height: number): FBO => {
            const texture = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, gl.RGBA, texType, null);

            const fbo = gl.createFramebuffer()!;
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

            return { texture, fbo };
        };

        const isMobile = window.innerWidth < 768;
        const maxDim = isMobile ? 384 : 512;
        const aspect = container.clientWidth / (container.clientHeight || 1);
        let simW = maxDim;
        let simH = maxDim;
        if (aspect >= 1) {
            simW = maxDim;
            simH = Math.max(128, Math.round(maxDim / aspect));
        } else {
            simH = maxDim;
            simW = Math.max(128, Math.round(maxDim * aspect));
        }
        simSizeRef.current = { w: simW, h: simH };

        let fboA = createFBO(simW, simH);
        let fboB = createFBO(simW, simH);

        const doubleFbo: DoubleFBO = {
            get read() { return fboA; },
            get write() { return fboB; },
            swap() {
                const temp = fboA;
                fboA = fboB;
                fboB = temp;
            },
        };
        doubleFboRef.current = doubleFbo;

        seedField(false);

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const w = container.clientWidth;
            const h = container.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
        };

        const paletteIndices: Record<ColorPalette, number> = {
            electric: 0,
            biolum: 1,
            thermal: 2,
            obsidian: 3,
        };

        const render = () => {
            const { feed, kill, diffU, diffV, speed, brushRadius, palette, bumpLight } = configRef.current;
            const mouse = mouseRef.current;

            // Determinar coordenadas UV do mouse
            let mouseU = -1;
            let mouseV = -1;
            let mouseRad = 0;
            let mouseAction = 0;

            if (mouse.isDown || mouse.isRightDown) {
                const rect = canvas.getBoundingClientRect();
                mouseU = mouse.x / rect.width;
                mouseV = 1.0 - mouse.y / rect.height; // Inversão WebGL Y
                mouseRad = brushRadius / rect.height;
                mouseAction = mouse.isRightDown ? -1.0 : 1.0;
            }

            // 1. Passos de Simulação FBO Ping-Pong
            gl.useProgram(simProgram);
            gl.bindVertexArray(quadVao);
            gl.viewport(0, 0, simW, simH);

            gl.uniform2f(simUniforms.u_resolution, simW, simH);
            gl.uniform1f(simUniforms.u_feed, feed);
            gl.uniform1f(simUniforms.u_kill, kill);
            gl.uniform1f(simUniforms.u_diffU, diffU);
            gl.uniform1f(simUniforms.u_diffV, diffV);
            gl.uniform1i(simUniforms.u_texture, 0);

            for (let i = 0; i < speed; i++) {
                // Injeta mouse apenas no primeiro passo do frame
                if (i === 0 && (mouse.isDown || mouse.isRightDown)) {
                    gl.uniform4f(simUniforms.u_mouse, mouseU, mouseV, mouseRad, mouseAction);
                } else {
                    gl.uniform4f(simUniforms.u_mouse, -1, -1, 0, 0);
                }

                gl.bindFramebuffer(gl.FRAMEBUFFER, doubleFbo.write.fbo);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, doubleFbo.read.texture);

                gl.drawArrays(gl.TRIANGLES, 0, 6);
                doubleFbo.swap();
            }

            // 2. Renderização final na Tela
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);

            gl.useProgram(renderProgram);
            gl.bindVertexArray(quadVao);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, doubleFbo.read.texture);
            gl.uniform1i(renderUniforms.u_texture, 0);
            gl.uniform2f(renderUniforms.u_resolution, simW, simH);
            gl.uniform1i(renderUniforms.u_palette, paletteIndices[palette]);
            gl.uniform1i(renderUniforms.u_bumpLight, bumpLight ? 1 : 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

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

        const handleMouseLeave = () => {
            mouseRef.current.isDown = false;
            mouseRef.current.isRightDown = false;
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

            // Cleanup WebGL
            gl.deleteProgram(simProgram);
            gl.deleteProgram(renderProgram);
            gl.deleteShader(vertShader);
            gl.deleteShader(simFragShader);
            gl.deleteShader(renderFragShader);
            gl.deleteFramebuffer(fboA.fbo);
            gl.deleteFramebuffer(fboB.fbo);
            gl.deleteTexture(fboA.texture);
            gl.deleteTexture(fboB.texture);
            gl.deleteVertexArray(quadVao);
            gl.deleteBuffer(quadVbo);
        };
    }, [canvasRef, containerRef, seedField]);

    return { reset, randomize };
};
