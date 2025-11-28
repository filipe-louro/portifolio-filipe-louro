"use client";

import { useState, useEffect, RefObject } from 'react';
import { vertexShaderSource, fragmentShaderSource } from '../_utils/shaders';

export const useWebGLBlackHole = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            powerPreference: "high-performance"
        });

        if (!gl) {
            setError("WebGL 2.0 não suportado pelo seu navegador.");
            return;
        }

        // --- Helpers de Compilação ---
        const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
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

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

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

        // --- Buffer Setup ---
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const timeLocation = gl.getUniformLocation(program, "u_time");

        // --- Render Loop ---
        let animationFrameId: number;
        const startTime = performance.now();

        const render = (time: number) => {
            if (!canvas || !gl) return;

            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;

            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width = displayWidth;
                canvas.height = displayHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }

            const elapsed = (time - startTime) * 0.001;

            gl.useProgram(program);
            gl.bindVertexArray(vao);

            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform1f(timeLocation, elapsed);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        // --- Cleanup ---
        return () => {
            cancelAnimationFrame(animationFrameId);
            if (gl) {
                gl.deleteProgram(program);
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                gl.deleteBuffer(positionBuffer);
                gl.deleteVertexArray(vao);
            }
        };
    }, [canvasRef]);

    return { error };
};