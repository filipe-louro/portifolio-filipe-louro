"use client";

import { useEffect, useRef } from 'react';
import { MATRIX_CHARS } from '../_utils/matrixChars';

interface Column {
    x: number;
    y: number;
    z: number;
    chars: string[];
    maxTrailLen: number;
    charTimer: number;
    speedOffset: number;
}

export const useMatrixWarp = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    color: string
) => {
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    const colorRef = useRef(color);

    useEffect(() => {
        colorRef.current = color;
    }, [color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const charArray = MATRIX_CHARS.split('');
        const charArrayLength = charArray.length;

        let w = 0, h = 0;
        let cx = 0, cy = 0;

        let currentYaw = 0;
        let currentPitch = 0;
        let targetYaw = 0;
        let targetPitch = 0;

        const fontSize = 40;
        const focalLength = 400;
        const warpSpeed = 12;
        const maxDepth = 2000;
        const trailLimit = 16;

        const TARGET_FPS = 60;
        const TARGET_MS = 1000 / TARGET_FPS;

        const columns: Column[] = [];
        let numColumns = 0;

        const onMouseMove = (e: MouseEvent) => {
            const relX = (e.clientX / window.innerWidth) - 0.5;
            const relY = (e.clientY / window.innerHeight) - 0.5;
            targetYaw = relX * 0.65;
            targetPitch = -relY * 0.45;
        };

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            const touch = e.touches[0];
            const relX = (touch.clientX / window.innerWidth) - 0.5;
            const relY = (touch.clientY / window.innerHeight) - 0.5;
            targetYaw = relX * 0.65;
            targetPitch = -relY * 0.45;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            const touch = e.touches[0];
            const relX = (touch.clientX / window.innerWidth) - 0.5;
            const relY = (touch.clientY / window.innerHeight) - 0.5;
            targetYaw = relX * 0.65;
            targetPitch = -relY * 0.45;
        };

        const onTouchEnd = () => {
            targetYaw = 0;
            targetPitch = 0;
        };

        const onMouseLeave = () => {
            targetYaw = 0;
            targetPitch = 0;
        };

        const resetColumn = (col: Column, zStart?: number) => {
            const spreadX = w * 5.5;
            const spreadY = h * 4.5;

            col.x = (Math.random() - 0.5) * spreadX;
            col.y = (Math.random() - 0.5) * spreadY;
            col.z = zStart || Math.random() * maxDepth;
            col.speedOffset = 0.8 + Math.random() * 0.4;
            col.charTimer = 0;
            col.chars.length = 0;
            for (let i = 0; i < trailLimit; i++) {
                col.chars.push(charArray[Math.floor(Math.random() * charArrayLength)]);
            }
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

            w = container.clientWidth;
            h = container.clientHeight;

            canvas.width = w * dpr;
            canvas.height = h * dpr;

            ctx.scale(dpr, dpr);

            cx = w / 2;
            cy = h / 2;

            const densityFactor = w < 768 ? 0.4 : 1;
            numColumns = Math.floor(500 * densityFactor);

            if (columns.length < numColumns) {
                while (columns.length < numColumns) {
                    const col: Column = {
                        x: 0, y: 0, z: 0, chars: [], maxTrailLen: trailLimit, charTimer: 0, speedOffset: 0
                    };
                    resetColumn(col, Math.random() * maxDepth);
                    columns.push(col);
                }
            } else {
                columns.length = numColumns;
            }
        };

        const draw = (time: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = time;
            const deltaTime = time - lastTimeRef.current;
            lastTimeRef.current = time;

            let factor = deltaTime / TARGET_MS;
            if (factor > 4) factor = 1;

            currentYaw += (targetYaw - currentYaw) * 0.05;
            currentPitch += (targetPitch - currentPitch) * 0.05;

            const cosYaw = Math.cos(currentYaw);
            const sinYaw = Math.sin(currentYaw);
            const cosPitch = Math.cos(currentPitch);
            const sinPitch = Math.sin(currentPitch);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, w, h);

            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';

            const baseColorHex = colorRef.current;
            let currentFontSize = 0;
            const random = Math.random;
            const floor = Math.floor;

            for (let i = 0; i < numColumns; i++) {
                const col = columns[i];

                col.z -= (warpSpeed * col.speedOffset) * factor;
                col.charTimer += factor;

                if (col.charTimer > 7) {
                    col.chars.push(charArray[floor(random() * charArrayLength)]);
                    if (col.chars.length > trailLimit) {
                        col.chars.shift();
                        col.y += fontSize * 1.1;
                    }
                    col.charTimer -= 7;
                }

                if (random() > (1 - (0.3 * factor))) {
                    const idx = floor(random() * col.chars.length);
                    col.chars[idx] = charArray[floor(random() * charArrayLength)];
                }

                if (col.z <= 10) {
                    resetColumn(col, maxDepth);
                    continue;
                }

                const charLen = col.chars.length;
                for (let j = 0; j < charLen; j++) {
                    const charYWorld = col.y + (j * fontSize * 1.1);

                    // Rotação de câmera 3D: Pitch (em X) e Yaw (em Y)
                    const cy1 = charYWorld * cosPitch - col.z * sinPitch;
                    const cz1 = charYWorld * sinPitch + col.z * cosPitch;

                    const cx2 = col.x * cosYaw - cz1 * sinYaw;
                    const cz2 = col.x * sinYaw + cz1 * cosYaw;

                    if (cz2 <= 10) continue;

                    const charScale = focalLength / cz2;
                    const charPx = (cx + cx2 * charScale) | 0;
                    const charPy = (cy + cy1 * charScale) | 0;

                    const size = fontSize * charScale;
                    const sizeInt = Math.max(1, size | 0);

                    if (charPx < -sizeInt || charPx > w + sizeInt || charPy > h + sizeInt || charPy < -sizeInt) {
                        continue;
                    }

                    if (sizeInt !== currentFontSize) {
                        ctx.font = `${sizeInt}px monospace`;
                        currentFontSize = sizeInt;
                    }

                    const baseAlpha = Math.min(1, Math.max(0, (1 - cz2 / maxDepth) * 1.5));
                    if (baseAlpha <= 0.05) continue;

                    const isHead = (j === charLen - 1);

                    let fadeOutAlpha = 1;
                    if (j < 4) fadeOutAlpha = j / 4;

                    const distFromHead = (charLen - 1) - j;
                    const gradientAlpha = 1 - (distFromHead / 16) * 0.5;

                    const finalAlpha = baseAlpha * fadeOutAlpha * gradientAlpha;

                    if (Math.abs(ctx.globalAlpha - finalAlpha) > 0.01) {
                        ctx.globalAlpha = finalAlpha;
                    }

                    if (isHead) {
                        if (ctx.fillStyle !== '#ffffff') ctx.fillStyle = '#ffffff';
                    } else {
                        if (ctx.fillStyle !== baseColorHex) ctx.fillStyle = baseColorHex;
                    }

                    ctx.fillText(col.chars[j], charPx, charPy);
                }
            }

            ctx.globalAlpha = 1.0;
            requestRef.current = requestAnimationFrame(draw);
        };

        resize();
        requestRef.current = requestAnimationFrame(draw);

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        window.addEventListener('mouseleave', onMouseLeave);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('mouseleave', onMouseLeave);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef]);
};