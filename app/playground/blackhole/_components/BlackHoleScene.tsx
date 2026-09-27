"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Sliders, RotateCcw, Play, Pause, X } from 'lucide-react';
import { useWebGLBlackHole } from '../_hooks/useWebGLBlackHole';
import { BlackHoleControls } from './BlackHoleControls';
import { BlackHoleConfig, DEFAULT_CONFIG } from '../_utils/types';
import { LabCaption } from '@/components/lab-caption';
import { cn } from '@/lib/utils';

export const BlackHoleScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<BlackHoleConfig>(DEFAULT_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { error } = useWebGLBlackHole(canvasRef, config);

    const handleResetConfig = useCallback(() => {
        setConfig(DEFAULT_CONFIG);
    }, []);

    const toggleAutoRotate = useCallback(() => {
        setConfig((prev) => ({ ...prev, autoRotate: !prev.autoRotate }));
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center font-sans select-none"
        >
            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 text-red-300 bg-slate-900/90 border border-red-500/30 p-6 rounded-2xl z-50 backdrop-blur-xl max-w-lg text-center shadow-2xl">
                    <p className="font-bold text-sm mb-2 text-red-400">{error}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        No <strong>Brave</strong>: desative a proteção do <em>Shields</em> (ícone do leão na URL) ou ative a aceleração gráfica em <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">brave://settings/system</code> e <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">brave://flags/#ignore-gpu-blocklist</code>.
                    </p>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="w-full h-full block"
            />

            {/* Z1 — Identidade */}
            <LabCaption
                title="GARGANTUA"
                subtitle="Simulação Métrica . Classe Supermassiva"
                titleClassName="text-orange-100"
                subtitleClassName="text-orange-200"
            />

            {/* Z2 — Ações primárias */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
                <button
                    type="button"
                    onClick={toggleAutoRotate}
                    aria-label={config.autoRotate ? 'Pausar órbita da câmera' : 'Ativar órbita da câmera'}
                    className={cn(
                        'p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg',
                        config.autoRotate
                            ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border-orange-500/40 shadow-orange-950/20'
                            : 'bg-white/10 hover:bg-white/20 text-white/50 border-white/10'
                    )}
                >
                    {config.autoRotate ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                    type="button"
                    onClick={handleResetConfig}
                    aria-label="Redefinir parâmetros do buraco negro"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-300 border-orange-500/20 shadow-orange-950/20"
                >
                    <RotateCcw size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar painel de configurações' : 'Abrir painel de configurações'}
                    className={cn(
                        'p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg',
                        showControls
                            ? 'bg-orange-500/30 text-white border-orange-500/50 shadow-orange-500/20'
                            : 'bg-orange-500/10 hover:bg-orange-500/25 text-orange-300 border-orange-500/20'
                    )}
                >
                    {showControls ? <X size={18} /> : <Sliders size={18} />}
                </button>
            </div>

            {/* Backdrop para fechar controles em telas menores */}
            {showControls && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — Painel de configuração */}
            <BlackHoleControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onResetConfig={handleResetConfig}
            />

            {/* Z4 — Dica/Status */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/30 pointer-events-none select-none z-10 whitespace-nowrap hidden sm:block">
                Métrica Kerr • Raio ISCO r=1.65 • WebGL 2.0
            </div>
        </div>
    );
};