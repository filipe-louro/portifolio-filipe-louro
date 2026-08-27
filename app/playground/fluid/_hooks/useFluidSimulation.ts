"use client";

import { RefObject, useEffect, useRef, useState } from 'react';
import {
    compileShader,
    createDoubleFBO,
    createFBO,
    createProgram,
    deleteDoubleFBO,
    deleteFBO,
    DoubleFBO,
    FBO,
    getFluidGLContext,
    getResolution,
    GLProgram,
} from '../_utils/gl';
import {
    advectionShader,
    baseVertexShader,
    clearShader,
    curlShader,
    displayShader,
    divergenceShader,
    gradientSubtractShader,
    pressureShader,
    splatShader,
    vorticityShader,
} from '../_utils/shaders';
import { nextSplatColor } from '../_utils/colorModes';
import { FluidConfig } from '../_utils/types';

const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 512;
const MOBILE_SIM_RESOLUTION = 96;
const MOBILE_DYE_RESOLUTION = 256;
const PRESSURE_DECAY = 0.8;
const DRAG_BOOST = 1.6;
const BURST_FORCE_MULTIPLIER = 1.8;

interface Pointer {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    down: boolean;
    moved: boolean;
    color: [number, number, number];
}

interface Burst {
    x: number;
    y: number;
    color: [number, number, number];
}

const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth < 768;

export function useFluidSimulation(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    containerRef: RefObject<HTMLDivElement | null>,
    config: FluidConfig,
    isPaused: boolean
) {
    const [error, setError] = useState<string | null>(null);
    const configRef = useRef(config);
    const isPausedRef = useRef(isPaused);
    const clearRef = useRef<() => void>(() => {});

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const context = getFluidGLContext(canvas);
        if (!context) {
            setError('WebGL 2.0 com suporte a texturas de ponto flutuante não está disponível neste navegador.');
            return;
        }

        const { gl, formatRGBA, formatRG, formatR } = context;

        let rafId = 0;
        let lastTime = performance.now();
        let needsResize = true;

        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, baseVertexShader);
        const quadBuffer = gl.createBuffer();
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        let splatProgram: GLProgram;
        let advectionProgram: GLProgram;
        let divergenceProgram: GLProgram;
        let curlProgram: GLProgram;
        let vorticityProgram: GLProgram;
        let pressureProgram: GLProgram;
        let gradientSubtractProgram: GLProgram;
        let clearProgram: GLProgram;
        let displayProgram: GLProgram;

        let velocity: DoubleFBO;
        let dye: DoubleFBO;
        let pressure: DoubleFBO;
        let divergence: FBO;
        let curl: FBO;
        let fieldsAllocated = false;

        try {
            splatProgram = createProgram(gl, vertexShader, splatShader);
            advectionProgram = createProgram(gl, vertexShader, advectionShader);
            divergenceProgram = createProgram(gl, vertexShader, divergenceShader);
            curlProgram = createProgram(gl, vertexShader, curlShader);
            vorticityProgram = createProgram(gl, vertexShader, vorticityShader);
            pressureProgram = createProgram(gl, vertexShader, pressureShader);
            gradientSubtractProgram = createProgram(gl, vertexShader, gradientSubtractShader);
            clearProgram = createProgram(gl, vertexShader, clearShader);
            displayProgram = createProgram(gl, vertexShader, displayShader);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao compilar os shaders da simulação.');
            return;
        }

        function blit(target: FBO | null) {
            if (target === null) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, canvas!.width, canvas!.height);
            } else {
                gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
                gl.viewport(0, 0, target.width, target.height);
            }
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        function bindTexture(texture: WebGLTexture, unit: number, uniform: WebGLUniformLocation | null) {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if (uniform) gl.uniform1i(uniform, unit);
        }

        function allocateFields() {
            const mobile = isMobileViewport();
            const simRes = getResolution(canvas!.width, canvas!.height, mobile ? MOBILE_SIM_RESOLUTION : SIM_RESOLUTION);
            const dyeRes = getResolution(canvas!.width, canvas!.height, mobile ? MOBILE_DYE_RESOLUTION : DYE_RESOLUTION);

            velocity = createDoubleFBO(gl, simRes.width, simRes.height, formatRG.internalFormat, formatRG.format, gl.LINEAR);
            dye = createDoubleFBO(gl, dyeRes.width, dyeRes.height, formatRGBA.internalFormat, formatRGBA.format, gl.LINEAR);
            pressure = createDoubleFBO(gl, simRes.width, simRes.height, formatR.internalFormat, formatR.format, gl.NEAREST);
            divergence = createFBO(gl, simRes.width, simRes.height, formatR.internalFormat, formatR.format, gl.NEAREST);
            curl = createFBO(gl, simRes.width, simRes.height, formatR.internalFormat, formatR.format, gl.NEAREST);
        }

        function releaseFields() {
            deleteDoubleFBO(gl, velocity);
            deleteDoubleFBO(gl, dye);
            deleteDoubleFBO(gl, pressure);
            deleteFBO(gl, divergence);
            deleteFBO(gl, curl);
        }

        function resizeAll() {
            const displayWidth = container!.clientWidth;
            const displayHeight = container!.clientHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, isMobileViewport() ? 1 : 1.5);

            canvas!.width = Math.max(1, Math.round(displayWidth * dpr));
            canvas!.height = Math.max(1, Math.round(displayHeight * dpr));

            if (fieldsAllocated) releaseFields();
            allocateFields();
            fieldsAllocated = true;
        }

        resizeAll();
        needsResize = false;

        function clearFluid() {
            [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write, divergence, curl].forEach((target) => {
                gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
                gl.clear(gl.COLOR_BUFFER_BIT);
            });
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        clearRef.current = clearFluid;

        function splatVelocity(x: number, y: number, dx: number, dy: number, radius: number) {
            gl.useProgram(splatProgram.program);
            gl.uniform2f(splatProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            bindTexture(velocity.read.texture, 0, splatProgram.uniforms.uTarget);
            gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas!.width / canvas!.height);
            gl.uniform2f(splatProgram.uniforms.point, x, y);
            gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
            gl.uniform1f(splatProgram.uniforms.radius, radius);
            blit(velocity.write);
            velocity.swap();
        }

        function splatDye(x: number, y: number, color: [number, number, number], radius: number) {
            gl.useProgram(splatProgram.program);
            gl.uniform2f(splatProgram.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
            bindTexture(dye.read.texture, 0, splatProgram.uniforms.uTarget);
            gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas!.width / canvas!.height);
            gl.uniform2f(splatProgram.uniforms.point, x, y);
            gl.uniform3f(splatProgram.uniforms.color, color[0], color[1], color[2]);
            gl.uniform1f(splatProgram.uniforms.radius, radius);
            blit(dye.write);
            dye.swap();
        }

        function applyPointerSplat(pointer: Pointer, boost: number) {
            const dx = pointer.x - pointer.prevX;
            const dy = pointer.y - pointer.prevY;
            const speed = Math.hypot(dx, dy);
            if (speed < 0.0001) return;

            const cfg = configRef.current;
            const radius = cfg.brushSize * 0.00025 * (1 + Math.min(speed * 40, 1.5));
            splatVelocity(pointer.x, pointer.y, dx * cfg.force * boost, dy * cfg.force * boost, radius);
            splatDye(pointer.x, pointer.y, pointer.color, radius);
        }

        function applyBurst(burst: Burst) {
            const cfg = configRef.current;
            const angle = Math.random() * Math.PI * 2;
            const magnitude = cfg.force * BURST_FORCE_MULTIPLIER;
            const radius = cfg.brushSize * 0.00035;
            splatVelocity(burst.x, burst.y, Math.cos(angle) * magnitude, Math.sin(angle) * magnitude, radius);
            splatDye(burst.x, burst.y, burst.color, radius * 1.4);
        }

        function step(dt: number) {
            const cfg = configRef.current;

            gl.useProgram(curlProgram.program);
            gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            bindTexture(velocity.read.texture, 0, curlProgram.uniforms.uVelocity);
            blit(curl);

            gl.useProgram(vorticityProgram.program);
            gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            bindTexture(velocity.read.texture, 0, vorticityProgram.uniforms.uVelocity);
            bindTexture(curl.texture, 1, vorticityProgram.uniforms.uCurl);
            gl.uniform1f(vorticityProgram.uniforms.curlStrength, cfg.vorticity);
            gl.uniform1f(vorticityProgram.uniforms.dt, dt);
            blit(velocity.write);
            velocity.swap();

            gl.useProgram(divergenceProgram.program);
            gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            bindTexture(velocity.read.texture, 0, divergenceProgram.uniforms.uVelocity);
            blit(divergence);

            gl.useProgram(clearProgram.program);
            bindTexture(pressure.read.texture, 0, clearProgram.uniforms.uTexture);
            gl.uniform1f(clearProgram.uniforms.value, PRESSURE_DECAY);
            blit(pressure.write);
            pressure.swap();

            gl.useProgram(pressureProgram.program);
            gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            bindTexture(divergence.texture, 1, pressureProgram.uniforms.uDivergence);
            const iterations = Math.round(cfg.pressureIterations);
            for (let i = 0; i < iterations; i++) {
                bindTexture(pressure.read.texture, 0, pressureProgram.uniforms.uPressure);
                blit(pressure.write);
                pressure.swap();
            }

            gl.useProgram(gradientSubtractProgram.program);
            gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            bindTexture(pressure.read.texture, 0, gradientSubtractProgram.uniforms.uPressure);
            bindTexture(velocity.read.texture, 1, gradientSubtractProgram.uniforms.uVelocity);
            blit(velocity.write);
            velocity.swap();

            gl.useProgram(advectionProgram.program);
            gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            gl.uniform1f(advectionProgram.uniforms.dt, dt);
            bindTexture(velocity.read.texture, 0, advectionProgram.uniforms.uVelocity);
            bindTexture(velocity.read.texture, 1, advectionProgram.uniforms.uSource);
            gl.uniform1f(advectionProgram.uniforms.dissipation, cfg.viscosity);
            blit(velocity.write);
            velocity.swap();

            bindTexture(velocity.read.texture, 0, advectionProgram.uniforms.uVelocity);
            bindTexture(dye.read.texture, 1, advectionProgram.uniforms.uSource);
            gl.uniform1f(advectionProgram.uniforms.dissipation, cfg.dissipation);
            blit(dye.write);
            dye.swap();
        }

        function renderDisplay() {
            gl.useProgram(displayProgram.program);
            gl.uniform2f(displayProgram.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
            bindTexture(dye.read.texture, 0, displayProgram.uniforms.uTexture);
            blit(null);
        }

        const pointers = new Map<number, Pointer>();
        const pendingBursts: Burst[] = [];

        function toUv(clientX: number, clientY: number) {
            const rect = canvas!.getBoundingClientRect();
            return {
                x: (clientX - rect.left) / rect.width,
                y: 1 - (clientY - rect.top) / rect.height,
            };
        }

        const hueRef = { current: Math.random() };

        const handlePointerDown = (e: PointerEvent) => {
            canvas!.setPointerCapture(e.pointerId);
            const { x, y } = toUv(e.clientX, e.clientY);
            const color = nextSplatColor(configRef.current.colorMode, hueRef);
            pointers.set(e.pointerId, { x, y, prevX: x, prevY: y, down: true, moved: false, color });
            pendingBursts.push({ x, y, color });
        };

        const handlePointerMove = (e: PointerEvent) => {
            const { x, y } = toUv(e.clientX, e.clientY);
            const pointer = pointers.get(e.pointerId);
            if (!pointer) {
                pointers.set(e.pointerId, {
                    x, y, prevX: x, prevY: y, down: false, moved: false,
                    color: nextSplatColor(configRef.current.colorMode, hueRef),
                });
                return;
            }
            pointer.prevX = pointer.x;
            pointer.prevY = pointer.y;
            pointer.x = x;
            pointer.y = y;
            pointer.moved = true;
        };

        const handlePointerUp = (e: PointerEvent) => {
            const pointer = pointers.get(e.pointerId);
            if (pointer) pointer.down = false;
        };

        const handlePointerGone = (e: PointerEvent) => {
            pointers.delete(e.pointerId);
        };

        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointercancel', handlePointerGone);
        canvas.addEventListener('pointerleave', handlePointerGone);

        const resizeObserver = new ResizeObserver(() => {
            needsResize = true;
        });
        resizeObserver.observe(container);

        function frame(now: number) {
            rafId = requestAnimationFrame(frame);

            if (needsResize) {
                resizeAll();
                needsResize = false;
            }

            const dt = Math.min((now - lastTime) / 1000, 1 / 30);
            lastTime = now;

            if (isPausedRef.current) return;

            pointers.forEach((pointer) => {
                if (pointer.moved) {
                    applyPointerSplat(pointer, pointer.down ? DRAG_BOOST : 1);
                    pointer.moved = false;
                }
            });

            if (pendingBursts.length > 0) {
                pendingBursts.forEach(applyBurst);
                pendingBursts.length = 0;
            }

            step(dt);
            renderDisplay();
        }

        rafId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointercancel', handlePointerGone);
            canvas.removeEventListener('pointerleave', handlePointerGone);

            releaseFields();
            gl.deleteProgram(splatProgram.program);
            gl.deleteProgram(advectionProgram.program);
            gl.deleteProgram(divergenceProgram.program);
            gl.deleteProgram(curlProgram.program);
            gl.deleteProgram(vorticityProgram.program);
            gl.deleteProgram(pressureProgram.program);
            gl.deleteProgram(gradientSubtractProgram.program);
            gl.deleteProgram(clearProgram.program);
            gl.deleteProgram(displayProgram.program);
            gl.deleteShader(vertexShader);
            gl.deleteBuffer(quadBuffer);
            gl.deleteVertexArray(vao);
        };
    }, [canvasRef, containerRef]);

    return { error, clear: () => clearRef.current() };
}
