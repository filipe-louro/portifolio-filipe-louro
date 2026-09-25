"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { MandelbulbConfig } from '../_utils/types';
import { PALETTE_OPTIONS } from '../_utils/palettes';
import { vertexShaderSource, fragmentShaderSource } from '../_utils/shaders';

export const useMandelbulb = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: MandelbulbConfig
) => {
    const [error, setError] = useState<string | null>(null);
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    const rotationRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0.8, pitch: 0.35 });
    const zoomRef = useRef<number>(2.6);
    const isDraggingRef = useRef(false);
    const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const resetCamera = useCallback(() => {
        rotationRef.current = { yaw: 0.8, pitch: 0.35 };
        zoomRef.current = 2.6;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const gl = canvas.getContext('webgl2', {
            antialias: false,
            powerPreference: 'high-performance',
            alpha: false,
        });

        if (!gl) {
            setError('WebGL 2.0 não é suportado no seu navegador.');
            return;
        }

        const createShader = (type: number, source: string): WebGLShader | null => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vs = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vs || !fs) {
            setError('Erro ao compilar shaders GLSL do Mandelbulb.');
            return;
        }

        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            setError('Erro ao vincular programa WebGL do Mandelbulb.');
            return;
        }

        gl.useProgram(program);

        // Geometria de quad fullscreen
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ]);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const aPositionLoc = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPositionLoc);
        gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

        // Localização dos uniformes
        const uResLoc = gl.getUniformLocation(program, 'uResolution');
        const uRotLoc = gl.getUniformLocation(program, 'uRotation');
        const uZoomLoc = gl.getUniformLocation(program, 'uZoom');
        const uPowerLoc = gl.getUniformLocation(program, 'uPower');
        const uMaxItLoc = gl.getUniformLocation(program, 'uMaxIterations');
        const uPalLoc = gl.getUniformLocation(program, 'uPalette');
        const uGlowLoc = gl.getUniformLocation(program, 'uGlow');
        const uTimeLoc = gl.getUniformLocation(program, 'uTime');

        let width = 0;
        let height = 0;

        const resize = () => {
            const isMobile = window.innerWidth < 768;
            const dprCap = isMobile ? 1.0 : 1.25;
            const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
            width = container.clientWidth || window.innerWidth;
            height = container.clientHeight || window.innerHeight;

            canvas.width = Math.max(1, Math.floor(width * dpr));
            canvas.height = Math.max(1, Math.floor(height * dpr));

            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        const startTime = performance.now();

        const render = () => {
            const now = performance.now();
            const time = (now - startTime) * 0.001;

            if (configRef.current.autoRotate && !isDraggingRef.current) {
                rotationRef.current.yaw += 0.004;
            }

            gl.useProgram(program);
            gl.bindVertexArray(vao);

            gl.uniform2f(uResLoc, canvas.width, canvas.height);
            gl.uniform2f(uRotLoc, rotationRef.current.yaw, rotationRef.current.pitch);
            gl.uniform1f(uZoomLoc, zoomRef.current);
            gl.uniform1f(uPowerLoc, configRef.current.power);
            gl.uniform1i(uMaxItLoc, configRef.current.maxIterations);

            const paletteIndex = PALETTE_OPTIONS.findIndex((p) => p.id === configRef.current.palette);
            gl.uniform1i(uPalLoc, paletteIndex >= 0 ? paletteIndex : 0);

            gl.uniform1f(uGlowLoc, configRef.current.glow);
            gl.uniform1f(uTimeLoc, time);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            requestRef.current = requestAnimationFrame(render);
        };

        let initialPinchDist: number | null = null;
        let initialZoom = zoomRef.current;

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            if ('touches' in e && e.touches.length === 2) {
                const t1 = e.touches[0];
                const t2 = e.touches[1];
                initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                initialZoom = zoomRef.current;
                isDraggingRef.current = false;
                return;
            }

            isDraggingRef.current = true;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            lastMousePosRef.current = { x: clientX, y: clientY };
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            if ('touches' in e && e.touches.length === 2) {
                if (initialPinchDist !== null && initialPinchDist > 0) {
                    const t1 = e.touches[0];
                    const t2 = e.touches[1];
                    const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                    const scaleFactor = initialPinchDist / Math.max(1, currentDist);
                    zoomRef.current = Math.max(1.7, Math.min(4.8, initialZoom * scaleFactor));
                }
                return;
            }

            if (!isDraggingRef.current) return;

            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const dx = clientX - lastMousePosRef.current.x;
            const dy = clientY - lastMousePosRef.current.y;

            rotationRef.current.yaw += dx * 0.008;
            rotationRef.current.pitch = Math.max(-1.4, Math.min(1.4, rotationRef.current.pitch + dy * 0.008));

            lastMousePosRef.current = { x: clientX, y: clientY };
        };

        const handlePointerUp = (e: MouseEvent | TouchEvent) => {
            if ('touches' in e && e.touches.length < 2) {
                initialPinchDist = null;
            }
            if (!('touches' in e) || e.touches.length === 0) {
                isDraggingRef.current = false;
            }
        };

        const handleMouseLeave = () => {
            isDraggingRef.current = false;
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY * 0.002;
            zoomRef.current = Math.max(1.7, Math.min(4.8, zoomRef.current + delta));
        };

        resize();
        render();

        window.addEventListener('resize', resize);
        container.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        container.addEventListener('mouseleave', handleMouseLeave);

        container.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('resize', resize);
            container.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            container.removeEventListener('mouseleave', handleMouseLeave);

            container.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            container.removeEventListener('wheel', handleWheel);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);

            gl.deleteBuffer(vbo);
            gl.deleteVertexArray(vao);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, [canvasRef, containerRef]);

    return { error, resetCamera };
};
