"use client";

import React, { useRef } from 'react';
import { useExplosion } from '../_hooks/use-explosion';

export function ExplodingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useExplosion(canvasRef);

    return (
        <div className="fixed inset-0 w-full h-full bg-slate-950 cursor-crosshair touch-none overflow-hidden select-none">
            <canvas ref={canvasRef} className="block w-full h-full" />

            <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none px-4">
                <p className="text-slate-500 text-sm font-mono tracking-widest uppercase opacity-60 animate-pulse">
                    Interaja para desintegrar
                </p>
            </div>
        </div>
    );
}