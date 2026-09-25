"use client";

import React from 'react';
import { RotateCcw, Scissors, Hand } from 'lucide-react';
import { ClothConfig, PinMode, ToolMode } from '../_utils/types';

interface Props {
    config: ClothConfig;
    setConfig: React.Dispatch<React.SetStateAction<ClothConfig>>;
    show: boolean;
    onReset: () => void;
}

export const ClothControls = ({ config, setConfig, show, onReset }: Props) => {
    return (
        <div
            className={`absolute right-0 md:right-6 top-20 bottom-0 md:bottom-auto md:w-80 w-full transition-all duration-300 z-30 ${
                show
                    ? 'translate-y-0 md:translate-x-0 opacity-100'
                    : 'translate-y-full md:translate-y-0 md:translate-x-[120%] opacity-0 pointer-events-none'
            }`}
        >
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 md:rounded-2xl rounded-t-2xl p-6 h-full md:h-auto md:max-h-[75vh] overflow-y-auto text-white shadow-2xl">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

                {/* Modo da Ferramenta */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-rose-200 uppercase tracking-widest opacity-80 block mb-2">
                        Ferramenta Ativa
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'grab' as ToolMode, label: 'Arrastar', icon: Hand },
                            { id: 'cut' as ToolMode, label: 'Cortar', icon: Scissors },
                        ].map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setConfig((p) => ({ ...p, toolMode: tool.id }))}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                                    config.toolMode === tool.id
                                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                <tool.icon size={14} />
                                {tool.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gravidade */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="gravity" className="text-xs font-bold text-rose-200 uppercase tracking-widest opacity-80">
                            Gravidade
                        </label>
                        <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                            {config.gravity.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="gravity"
                        type="range"
                        min="0.0"
                        max="0.6"
                        step="0.02"
                        value={config.gravity}
                        onChange={(e) => setConfig((p) => ({ ...p, gravity: parseFloat(e.target.value) }))}
                        className="w-full accent-rose-400"
                    />
                </div>

                {/* Força do Vento */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="wind" className="text-xs font-bold text-rose-200 uppercase tracking-widest opacity-80">
                            Força do Vento
                        </label>
                        <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                            {config.windStrength.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="wind"
                        type="range"
                        min="0.0"
                        max="0.5"
                        step="0.02"
                        value={config.windStrength}
                        onChange={(e) => setConfig((p) => ({ ...p, windStrength: parseFloat(e.target.value) }))}
                        className="w-full accent-rose-400"
                    />
                </div>

                {/* Rigidez (Iterações de Relaxamento) */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="stiffness" className="text-xs font-bold text-rose-200 uppercase tracking-widest opacity-80">
                            Rigidez do Tecido
                        </label>
                        <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                            {config.solverIterations}x
                        </span>
                    </div>
                    <input
                        id="stiffness"
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={config.solverIterations}
                        onChange={(e) => setConfig((p) => ({ ...p, solverIterations: parseInt(e.target.value, 10) }))}
                        className="w-full accent-rose-400"
                    />
                </div>

                {/* Modos de Fixação (Pin Modes) */}
                <div className="my-4 border-t border-white/10 pt-4">
                    <label className="text-xs font-bold text-rose-200 uppercase tracking-widest opacity-80 block mb-2">
                        Pontos de Apoio
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'top-rod' as PinMode, label: 'Vara Contínua' },
                            { id: 'two-corners' as PinMode, label: '2 Cantos' },
                            { id: 'four-corners' as PinMode, label: '4 Cantos' },
                            { id: 'draped' as PinMode, label: 'Franzido' },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => setConfig((p) => ({ ...p, pinMode: mode.id }))}
                                className={`py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all text-center ${
                                    config.pinMode === mode.id
                                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rasgo por Tensão */}
                <div className="my-4 border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-200 uppercase tracking-widest opacity-80">
                        Rasgo por Tensão
                    </span>
                    <button
                        onClick={() => setConfig((p) => ({ ...p, tearable: !p.tearable }))}
                        className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                            config.tearable
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-white/5 text-slate-500 border-white/10'
                        }`}
                    >
                        {config.tearable ? 'ATIVO' : 'DESATIVADO'}
                    </button>
                </div>

                {/* Botão de Reset */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Restaurar Tecido
                    </button>
                </div>
            </div>
        </div>
    );
};
