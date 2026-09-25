"use client";

import React, { useRef, useState } from 'react';
import { useMatrixWarp } from '../_hooks/useMatrixWarp';
import { Settings2, X } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';

const PRESET_COLORS = [
    { name: 'Matrix Green', val: '#00ff00' },
    { name: 'Cyber Blue', val: '#00e0ff' },
    { name: 'System Red', val: '#ff0000' },
    { name: 'Golden Source', val: '#ffd700' }
];

export const MatrixScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [color, setColor] = useState('#00ff00');
    const [showControls, setShowControls] = useState(false);

    useMatrixWarp(canvasRef, containerRef, color);

    const isCustomColor = !PRESET_COLORS.some((c) => c.val === color);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden font-sans select-none">
            {/* Container e Canvas */}
            <div ref={containerRef} className="absolute inset-0">
                <canvas ref={canvasRef} className="block" />
            </div>

            {/* Z2 — ações primárias */}
            <button
                onClick={() => setShowControls(!showControls)}
                className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 z-[100] cursor-pointer shadow-lg ${
                    showControls
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-green-500/10 hover:bg-green-500/30 text-green-300 border-green-500/20 shadow-green-900/20'
                }`}
                aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
            >
                {showControls ? <X size={20} /> : <Settings2 size={20} />}
            </button>

            {/* Z3 — painel de configuração */}
            <div className={`
                absolute top-20 right-6 w-80 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 transform origin-top-right z-[90]
                ${showControls ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'}
            `}>
                <div className="space-y-4">
                    <div className="space-y-3 pointer-events-auto">
                        <label className="text-xs font-bold uppercase tracking-widest text-green-200 opacity-80 block">
                            Cor da Chuva
                        </label>
                        <div className="grid grid-cols-5 gap-2 items-center">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setColor(c.val)}
                                    aria-label={`Cor ${c.name}`}
                                    className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-105 pointer-events-auto ${color === c.val ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    style={{
                                        backgroundColor: c.val,
                                        boxShadow: color === c.val ? `0 0 12px ${c.val}` : 'none'
                                    }}
                                    title={c.name}
                                />
                            ))}

                            <div
                                className={`relative w-full aspect-square rounded-md border-2 overflow-hidden transition-all hover:scale-105 ${isCustomColor ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                style={{
                                    background: isCustomColor
                                        ? color
                                        : 'conic-gradient(#ff0040, #ffd700, #00ff00, #00e0ff, #4000ff, #ff00c0, #ff0040)',
                                    boxShadow: isCustomColor ? `0 0 12px ${color}` : 'none'
                                }}
                                title="Cor personalizada (RGB completo)"
                            >
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    aria-label="Escolher cor personalizada da chuva"
                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer pointer-events-auto"
                                />
                            </div>
                        </div>
                        <div className="font-mono text-[10px] tracking-widest text-white/40 uppercase text-right">
                            {color}
                        </div>
                    </div>
                </div>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Matrix Rain"
                subtitle="Chuva Digital . Código Procedural"
                titleClassName="text-green-100"
                subtitleClassName="text-green-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30">
                Chuva procedural com profundidade 3D
            </div>

            {/* Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10" />
        </div>
    );
};