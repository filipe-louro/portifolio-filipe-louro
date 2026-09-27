"use client";

import { useState, useEffect, useRef, RefObject } from 'react';
import {
    vertexShaderSource,
    fragmentShaderSource,
    brightPassShaderSource,
    blurShaderSource,
    compositeShaderSource,
} from '../_utils/shaders';
import { BlackHoleConfig, QualityPreset, DEFAULT_CONFIG } from '../_utils/types';

const SLOW_FRAME_MS = 19.5;
const FAST_FRAME_MS = 17.2;
const ADJUST_INTERVAL_MS = 600;
const BLOOM_DOWNSCALE = 4;

const PRESET_SETTINGS: Record<
    QualityPreset,
    {
        baseSteps: number;
        minSteps: number;
        maxSteps: number;
        baseScale: number;
        minScale: number;
        dprCap: number;
    }
> = {
    performance: {
        baseSteps: 85,
        minSteps: 60,
        maxSteps: 100,
        baseScale: 0.65,
        minScale: 0.45,
        dprCap: 1.0,
    },
    balanced: {
        baseSteps: 140,
        minSteps: 85,
        maxSteps: 160,
        baseScale: 0.85,
        minScale: 0.60,
        dprCap: 1.0,
    },
    cinematic: {
        baseSteps: 200,
        minSteps: 140,
        maxSteps: 260,
        baseScale: 1.0,
        minScale: 0.75,
        dprCap: 1.25,
    },
};

interface Target {
    fbo: WebGLFramebuffer;
    texture: WebGLTexture;
    width: number;
    height: number;
}

export const useWebGLBlackHole = (
    canvasRef: RefObject<HTMLCanvasElement | null>,
    config: BlackHoleConfig = DEFAULT_CONFIG
) => {
    const [error, setError] = useState<string | null>(null);
    const configRef = useRef<BlackHoleConfig>(config);

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: 'high-performance',
        });

        if (!gl) {
            setError('WebGL 2.0 não suportado pelo seu navegador.');
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
            setError('Falha ao compilar shader de vértice.');
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
            setError('Falha ao compilar shaders.');
            return;
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        );

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const positionAttributeLocation = gl.getAttribLocation(sceneProgram, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        const sceneUniforms = {
            resolution: gl.getUniformLocation(sceneProgram, 'u_resolution'),
            time: gl.getUniformLocation(sceneProgram, 'u_time'),
            orbitTime: gl.getUniformLocation(sceneProgram, 'u_orbitTime'),
            diskTime: gl.getUniformLocation(sceneProgram, 'u_diskTime'),
            steps: gl.getUniformLocation(sceneProgram, 'u_steps'),
            beamIntensity: gl.getUniformLocation(sceneProgram, 'u_beamIntensity'),
            cameraTilt: gl.getUniformLocation(sceneProgram, 'u_cameraTilt'),
            autoRotate: gl.getUniformLocation(sceneProgram, 'u_autoRotate'),
        };
        const brightUniforms = {
            scene: gl.getUniformLocation(brightProgram, 'u_scene'),
            texelSize: gl.getUniformLocation(brightProgram, 'u_texelSize'),
            viewportScale: gl.getUniformLocation(brightProgram, 'u_viewportScale'),
        };
        const blurUniforms = {
            texture: gl.getUniformLocation(blurProgram, 'u_texture'),
            direction: gl.getUniformLocation(blurProgram, 'u_direction'),
            viewportScale: gl.getUniformLocation(blurProgram, 'u_viewportScale'),
            texelSize: gl.getUniformLocation(blurProgram, 'u_texelSize'),
        };
        const compositeUniforms = {
            scene: gl.getUniformLocation(compositeProgram, 'u_scene'),
            bloom: gl.getUniformLocation(compositeProgram, 'u_bloom'),
            resolution: gl.getUniformLocation(compositeProgram, 'u_resolution'),
            time: gl.getUniformLocation(compositeProgram, 'u_time'),
            viewportScaleScene: gl.getUniformLocation(compositeProgram, 'u_viewportScaleScene'),
            viewportScaleBloom: gl.getUniformLocation(compositeProgram, 'u_viewportScaleBloom'),
            texelSizeScene: gl.getUniformLocation(compositeProgram, 'u_texelSizeScene'),
            texelSizeBloom: gl.getUniformLocation(compositeProgram, 'u_texelSizeBloom'),
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

        let currentQuality = configRef.current.quality;
        let preset = PRESET_SETTINGS[currentQuality] || PRESET_SETTINGS.balanced;
        let marchSteps = preset.baseSteps;
        let renderScale = preset.baseScale;
        let needsResize = true;

        const resize = () => {
            const isMobile = window.innerWidth < 768;
            const targetDprCap = isMobile ? Math.min(preset.dprCap, 1.0) : preset.dprCap;
            const dpr = Math.min(window.devicePixelRatio || 1, targetDprCap);

            const baseW = Math.max(1, Math.round(canvas.clientWidth * dpr));
            const baseH = Math.max(1, Math.round(canvas.clientHeight * dpr));

            if (canvas.width === baseW && canvas.height === baseH && sceneTarget) return;

            canvas.width = baseW;
            canvas.height = baseH;

            deleteTarget(sceneTarget);
            deleteTarget(bloomTargetA);
            deleteTarget(bloomTargetB);

            const bloomW = Math.max(1, Math.round(baseW / BLOOM_DOWNSCALE));
            const bloomH = Math.max(1, Math.round(baseH / BLOOM_DOWNSCALE));

            sceneTarget = createTarget(baseW, baseH);
            bloomTargetA = createTarget(bloomW, bloomH);
            bloomTargetB = createTarget(bloomW, bloomH);
        };

        const resizeObserver = new ResizeObserver(() => {
            needsResize = true;
        });
        resizeObserver.observe(canvas);

        let animationFrameId = 0;
        let isRunning = true;
        const startTime = performance.now();
        let lastFrameTime = startTime;
        let frameTimeAccum = 0;
        let frameCount = 0;
        let lastAdjustTime = startTime;
        let fastCountStreak = 0;
        let orbitTime = 0;
        let diskTime = 0;

        const adjustQuality = (avgFrameMs: number) => {
            const p = PRESET_SETTINGS[configRef.current.quality] || PRESET_SETTINGS.balanced;

            if (avgFrameMs > SLOW_FRAME_MS) {
                fastCountStreak = 0;
                // Prioriza reduzir passos do raymarching (140 -> 110 -> 85) antes de baixar resolução interna
                if (marchSteps > p.minSteps) {
                    marchSteps = Math.max(p.minSteps, marchSteps - 28);
                } else if (renderScale > p.minScale) {
                    renderScale = Math.max(p.minScale, renderScale * 0.88);
                }
            } else if (avgFrameMs <= FAST_FRAME_MS) {
                fastCountStreak++;
                // Exige estabilidade (3 ciclos = 1.8s) antes de recuperar qualidade
                if (fastCountStreak >= 3) {
                    if (renderScale < p.baseScale) {
                        renderScale = Math.min(p.baseScale, renderScale * 1.06);
                    } else if (marchSteps < p.baseSteps) {
                        marchSteps = Math.min(p.baseSteps, marchSteps + 15);
                    } else if (avgFrameMs < 14.0 && marchSteps < p.maxSteps) {
                        // Telas de alta taxa de atualização (> 75Hz / 120Hz) com folga real
                        marchSteps = Math.min(p.maxSteps, marchSteps + 10);
                    }
                }
            } else {
                fastCountStreak = 0;
            }
        };

        const bindTexture = (texture: WebGLTexture, unit: number, uniform: WebGLUniformLocation | null) => {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if (uniform) gl.uniform1i(uniform, unit);
        };

        const render = (time: number) => {
            if (!isRunning) return;
            animationFrameId = requestAnimationFrame(render);

            // Reage a mudança de qualidade do preset
            if (configRef.current.quality !== currentQuality) {
                currentQuality = configRef.current.quality;
                preset = PRESET_SETTINGS[currentQuality] || PRESET_SETTINGS.balanced;
                marchSteps = preset.baseSteps;
                renderScale = preset.baseScale;
                needsResize = true;
            }

            const frameMs = time - lastFrameTime;
            lastFrameTime = time;

            if (frameMs > 0 && frameMs < 100) {
                frameTimeAccum += frameMs;
                frameCount++;
            }

            const dt = Math.min(Math.max(0, frameMs * 0.001), 0.1);
            const cfg = configRef.current;
            if (cfg.autoRotate) {
                orbitTime += dt;
            }
            diskTime += dt * cfg.diskSpeed;

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

            const baseW = sceneTarget.width;
            const baseH = sceneTarget.height;
            const activeW = Math.max(1, Math.round(baseW * renderScale));
            const activeH = Math.max(1, Math.round(baseH * renderScale));

            const bloomBaseW = bloomTargetA.width;
            const bloomBaseH = bloomTargetA.height;
            const activeBloomW = Math.max(1, Math.round(activeW / BLOOM_DOWNSCALE));
            const activeBloomH = Math.max(1, Math.round(activeH / BLOOM_DOWNSCALE));

            const scaleSceneX = activeW / baseW;
            const scaleSceneY = activeH / baseH;
            const scaleBloomX = activeBloomW / bloomBaseW;
            const scaleBloomY = activeBloomH / bloomBaseH;

            const elapsed = (time - startTime) * 0.001;

            // 1. Raymarching volumétrico no viewport ativo (zero realocação de FBOs)
            gl.bindFramebuffer(gl.FRAMEBUFFER, sceneTarget.fbo);
            gl.viewport(0, 0, activeW, activeH);
            gl.useProgram(sceneProgram);
            gl.uniform2f(sceneUniforms.resolution, activeW, activeH);
            gl.uniform1f(sceneUniforms.time, elapsed);
            gl.uniform1f(sceneUniforms.orbitTime, orbitTime);
            gl.uniform1f(sceneUniforms.diskTime, diskTime);
            gl.uniform1f(sceneUniforms.steps, marchSteps);
            gl.uniform1f(sceneUniforms.beamIntensity, cfg.beamIntensity);
            gl.uniform1f(sceneUniforms.cameraTilt, cfg.cameraTilt);
            gl.uniform1f(sceneUniforms.autoRotate, cfg.autoRotate ? 1.0 : 0.0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 2. Extração de altas luzes (Bright Pass)
            gl.bindFramebuffer(gl.FRAMEBUFFER, bloomTargetA.fbo);
            gl.viewport(0, 0, activeBloomW, activeBloomH);
            gl.useProgram(brightProgram);
            bindTexture(sceneTarget.texture, 0, brightUniforms.scene);
            gl.uniform2f(brightUniforms.texelSize, 1.0 / baseW, 1.0 / baseH);
            gl.uniform2f(brightUniforms.viewportScale, scaleSceneX, scaleSceneY);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 3. Bloom anamórfico: dispersão horizontal 5x para streak cinematográfico IMAX
            gl.bindFramebuffer(gl.FRAMEBUFFER, bloomTargetB.fbo);
            gl.viewport(0, 0, activeBloomW, activeBloomH);
            gl.useProgram(blurProgram);
            bindTexture(bloomTargetA.texture, 0, blurUniforms.texture);
            gl.uniform2f(blurUniforms.direction, 4.5 / bloomBaseW, 0.0);
            gl.uniform2f(blurUniforms.viewportScale, scaleBloomX, scaleBloomY);
            gl.uniform2f(blurUniforms.texelSize, 1.0 / bloomBaseW, 1.0 / bloomBaseH);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 4. Bloom vertical sutil
            gl.bindFramebuffer(gl.FRAMEBUFFER, bloomTargetA.fbo);
            gl.viewport(0, 0, activeBloomW, activeBloomH);
            bindTexture(bloomTargetB.texture, 0, blurUniforms.texture);
            gl.uniform2f(blurUniforms.direction, 0.0, 0.9 / bloomBaseH);
            gl.uniform2f(blurUniforms.viewportScale, scaleBloomX, scaleBloomY);
            gl.uniform2f(blurUniforms.texelSize, 1.0 / bloomBaseW, 1.0 / bloomBaseH);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 5. Composição final no canvas: cena + flare anamórfico + dither
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(compositeProgram);
            bindTexture(sceneTarget.texture, 0, compositeUniforms.scene);
            bindTexture(bloomTargetA.texture, 1, compositeUniforms.bloom);
            gl.uniform2f(compositeUniforms.resolution, canvas.width, canvas.height);
            gl.uniform1f(compositeUniforms.time, elapsed);
            gl.uniform2f(compositeUniforms.viewportScaleScene, scaleSceneX, scaleSceneY);
            gl.uniform2f(compositeUniforms.viewportScaleBloom, scaleBloomX, scaleBloomY);
            gl.uniform2f(compositeUniforms.texelSizeScene, 1.0 / baseW, 1.0 / baseH);
            gl.uniform2f(compositeUniforms.texelSizeBloom, 1.0 / bloomBaseW, 1.0 / bloomBaseH);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                isRunning = false;
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = 0;
                }
            } else {
                isRunning = true;
                lastFrameTime = performance.now();
                frameTimeAccum = 0;
                frameCount = 0;
                lastAdjustTime = performance.now();
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(render);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        animationFrameId = requestAnimationFrame(render);

        return () => {
            isRunning = false;
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
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
