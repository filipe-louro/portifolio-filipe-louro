"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, Scissors, Hand } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useClothSimulation } from '../_hooks/useClothSimulation';
import { ClothControls } from './ClothControls';
import { DEFAULT_CLOTH_CONFIG, ClothConfig } from '../_utils/types';

export const ClothScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<ClothConfig>(DEFAULT_CLOTH_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset } = useClothSimulation(canvasRef, containerRef, config);

    const toggleTool = () => {
        setConfig((p) => ({ ...p, toolMode: p.toolMode === 'grab' ? 'cut' : 'grab' }));
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden font-sans select-none">
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full block ${config.toolMode === 'cut' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
                style={{ touchAction: 'none' }}
            />

            {/* Z2 — ações primárias */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                <button
                    onClick={toggleTool}
                    aria-label={config.toolMode === 'grab' ? 'Trocar para ferramenta tesoura' : 'Trocar para ferramenta mão'}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 ${
                        config.toolMode === 'cut'
                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-rose-900/20'
                            : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/70'
                    }`}
                >
                    {config.toolMode === 'cut' ? <Scissors size={16} /> : <Hand size={16} />}
                    <span>{config.toolMode === 'cut' ? 'CORTAR' : 'MOVER'}</span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Restaurar tecido original"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-300 border-rose-500/20 shadow-rose-900/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-rose-500/10 hover:bg-rose-500/30 text-rose-300 border-rose-500/20 shadow-rose-900/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Verlet Cloth"
                subtitle="Física Têxtil . Integração Verlet"
                titleClassName="text-rose-100"
                subtitleClassName="text-rose-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30 text-center px-4">
                Botão esquerdo arrasta . Botão direito corta os fios da malha
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <ClothControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onReset={reset}
            />
        </div>
    );
};
