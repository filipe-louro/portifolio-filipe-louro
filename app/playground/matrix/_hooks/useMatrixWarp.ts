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

        const fontSize = 40;
        const focalLength = 400;
        const warpSpeed = 12;
        const maxDepth = 2000;
        const trailLimit = 16;

        const TARGET_FPS = 60;
        const TARGET_MS = 1000 / TARGET_FPS;

        const columns: Column[] = [];
        let numColumns = 0;

        const resetColumn = (col: Column, zStart?: number) => {
            const spreadX = w * 5;
            const spreadY = h * 4;

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

            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, w, h);

            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';

            columns.sort((a, b) => b.z - a.z);

            const baseColorHex = color;
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

                const scale = focalLength / col.z;

                const px = (cx + col.x * scale) | 0;
                const py = (cy + col.y * scale) | 0;

                if (px < -50 || px > w + 50 || py > h + 50 || py < -50) continue;

                const size = fontSize * scale;
                const sizeInt = Math.max(1, size | 0);

                if (sizeInt !== currentFontSize) {
                    ctx.font = `${sizeInt}px monospace`;
                    currentFontSize = sizeInt;
                }

                const baseAlpha = Math.min(1, Math.max(0, (1 - col.z / maxDepth) * 1.5));
                if (baseAlpha <= 0.05) continue;

                const charLen = col.chars.length;
                for (let j = 0; j < charLen; j++) {
                    const charYWorld = col.y + (j * fontSize * 1.1);
                    const charPy = (cy + charYWorld * scale) | 0;

                    if (charPy > h + sizeInt) break;
                    if (charPy < -sizeInt) continue;

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

                    ctx.fillText(col.chars[j], px, charPy);
                }
            }

            ctx.globalAlpha = 1.0;
            requestRef.current = requestAnimationFrame(draw);
        };

        resize();
        requestRef.current = requestAnimationFrame(draw);

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [color, canvasRef, containerRef]);
};