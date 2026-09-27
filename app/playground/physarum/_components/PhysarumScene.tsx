"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, Plus } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { usePhysarumSimulation } from '../_hooks/usePhysarumSimulation';
import { PhysarumControls } from './PhysarumControls';
import { DEFAULT_PHYSARUM_CONFIG, PhysarumConfig } from '../_utils/types';

export const PhysarumScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<PhysarumConfig>(DEFAULT_PHYSARUM_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset, addFoodNode } = usePhysarumSimulation(canvasRef, containerRef, config);

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
                    onClick={() => addFoodNode()}
                    aria-label="Plantar novo ponto de alimento/nutriente"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-lime-500/10 hover:bg-lime-500/30 text-lime-300 border-lime-500/20 shadow-lime-950/20"
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">ALIMENTO</span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Reiniciar colônia de fungo"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-lime-500/10 hover:bg-lime-500/30 text-lime-300 border-lime-500/20 shadow-lime-950/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-lime-500/10 hover:bg-lime-500/30 text-lime-300 border-lime-500/20 shadow-lime-950/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Physarum Polycephalum"
                subtitle="Bio-Mimetismo . Redes Biológicas de Transporte"
                titleClassName="text-lime-100"
                subtitleClassName="text-lime-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30 text-center px-4">
                Botão esquerdo planta nutrientes de açúcar . Botão direito espalha repelente salino
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <PhysarumControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onReset={reset}
                onAddFood={() => addFoodNode()}
            />
        </div>
    );
};
