"use client";

import React, { useRef, useState } from 'react';
import { Play, Pause, Settings2, X } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
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
                <div className="absolute top-20 left-1/2 -translate-x-1/2 text-red-300 bg-slate-900/90 border border-red-500/30 p-6 rounded-2xl z-50 backdrop-blur-xl max-w-lg text-center shadow-2xl">
                    <p className="font-bold text-sm mb-2 text-red-400">{error}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        No <strong>Brave</strong>: desative o <em>Shields</em> (ícone do leão na URL) para permitir buffers de ponto flutuante, ou ative a aceleração gráfica em <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">brave://settings/system</code> e <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">brave://flags/#ignore-gpu-blocklist</code>.
                    </p>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block cursor-crosshair"
                style={{ touchAction: 'none' }}
            />

            {/* Z2 — ações primárias */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                <button
                    onClick={() => setIsPaused((prev) => !prev)}
                    aria-label={isPaused ? 'Retomar simulação' : 'Pausar simulação'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        isPaused
                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 shadow-emerald-900/20'
                            : 'bg-teal-500/10 hover:bg-teal-500/30 text-teal-300 border-teal-500/20 shadow-teal-900/20'
                    }`}
                >
                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar controles' : 'Abrir controles'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-teal-500/10 hover:bg-teal-500/30 text-teal-300 border-teal-500/20 shadow-teal-900/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Fluid Simulation"
                subtitle="Dinâmica Navier-Stokes . GPU Realtime"
                titleClassName="text-teal-100"
                subtitleClassName="text-teal-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30">
                Arraste para perturbar o fluido
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
