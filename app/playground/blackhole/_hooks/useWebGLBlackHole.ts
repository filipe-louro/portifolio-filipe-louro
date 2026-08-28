"use client";

import { useState, useEffect, RefObject } from 'react';
import { vertexShaderSource, fragmentShaderSource } from '../_utils/shaders';

const MAX_MARCH_STEPS = 260;
const MIN_MARCH_STEPS = 110;
const MIN_RENDER_SCALE = 0.35;
const MAX_RENDER_SCALE = 1.0;
const SLOW_FRAME_MS = 20;
const FAST_FRAME_MS = 13.5;
const ADJUST_INTERVAL_MS = 600;

export const useWebGLBlackHole = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: "high-performance"
        });

        if (!gl) {
            setError("WebGL 2.0 não suportado pelo seu navegador.");
            return;
        }

        const createShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Erro no Shader:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            setError("Falha ao compilar shaders.");
            return;
        }

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Erro no Link do Programa:', gl.getProgramInfoLog(program));
            setError("Erro ao linkar programa WebGL.");
            return;
        }

        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const timeLocation = gl.getUniformLocation(program, "u_time");
        const stepsLocation = gl.getUniformLocation(program, "u_steps");

        // Resolução adaptativa: o shader roda numa resolução interna menor que
        // o CSS estica; a escala sobe/desce conforme o tempo médio de frame,
        // então a cena se acomoda sozinha do notebook fraco ao desktop com GPU.
        let renderScale = window.innerWidth < 768 ? 0.55 : 0.8;
        let marchSteps = window.innerWidth < 768 ? 160 : 220;
        let needsResize = true;

        const resize = () => {
            const dprCap = window.innerWidth < 768 ? 1.0 : 1.5;
            const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
            const width = Math.max(1, Math.round(canvas.clientWidth * dpr * renderScale));
            const height = Math.max(1, Math.round(canvas.clientHeight * dpr * renderScale));
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, width, height);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            needsResize = true;
        });
        resizeObserver.observe(canvas);

        let animationFrameId = 0;
        const startTime = performance.now();
        let lastFrameTime = startTime;
        let frameTimeAccum = 0;
        let frameCount = 0;
        let lastAdjustTime = startTime;

        const adjustQuality = (avgFrameMs: number) => {
            if (avgFrameMs > SLOW_FRAME_MS) {
                if (renderScale > MIN_RENDER_SCALE) {
                    renderScale = Math.max(MIN_RENDER_SCALE, renderScale * 0.85);
                    needsResize = true;
                } else if (marchSteps > MIN_MARCH_STEPS) {
                    marchSteps = Math.max(MIN_MARCH_STEPS, marchSteps - 30);
                }
            } else if (avgFrameMs < FAST_FRAME_MS) {
                if (marchSteps < MAX_MARCH_STEPS) {
                    marchSteps = Math.min(MAX_MARCH_STEPS, marchSteps + 20);
                } else if (renderScale < MAX_RENDER_SCALE) {
                    renderScale = Math.min(MAX_RENDER_SCALE, renderScale * 1.07);
                    needsResize = true;
                }
            }
        };

        const render = (time: number) => {
            animationFrameId = requestAnimationFrame(render);

            const frameMs = time - lastFrameTime;
            lastFrameTime = time;
            // frames longos demais são troca de aba/janela, não medição válida
            if (frameMs > 0 && frameMs < 100) {
                frameTimeAccum += frameMs;
                frameCount++;
            }
            if (time - lastAdjustTime > ADJUST_INTERVAL_MS && frameCount >= 10) {
                adjustQuality(frameTimeAccum / frameCount);
                frameTimeAccum = 0;
                frameCount = 0;
                lastAdjustTime = time;
            }

            if (needsResize) {
                resize();
                needsResize = false;
            }

            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform1f(timeLocation, (time - startTime) * 0.001);
            gl.uniform1f(stepsLocation, marchSteps);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(positionBuffer);
            gl.deleteVertexArray(vao);
        };
    }, [canvasRef]);

    return { error };
};
