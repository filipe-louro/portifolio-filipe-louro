"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, Sparkles } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useMorphogenesisSimulation } from '../_hooks/useMorphogenesisSimulation';
import { MorphogenesisControls } from './MorphogenesisControls';
import { DEFAULT_MORPHOGENESIS_CONFIG, MorphogenesisConfig } from '../_utils/types';

export const MorphogenesisScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<MorphogenesisConfig>(DEFAULT_MORPHOGENESIS_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset, randomize } = useMorphogenesisSimulation(canvasRef, containerRef, config);

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
                    onClick={randomize}
                    aria-label="Espalhar sementes químicas aleatórias"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 border-purple-500/20 shadow-purple-950/20"
                >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">SEMEAR</span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Restaurar estado químico inicial"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 border-purple-500/20 shadow-purple-950/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 border-purple-500/20 shadow-purple-950/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Morphogenesis"
                subtitle="Padrões de Turing . Sistema Gray-Scott"
                titleClassName="text-purple-100"
                subtitleClassName="text-purple-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30 text-center px-4 whitespace-nowrap truncate max-w-[90vw]">
                Arraste para semear ativador . Botão direito dissolve reação
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <div onPointerDown={(e) => e.stopPropagation()}>
                <MorphogenesisControls
                    config={config}
                    setConfig={setConfig}
                    show={showControls}
                    onReset={reset}
                    onRandomize={randomize}
                />
            </div>
        </div>
    );
};
