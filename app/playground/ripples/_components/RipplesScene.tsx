"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCcw, Waves, Radio, Square } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useRipplesSimulation } from '../_hooks/useRipplesSimulation';
import { RipplesControls } from './RipplesControls';
import { DEFAULT_RIPPLES_CONFIG, RipplesConfig } from '../_utils/types';

export const RipplesScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<RipplesConfig>(DEFAULT_RIPPLES_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { reset } = useRipplesSimulation(canvasRef, containerRef, config);

    const toggleTool = () => {
        const tools: RipplesConfig['tool'][] = ['ripple', 'emitter', 'wall'];
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
                    aria-label="Alternar ferramenta de onda"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all shadow-lg active:scale-90 bg-sky-500/10 hover:bg-sky-500/30 text-sky-300 border-sky-500/20 shadow-sky-950/20"
                >
                    {config.tool === 'ripple' && <Waves size={14} />}
                    {config.tool === 'emitter' && <Radio size={14} />}
                    {config.tool === 'wall' && <Square size={14} />}
                    <span className="hidden sm:inline">
                        {config.tool === 'ripple' ? 'ONDAS' : config.tool === 'emitter' ? 'EMISSOR' : 'BARREIRA'}
                    </span>
                </button>
                <button
                    onClick={reset}
                    aria-label="Restaurar tanque de ondas"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-sky-500/10 hover:bg-sky-500/30 text-sky-300 border-sky-500/20 shadow-sky-950/20"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-sky-500/10 hover:bg-sky-500/30 text-sky-300 border-sky-500/20 shadow-sky-950/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Wave Ripple Tank"
                subtitle="Equação de Onda 2D . Cáusticas Ópticas . Efeito Doppler"
                titleClassName="text-sky-100"
                subtitleClassName="text-sky-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-sky-200/40 text-center px-4">
                {config.tool === 'ripple' && 'Clique ou arraste para excitar ondas e gerar cáusticas subaquáticas'}
                {config.tool === 'emitter' && 'Arraste os nós de emissão para observar a compressão Doppler de frentes de onda'}
                {config.tool === 'wall' && 'Desenhe barreiras refletoras para difratar a propagação das ondas'}
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <RipplesControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onReset={reset}
            />
        </div>
    );
};
