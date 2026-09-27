"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, Sparkles } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useAttractorSimulation } from '../_hooks/useAttractorSimulation';
import { AttractorControls } from './AttractorControls';
import { DEFAULT_ATTRACTOR_CONFIG, AttractorConfig } from '../_utils/types';

export const AttractorScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<AttractorConfig>(DEFAULT_ATTRACTOR_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset, triggerButterflyBurst } = useAttractorSimulation(canvasRef, containerRef, config);

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
                    onClick={triggerButterflyBurst}
                    aria-label="Disparar divergência do Efeito Borboleta"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-violet-500/10 hover:bg-violet-500/30 text-violet-300 border-violet-500/20 shadow-violet-950/20"
                >
                    <Sparkles size={14} />
                    <span className="hidden sm:inline">BORBOLETA</span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Restaurar visualização do atrator"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-violet-500/10 hover:bg-violet-500/30 text-violet-300 border-violet-500/20 shadow-violet-950/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-violet-500/10 hover:bg-violet-500/30 text-violet-300 border-violet-500/20 shadow-violet-950/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Strange Attractors"
                subtitle="Manifolds Caóticos 3D . Integração RK4 . Espectro de Lyapunov"
                titleClassName="text-violet-100"
                subtitleClassName="text-violet-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-violet-200/40 text-center px-4">
                Arraste com o mouse para orbitar em 3D . Role para zoom . Clique em &quot;Borboleta&quot; para disparar divergência de Lyapunov
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <AttractorControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onReset={reset}
                onButterflyBurst={triggerButterflyBurst}
            />
        </div>
    );
};
