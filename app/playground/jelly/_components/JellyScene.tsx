"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, Sparkles } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useJellySimulation } from '../_hooks/useJellySimulation';
import { JellyControls } from './JellyControls';
import { DEFAULT_JELLY_CONFIG, JellyConfig } from '../_utils/types';

export const JellyScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<JellyConfig>(DEFAULT_JELLY_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset, launchJelly } = useJellySimulation(canvasRef, containerRef, config);

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
                    onClick={launchJelly}
                    aria-label="Arremessar gelatina com impulso"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/20 shadow-emerald-950/20"
                >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">IMPULSO</span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Restaurar posição e forma original"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/20 shadow-emerald-950/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/20 shadow-emerald-950/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Soft Jelly"
                subtitle="Mecânica Deformável . Pressão Hidrostática"
                titleClassName="text-emerald-100"
                subtitleClassName="text-emerald-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30 text-center px-4 whitespace-nowrap truncate max-w-[90vw]">
                Arraste a gelatina . Pressione para comprimir . Botão direito empurra
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
                <JellyControls
                    config={config}
                    setConfig={setConfig}
                    show={showControls}
                    onReset={reset}
                    onLaunch={launchJelly}
                />
            </div>
        </div>
    );
};
