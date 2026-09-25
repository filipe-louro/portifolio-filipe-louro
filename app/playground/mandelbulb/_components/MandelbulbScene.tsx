"use client";

import React, { useRef, useState } from 'react';
import { Settings2, X, RotateCw, Play, Pause } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';
import { useMandelbulb } from '../_hooks/useMandelbulb';
import { MandelbulbControls } from './MandelbulbControls';
import { DEFAULT_MANDELBULB_CONFIG, MandelbulbConfig } from '../_utils/types';

export const MandelbulbScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useState<MandelbulbConfig>(DEFAULT_MANDELBULB_CONFIG);
    const [showControls, setShowControls] = useState(false);

    const { error, resetCamera } = useMandelbulb(canvasRef, containerRef, config);

    const handleResetConfig = () => {
        setConfig(DEFAULT_MANDELBULB_CONFIG);
        resetCamera();
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden font-sans select-none">
            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 text-red-300 bg-slate-900/90 border border-red-500/30 p-6 rounded-2xl z-50 backdrop-blur-xl max-w-lg text-center shadow-2xl">
                    <p className="font-bold text-sm mb-2 text-red-400">{error}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Verifique se a aceleração por hardware está ativada nas configurações do seu navegador.
                    </p>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
            />

            {/* Z2 — ações primárias */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                <button
                    onClick={() => setConfig((p) => ({ ...p, autoRotate: !p.autoRotate }))}
                    aria-label={config.autoRotate ? 'Pausar rotação contínua' : 'Ativar rotação contínua'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        config.autoRotate
                            ? 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border-violet-500/30 shadow-violet-900/20'
                            : 'bg-white/10 hover:bg-white/20 text-white/40 border-white/10'
                    }`}
                >
                    {config.autoRotate ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                    onClick={resetCamera}
                    aria-label="Recentralizar câmera da órbita"
                    className="p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg bg-violet-500/10 hover:bg-violet-500/30 text-violet-300 border-violet-500/20 shadow-violet-900/20"
                >
                    <RotateCw size={20} />
                </button>
                <button
                    onClick={() => setShowControls((prev) => !prev)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-violet-500/10 hover:bg-violet-500/30 text-violet-300 border-violet-500/20 shadow-violet-900/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Mandelbulb 3D"
                subtitle="Fractal Raymarching . Distância Estimada"
                titleClassName="text-violet-100"
                subtitleClassName="text-violet-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30 text-center px-4">
                Arraste para orbitar em 3D . Role para zoom
            </div>

            {showControls && (
                <div
                    className="fixed inset-0 z-10 bg-black/40 md:hidden"
                    onClick={() => setShowControls(false)}
                    aria-hidden="true"
                />
            )}

            {/* Z3 — painel de configuração */}
            <MandelbulbControls
                config={config}
                setConfig={setConfig}
                show={showControls}
                onResetCamera={resetCamera}
                onResetConfig={handleResetConfig}
            />
        </div>
    );
};
