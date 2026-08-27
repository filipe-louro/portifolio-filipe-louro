"use client";

import React, { useRef, useState } from 'react';
import { Settings2, Waves, X } from 'lucide-react';
import { useFluidSimulation } from '../_hooks/useFluidSimulation';
import { FluidStyles } from './FluidStyles';
import { FluidControls } from './FluidControls';
import { DEFAULT_CONFIG, FluidConfig } from '../_utils/types';
import { randomizeConfig } from '../_utils/presets';

export const FluidScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<FluidConfig>(DEFAULT_CONFIG);
    const [isPaused, setIsPaused] = useState(false);
    const [showControls, setShowControls] = useState(false);

    const { error, clear } = useFluidSimulation(canvasRef, containerRef, config, isPaused);

    const handleReset = () => {
        setConfig(DEFAULT_CONFIG);
        clear();
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden font-sans select-none">
            <FluidStyles />

            {error && (
                <div className="absolute top-44 md:top-10 left-1/2 -translate-x-1/2 text-red-400 bg-white/5 border border-red-500/20 p-4 rounded-xl z-50 backdrop-blur-md max-w-md text-center text-sm">
                    {error}
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block cursor-crosshair"
                style={{ touchAction: 'none' }}
            />

            <div className="absolute top-40 md:top-0 left-0 w-full p-4 md:p-6 z-30 pointer-events-none flex justify-between items-start md:bg-gradient-to-b md:from-black/60 md:to-transparent">
                <div className="flex items-center gap-1.5 md:gap-2 text-teal-300 min-w-0">
                    <Waves size={18} className="shrink-0" />
                    <h1 className="text-sm md:text-lg font-bold tracking-widest uppercase truncate drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
                        Fluid Simulation
                    </h1>
                </div>

                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar controles' : 'Abrir controles'}
                    className={`pointer-events-auto shrink-0 p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-teal-500/10 hover:bg-teal-500/30 text-teal-300 border-teal-500/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10 px-4 text-center">
                <p className="text-teal-200/50 text-[11px] md:text-xs font-mono tracking-widest uppercase hidden md:block">
                    Mova, clique ou arraste para perturbar o fluido
                </p>
                <p className="text-teal-200/50 text-[11px] font-mono tracking-widest uppercase md:hidden">
                    Toque ou arraste para perturbar o fluido
                </p>
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            <FluidControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                isPaused={isPaused}
                onTogglePause={() => setIsPaused((prev) => !prev)}
                onClear={clear}
                onReset={handleReset}
                onRandomize={() => setConfig(randomizeConfig())}
            />
        </div>
    );
};
