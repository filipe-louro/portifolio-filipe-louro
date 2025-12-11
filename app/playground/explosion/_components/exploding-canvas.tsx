"use client";

import React, { useRef, useState } from 'react';
import { useExplosion } from '../_hooks/use-explosion';
import { Settings2, X, MousePointer2 } from 'lucide-react';

export function ExplodingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [text, setText] = useState("LOURO");
    const [color, setColor] = useState("#ffffff");
    const [showControls, setShowControls] = useState(false);

    useExplosion(canvasRef, text, color);

    return (
        // Remove 'pointer-events-none' daqui se tiver, pois bloqueia tudo.
        // Adicionei 'relative' para garantir contexto de empilhamento.
        <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden select-none z-0">

            {/* Canvas Layer - Z-Index 0 */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-0"
            />

            {/* UI Layer - Z-Index 50+ */}

            {/* Dica visual */}
            <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none z-10 px-4 transition-opacity duration-500">
                <p className="text-slate-500 text-sm font-mono tracking-widest uppercase opacity-60 animate-pulse flex items-center justify-center gap-2">
                    <MousePointer2 size={16} /> Mova o cursor
                </p>
            </div>

            {/* Botão de Toggle - Pointer Events Auto é crucial aqui */}
            <button
                onClick={() => setShowControls(!showControls)}
                className="absolute top-24 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-[100] border border-white/10 shadow-lg pointer-events-auto cursor-pointer"
                aria-label="Abrir Configurações"
            >
                {showControls ? <X size={20} /> : <Settings2 size={20} />}
            </button>

            {/* Painel de Controles */}
            <div className={`
                absolute top-36 right-6 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 transform origin-top-right z-[90]
                ${showControls ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'}
            `}>
                <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-wider border-b border-white/5 pb-3">
                    Customização
                </h3>

                <div className="space-y-6">
                    {/* Input de Texto */}
                    <div className="space-y-3 pointer-events-auto">
                        <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Texto</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value.toUpperCase().slice(0, 12))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white font-bold text-center focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all uppercase font-mono tracking-widest placeholder:text-slate-600 pointer-events-auto"
                            placeholder="DIGITE..."
                        />
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-3 pointer-events-auto">
                        <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Cor das Partículas</label>
                        <div className="grid grid-cols-6 gap-2">
                            {['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-105 pointer-events-auto ${color === c ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}

                            <div className={`relative w-full aspect-square rounded-md border-2 overflow-hidden transition-all hover:scale-105 ${!['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308'].includes(color) ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer p-0 border-0 pointer-events-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference text-white/50">
                                    <Settings2 size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}