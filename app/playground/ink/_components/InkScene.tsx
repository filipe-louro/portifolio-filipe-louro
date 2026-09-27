"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, Droplets, Wind, Waves } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useInkSimulation } from '../_hooks/useInkSimulation';
import { InkControls } from './InkControls';
import { DEFAULT_INK_CONFIG, InkConfig } from '../_utils/types';

export const InkScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<InkConfig>(DEFAULT_INK_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset } = useInkSimulation(canvasRef, containerRef, config);

    const toggleTool = () => {
        const tools: InkConfig['tool'][] = ['drop', 'stream', 'stir'];
        const next = tools[(tools.indexOf(config.tool) + 1) % tools.length];
        setConfig((p) => ({ ...p, tool: next }));
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
                    onClick={toggleTool}
                    aria-label="Alternar ferramenta de tinta"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-pink-500/10 hover:bg-pink-500/30 text-pink-300 border-pink-500/20 shadow-pink-950/20"
                >
                    {config.tool === 'drop' && <Droplets size={14} />}
                    {config.tool === 'stream' && <Wind size={14} />}
                    {config.tool === 'stir' && <Waves size={14} />}
                    <span className="hidden sm:inline">
                        {config.tool === 'drop' ? 'GOTA' : config.tool === 'stream' ? 'JATO' : 'MISTURAR'}
                    </span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Limpar tanque de água"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-pink-500/10 hover:bg-pink-500/30 text-pink-300 border-pink-500/20 shadow-pink-950/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-pink-500/10 hover:bg-pink-500/30 text-pink-300 border-pink-500/20 shadow-pink-950/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Ink in Water"
                subtitle="Plumas de Rayleigh-Taylor . Filamentos de Kelvin-Helmholtz"
                titleClassName="text-pink-100"
                subtitleClassName="text-pink-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-pink-200/40 text-center px-4">
                {config.tool === 'drop' && 'Clique para pingar gotas de tinta . Observe a bifurcação em cogumelo'}
                {config.tool === 'stream' && 'Arraste para injetar fluxo contínuo de pigmento hidrodinâmico'}
                {config.tool === 'stir' && 'Arraste rapidamente para gerar correntes e redemoinhos no tanque'}
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <InkControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onReset={reset}
            />
        </div>
    );
};
