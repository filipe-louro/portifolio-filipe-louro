"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, Activity, Layers } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useSandpileSimulation } from '../_hooks/useSandpileSimulation';
import { SandpileControls } from './SandpileControls';
import { DEFAULT_SANDPILE_CONFIG, SandpileConfig } from '../_utils/types';

export const SandpileScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<SandpileConfig>(DEFAULT_SANDPILE_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset, triggerEarthquake } = useSandpileSimulation(canvasRef, containerRef, config);

    const toggleMode = () => {
        setConfig((p) => ({
            ...p,
            mode: p.mode === 'granular' ? 'abelian' : 'granular',
        }));
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden font-sans select-none">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block cursor-crosshair"
                style={{ touchAction: 'none' }}
            />

            {/* Z2 — ações primárias */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                <button
                    onClick={toggleMode}
                    aria-label="Alternar entre dinâmica granular e fractal abeliano"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-white/10 hover:bg-white/20 border-white/20 text-white/70"
                >
                    <Layers size={16} />
                    <span className="hidden sm:inline">{config.mode === 'granular' ? 'GRANULAR' : 'ABELIANO'}</span>
                </button>
                <button
                    onClick={triggerEarthquake}
                    aria-label="Provocar abalo sísmico na pilha de areia"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 border-amber-500/20 shadow-amber-950/20"
                >
                    <Activity size={16} />
                    <span className="hidden sm:inline">ABALO</span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Restaurar grãos de areia"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 border-amber-500/20 shadow-amber-950/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 border-amber-500/20 shadow-amber-950/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Critical Sandpile"
                subtitle="Auto-Organização Crítica . Dinâmica Granular"
                titleClassName="text-amber-100"
                subtitleClassName="text-amber-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30 text-center px-4">
                Botão esquerdo despeja areia . Botão direito desenha barreiras . Tecla S causa abalo
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <SandpileControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onReset={reset}
                onEarthquake={triggerEarthquake}
            />
        </div>
    );
};
