"use client";

import React from 'react';
import { Zap, Type, Palette, Power } from 'lucide-react';

interface Props {
    text: string; setText: (s: string) => void;
    color: string; setColor: (s: string) => void;
    isOn: boolean; setIsOn: (b: boolean) => void;
    flicker: boolean; setFlicker: (b: boolean) => void;
    fontMode: 'modern' | 'retro'; setFontMode: (m: 'modern' | 'retro') => void;
}

export const NeonControls = ({ text, setText, color, setColor, isOn, setIsOn, flicker, setFlicker, fontMode, setFontMode }: Props) => {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-20">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50">

                {/* Input de Texto */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-white/5 p-2 rounded-lg"><Type size={18} className="text-slate-400" /></div>
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value.toUpperCase().slice(0, 12))}
                        placeholder="DIGITE..."
                        className="flex-1 bg-transparent border-b border-white/10 py-2 text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-white/30 tracking-widest text-center"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Controles de Cor */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <Palette size={14} /> Cor do Gás
                        </label>
                        <div className="flex gap-2">
                            {['#d946ef', '#06b6d4', '#22c55e', '#ef4444', '#eab308', '#ffffff'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: c, boxShadow: color === c ? `0 0 10px ${c}` : 'none' }}
                                />
                            ))}
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 opacity-0 absolute cursor-pointer" // Hidden but accessible color picker
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-col gap-3 justify-center">
                        <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                            <span className="text-xs font-bold text-slate-300 uppercase ml-2">Energia</span>
                            <button
                                onClick={() => setIsOn(!isOn)}
                                className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${isOn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                            >
                                <Power size={14} /> {isOn ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                            <span className="text-xs font-bold text-slate-300 uppercase ml-2">Modo Flicker</span>
                            <button
                                onClick={() => setFlicker(!flicker)}
                                className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${flicker ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}
                            >
                                <Zap size={14} /> {flicker ? 'ATIVO' : 'INATIVO'}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Font Switcher (Extra) */}
                <div className="mt-6 flex justify-center gap-4 border-t border-white/5 pt-4">
                    <button onClick={() => setFontMode('modern')} className={`text-xs font-bold px-3 py-1 rounded transition-colors ${fontMode === 'modern' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>MODERNA</button>
                    <button onClick={() => setFontMode('retro')} className={`text-xs font-bold px-3 py-1 rounded transition-colors ${fontMode === 'retro' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>RETRO</button>
                </div>

            </div>
        </div>
    );
};