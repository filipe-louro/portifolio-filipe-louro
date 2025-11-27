"use client";

import React, { useRef } from 'react';
import { useVaporwaveEngine } from '@/app/playground/vaporwave/_hooks/use-vaporwave-engine';

export default function VaporwaveCityScene() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useVaporwaveEngine(canvasRef);

    return (
        <div className="fixed inset-0 w-full h-full bg-slate-950 overflow-hidden">
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                style={{ transform: 'translateZ(0)' }}
            />

            <div className="absolute bottom-[12%] left-0 w-full text-center pointer-events-none select-none">
                <p className="text-cyan-400 text-xs md:text-sm font-mono tracking-[0.5em] uppercase animate-pulse drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                    N E O - T O K Y O // A P P R O A C H
                </p>
            </div>
        </div>
    );
}