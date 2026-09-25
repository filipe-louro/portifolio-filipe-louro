"use client";

import React, { useRef, useState } from 'react';
import { Play, Pause, Settings2, X, Volume2, VolumeX, Shuffle } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useChladni } from '../_hooks/useChladni';
import { ChladniControls } from './ChladniControls';
import { DEFAULT_CHLADNI_CONFIG, ChladniConfig } from '../_utils/types';

export const ChladniScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<ChladniConfig>(DEFAULT_CHLADNI_CONFIG);
    const [isPaused, setIsPaused] = useState(false);
    const [showControls, setShowControls] = useState(false);

    const { scatter } = useChladni(canvasRef, containerRef, config, isPaused);

    const handleReset = () => {
        setConfig(DEFAULT_CHLADNI_CONFIG);
        scatter();
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
                    onClick={() => setConfig((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
                    aria-label={config.soundEnabled ? 'Silenciar tom acústico' : 'Ativar tom acústico'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        config.soundEnabled
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30 shadow-amber-900/20'
                            : 'bg-white/10 hover:bg-white/20 text-white/40 border-white/10'
                    }`}
                >
                    {config.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button
                    onClick={scatter}
                    aria-label="Dispersar partículas aleatoriamente"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 border-amber-500/20 shadow-amber-900/20"
                >
                    <Shuffle size={20} />
                </button>
                <button
                    onClick={() => setIsPaused((prev) => !prev)}
                    aria-label={isPaused ? 'Retomar vibração' : 'Pausar vibração'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        isPaused
                            ? 'bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border-amber-500/40 shadow-amber-900/20'
                            : 'bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 border-amber-500/20 shadow-amber-900/20'
                    }`}
                >
                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 border-amber-500/20 shadow-amber-900/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Chladni Patterns"
                subtitle="Ressonância Acústica . Ondas Estacionárias"
                titleClassName="text-amber-100"
                subtitleClassName="text-amber-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30 text-center px-4">
                Arraste para agitar partículas . Altere as frequências m e n
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <ChladniControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onScatter={scatter}
                onReset={handleReset}
            />
        </div>
    );
};
