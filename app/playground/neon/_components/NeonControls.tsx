"use client";

import React from 'react';

const PRESET_COLORS = ['#d946ef', '#06b6d4', '#22c55e', '#ef4444', '#eab308'];

interface Props {
    text: string; setText: (s: string) => void;
    color: string; setColor: (s: string) => void;
    flicker: boolean; setFlicker: (b: boolean) => void;
    fontMode: 'modern' | 'retro'; setFontMode: (m: 'modern' | 'retro') => void;
    show: boolean;
}

export const NeonControls = ({ text, setText, color, setColor, flicker, setFlicker, fontMode, setFontMode, show }: Props) => {
    const isCustomColor = !PRESET_COLORS.includes(color);

    return (
        <div className={`
            absolute top-20 right-6 w-80 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 transform origin-top-right z-[90]
            ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'}
        `}>
            <div className="space-y-5">
                {/* Input de Texto */}
                <div className="space-y-2 pointer-events-auto">
                    <label htmlFor="neon-text" className="text-xs font-bold uppercase tracking-widest text-pink-200 opacity-80 block">
                        Texto da Placa
                    </label>
                    <input
                        id="neon-text"
                        value={text}
                        onChange={(e) => setText(e.target.value.toUpperCase().slice(0, 12))}
                        placeholder="DIGITE..."
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-bold text-center focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 uppercase font-mono tracking-widest placeholder:text-slate-600"
                    />
                </div>

                {/* Controles de Cor */}
                <div className="space-y-2 pointer-events-auto">
                    <label className="text-xs font-bold uppercase tracking-widest text-pink-200 opacity-80 block">
                        Cor do Gás
                    </label>
                    <div className="grid grid-cols-6 gap-2 items-center">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                aria-label={`Cor ${c}`}
                                className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-105 pointer-events-auto ${color === c ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 10px ${c}` : 'none' }}
                            />
                        ))}
                        <div className={`relative w-full aspect-square rounded-md border-2 overflow-hidden transition-all hover:scale-105 ${isCustomColor ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                aria-label="Escolher cor personalizada"
                                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer pointer-events-auto"
                            />
                        </div>
                    </div>
                    <div className="font-mono text-[10px] tracking-widest text-white/40 uppercase text-right">
                        {color}
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-3 border-t border-white/10 pointer-events-auto">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-pink-200 opacity-80">Efeito Flicker</span>
                        <button
                            onClick={() => setFlicker(!flicker)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                flicker
                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm shadow-yellow-500/20'
                                    : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                            }`}
                        >
                            {flicker ? 'Ativo' : 'Inativo'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-pink-200 opacity-80">Tipografia</span>
                        <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                            <button
                                onClick={() => setFontMode('modern')}
                                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded transition-all ${
                                    fontMode === 'modern' ? 'bg-pink-500/30 text-pink-200 border border-pink-400/40' : 'text-white/40 hover:text-white'
                                }`}
                            >
                                Moderna
                            </button>
                            <button
                                onClick={() => setFontMode('retro')}
                                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded transition-all ${
                                    fontMode === 'retro' ? 'bg-pink-500/30 text-pink-200 border border-pink-400/40' : 'text-white/40 hover:text-white'
                                }`}
                            >
                                Retrô
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};