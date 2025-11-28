"use client";

import React, { useRef } from 'react';
import { useWebGLBlackHole } from '../_hooks/useWebGLBlackHole';

export const BlackHoleScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { error } = useWebGLBlackHole(canvasRef);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center font-sans"
        >
            {error && (
                <div className="absolute top-10 text-red-500 bg-white/10 p-4 rounded z-50 backdrop-blur-md">
                    {error}
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="w-full h-full block"
            />

            <div className="absolute bottom-12 left-12 text-white/50 pointer-events-none select-none mix-blend-screen">
                <h1 className="text-4xl font-extralight tracking-[0.2em] mb-1 text-orange-100">GARGANTUA</h1>
                <p className="text-xs uppercase opacity-60 tracking-widest text-orange-200">Simulação Métrica . Classe Supermassiva</p>
            </div>
        </div>
    );
};