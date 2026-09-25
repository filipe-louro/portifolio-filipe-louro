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
                <div className="absolute top-20 left-1/2 -translate-x-1/2 text-red-300 bg-slate-900/90 border border-red-500/30 p-6 rounded-2xl z-50 backdrop-blur-xl max-w-lg text-center shadow-2xl">
                    <p className="font-bold text-sm mb-2 text-red-400">{error}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        No <strong>Brave</strong>: desative a proteção do <em>Shields</em> (ícone do leão na URL) ou ative a aceleração gráfica em <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">brave://settings/system</code> e <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">brave://flags/#ignore-gpu-blocklist</code>.
                    </p>
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