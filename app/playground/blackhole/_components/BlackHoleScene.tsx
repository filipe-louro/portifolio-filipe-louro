"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Sliders } from 'lucide-react';
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

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center font-sans"
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
            <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label="Alternar painel de configurações"
                    className={cn(
                        'p-3 rounded-full backdrop-blur-md border transition-all active:scale-90',
                        showControls
                            ? 'bg-orange-500/25 text-orange-200 border-orange-500/50 shadow-lg shadow-orange-500/10'
                            : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border-orange-500/20'
                    )}
                >
                    <Sliders size={18} />
                </button>
            </div>

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