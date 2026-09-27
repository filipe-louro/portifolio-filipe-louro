"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, Rocket } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useGalaxySimulation } from '../_hooks/useGalaxySimulation';
import { GalaxyControls } from './GalaxyControls';
import { DEFAULT_GALAXY_CONFIG, GalaxyConfig } from '../_utils/types';

export const GalaxyScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<GalaxyConfig>(DEFAULT_GALAXY_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset, launchRogueBlackHole } = useGalaxySimulation(canvasRef, containerRef, config);

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
                    onClick={launchRogueBlackHole}
                    aria-label="Disparar buraco negro errante"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-red-500/10 hover:bg-red-500/30 text-red-300 border-red-500/20 shadow-red-950/20"
                >
                    <Rocket size={14} />
                    <span className="hidden sm:inline">ERRANTE</span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Restaurar colisão galáctica"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 border-blue-500/20 shadow-blue-950/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 border-blue-500/20 shadow-blue-950/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Galactic Collision"
                subtitle="N-Corpos Simplético . Caudas de Maré . Halo de Matéria Escura"
                titleClassName="text-blue-100"
                subtitleClassName="text-blue-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-blue-200/40 text-center px-4">
                Arraste com o mouse para orbitar em 3D . Role para zoom . Clique em &quot;Errante&quot; para arremessar um 3º buraco negro
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <GalaxyControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onReset={reset}
                onLaunchRogue={launchRogueBlackHole}
            />
        </div>
    );
};
