"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, RefreshCw } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useFerrofluidSimulation } from '../_hooks/useFerrofluidSimulation';
import { FerrofluidControls } from './FerrofluidControls';
import { DEFAULT_FERROFLUID_CONFIG, FerrofluidConfig } from '../_utils/types';

export const FerrofluidScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<FerrofluidConfig>(DEFAULT_FERROFLUID_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset, togglePolesPolarity } = useFerrofluidSimulation(canvasRef, containerRef, config);

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden font-sans select-none">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
            />

            {/* Z2 — ações primárias */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                <button
                    onClick={togglePolesPolarity}
                    aria-label="Inverter polaridade dos ímãs"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/20 shadow-cyan-950/20"
                >
                    <RefreshCw size={14} />
                    <span className="hidden sm:inline">PÓLOS</span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Restaurar simulação de ferrofluido"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/20 shadow-cyan-950/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/20 shadow-cyan-950/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Ferrofluid Spikes"
                subtitle="Instabilidade de Rosensweig . Magnetoidrodinâmica"
                titleClassName="text-cyan-100"
                subtitleClassName="text-cyan-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-cyan-200/40 text-center px-4">
                Arraste os ímãs magnéticos ou o corpo de ferrofluido . Observe os espinhos se alinharem ao fluxo
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <FerrofluidControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onReset={reset}
                onTogglePolarity={togglePolesPolarity}
            />
        </div>
    );
};
