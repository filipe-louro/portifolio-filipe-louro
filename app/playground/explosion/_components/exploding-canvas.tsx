"use client";

import React, { useRef, useState } from 'react';
import { useExplosion } from '../_hooks/use-explosion';
import { Settings2, X } from 'lucide-react';
import { LabCaption } from '@/components/lab-caption';

const PRESET_COLORS = ['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308'];

export function ExplodingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [text, setText] = useState("LOURO");
    const [color, setColor] = useState("#ffffff");
    const [showControls, setShowControls] = useState(false);

    useExplosion(canvasRef, text, color);

    const isCustomColor = !PRESET_COLORS.includes(color);

    return (
        <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden select-none z-0">

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-0"
            />

            {/* Z2 — ações primárias */}
            <button
                onClick={() => setShowControls(!showControls)}
                className="absolute top-6 right-6 p-3 bg-yellow-500/10 hover:bg-yellow-500/30 text-yellow-300 backdrop-blur-md rounded-full transition-all active:scale-90 z-[100] border border-yellow-500/20 shadow-lg shadow-yellow-900/20 pointer-events-auto cursor-pointer"
                aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
            >
                {showControls ? <X size={20} /> : <Settings2 size={20} />}
            </button>

            {/* Z3 — painel de configuração */}
            <div className={`
                absolute top-20 right-6 w-80 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 transform origin-top-right z-[90]
                ${showControls ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'}
            `}>
                <div className="space-y-6">
                    <div className="space-y-3 pointer-events-auto">
                        <label htmlFor="explosion-text" className="text-xs font-bold uppercase tracking-widest text-yellow-200 opacity-80 block">Texto</label>
                        <input
                            id="explosion-text"
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value.toUpperCase().slice(0, 12))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white font-bold text-center focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all uppercase font-mono tracking-widest placeholder:text-slate-600 pointer-events-auto"
                            placeholder="DIGITE..."
                        />
                    </div>

                    <div className="space-y-3 pointer-events-auto">
                        <label className="text-xs font-bold uppercase tracking-widest text-yellow-200 opacity-80 block">Cor das Partículas</label>
                        <div className="grid grid-cols-6 gap-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    aria-label={`Cor ${c}`}
                                    className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-105 pointer-events-auto ${color === c ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}

                            <div className={`relative w-full aspect-square rounded-md border-2 overflow-hidden transition-all hover:scale-105 ${isCustomColor ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    aria-label="Escolher cor personalizada das partículas"
                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer p-0 border-0 pointer-events-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference text-white/50">
                                    <Settings2 size={16} />
                                </div>
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
                title="Particle Text"
                subtitle="Física de Pixels . Reconstrução em Tempo Real"
                titleClassName="text-yellow-100"
                subtitleClassName="text-yellow-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30">
                Mova o cursor para explodir as partículas
            </div>
        </div>
    );
}
