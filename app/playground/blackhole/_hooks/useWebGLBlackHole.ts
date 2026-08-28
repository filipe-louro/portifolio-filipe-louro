"use client";

import { useState, useEffect, RefObject } from 'react';
import {
    vertexShaderSource,
    fragmentShaderSource,
    brightPassShaderSource,
    blurShaderSource,
    compositeShaderSource,
} from '../_utils/shaders';

const MAX_MARCH_STEPS = 260;
const MIN_MARCH_STEPS = 110;
const MIN_RENDER_SCALE = 0.35;
const MAX_RENDER_SCALE = 1.0;
const SLOW_FRAME_MS = 20;
const FAST_FRAME_MS = 13.5;
const ADJUST_INTERVAL_MS = 600;
const BLOOM_DOWNSCALE = 4;

interface Target {
    fbo: WebGLFramebuffer;
    texture: WebGLTexture;
    width: number;
    height: number;
}

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
        if (!vertexShader) {
            setError("Falha ao compilar shader de vértice.");
            return;
        }

        const createProgram = (fragmentSource: string) => {
            const fragShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
            if (!fragShader) return null;
            const program = gl.createProgram();
            if (!program) return null;
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragShader);
            gl.linkProgram(program);
            gl.deleteShader(fragShader);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Erro no Link do Programa:', gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                return null;
            }
            return program;
        };

        const sceneProgram = createProgram(fragmentShaderSource);
        const brightProgram = createProgram(brightPassShaderSource);
        const blurProgram = createProgram(blurShaderSource);
        const compositeProgram = createProgram(compositeShaderSource);

        if (!sceneProgram || !brightProgram || !blurProgram || !compositeProgram) {
            setError("Falha ao compilar shaders.");
            return;
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const positionAttributeLocation = gl.getAttribLocation(sceneProgram, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        const sceneUniforms = {
            resolution: gl.getUniformLocation(sceneProgram, "u_resolution"),
            time: gl.getUniformLocation(sceneProgram, "u_time"),
            steps: gl.getUniformLocation(sceneProgram, "u_steps"),
        };
        const brightUniforms = {
            scene: gl.getUniformLocation(brightProgram, "u_scene"),
            texelSize: gl.getUniformLocation(brightProgram, "u_texelSize"),
        };
        const blurUniforms = {
            texture: gl.getUniformLocation(blurProgram, "u_texture"),
            direction: gl.getUniformLocation(blurProgram, "u_direction"),
        };
        const compositeUniforms = {
            scene: gl.getUniformLocation(compositeProgram, "u_scene"),
            bloom: gl.getUniformLocation(compositeProgram, "u_bloom"),
            resolution: gl.getUniformLocation(compositeProgram, "u_resolution"),
            time: gl.getUniformLocation(compositeProgram, "u_time"),
        };

        const createTarget = (width: number, height: number): Target | null => {
            const texture = gl.createTexture();
            const fbo = gl.createFramebuffer();
            if (!texture || !fbo) return null;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return { fbo, texture, width, height };
        };

        const deleteTarget = (target: Target | null) => {
            if (!target) return;
            gl.deleteFramebuffer(target.fbo);
            gl.deleteTexture(target.texture);
        };

        let sceneTarget: Target | null = null;
        let bloomTargetA: Target | null = null;
        let bloomTargetB: Target | null = null;

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
            if (canvas.width === width && canvas.height === height && sceneTarget) return;

            canvas.width = width;
            canvas.height = height;

            deleteTarget(sceneTarget);
            deleteTarget(bloomTargetA);
            deleteTarget(bloomTargetB);
            const bloomW = Math.max(1, Math.round(width / BLOOM_DOWNSCALE));
            const bloomH = Math.max(1, Math.round(height / BLOOM_DOWNSCALE));
            sceneTarget = createTarget(width, height);
            bloomTargetA = createTarget(bloomW, bloomH);
            bloomTargetB = createTarget(bloomW, bloomH);
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

        const bindTexture = (texture: WebGLTexture, unit: number, uniform: WebGLUniformLocation | null) => {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if (uniform) gl.uniform1i(uniform, unit);
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
            if (!sceneTarget || !bloomTargetA || !bloomTargetB) return;

            const elapsed = (time - startTime) * 0.001;

            // 1. cena (raymarch) na resolução interna
            gl.bindFramebuffer(gl.FRAMEBUFFER, sceneTarget.fbo);
            gl.viewport(0, 0, sceneTarget.width, sceneTarget.height);
            gl.useProgram(sceneProgram);
            gl.uniform2f(sceneUniforms.resolution, sceneTarget.width, sceneTarget.height);
            gl.uniform1f(sceneUniforms.time, elapsed);
            gl.uniform1f(sceneUniforms.steps, marchSteps);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 2. extrai os brilhos num quarto da resolução
            gl.bindFramebuffer(gl.FRAMEBUFFER, bloomTargetA.fbo);
            gl.viewport(0, 0, bloomTargetA.width, bloomTargetA.height);
            gl.useProgram(brightProgram);
            bindTexture(sceneTarget.texture, 0, brightUniforms.scene);
            gl.uniform2f(brightUniforms.texelSize, 1 / sceneTarget.width, 1 / sceneTarget.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 3. blur gaussiano separável (H depois V)
            gl.bindFramebuffer(gl.FRAMEBUFFER, bloomTargetB.fbo);
            gl.useProgram(blurProgram);
            bindTexture(bloomTargetA.texture, 0, blurUniforms.texture);
            gl.uniform2f(blurUniforms.direction, 1 / bloomTargetA.width, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.bindFramebuffer(gl.FRAMEBUFFER, bloomTargetA.fbo);
            bindTexture(bloomTargetB.texture, 0, blurUniforms.texture);
            gl.uniform2f(blurUniforms.direction, 0, 1 / bloomTargetA.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 4. composição final no canvas: cena + bloom, gamma, vinheta, dither
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(compositeProgram);
            bindTexture(sceneTarget.texture, 0, compositeUniforms.scene);
            bindTexture(bloomTargetA.texture, 1, compositeUniforms.bloom);
            gl.uniform2f(compositeUniforms.resolution, canvas.width, canvas.height);
            gl.uniform1f(compositeUniforms.time, elapsed);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            deleteTarget(sceneTarget);
            deleteTarget(bloomTargetA);
            deleteTarget(bloomTargetB);
            gl.deleteProgram(sceneProgram);
            gl.deleteProgram(brightProgram);
            gl.deleteProgram(blurProgram);
            gl.deleteProgram(compositeProgram);
            gl.deleteShader(vertexShader);
            gl.deleteBuffer(positionBuffer);
            gl.deleteVertexArray(vao);
        };
    }, [canvasRef]);

    return { error };
};
