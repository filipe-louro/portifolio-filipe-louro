"use client";

import React from 'react';
import { Volume2, VolumeX, Shuffle, RotateCcw, Circle, Square } from 'lucide-react';
import { ChladniConfig, PlateShape } from '../_utils/types';
import { CHLADNI_PRESETS } from '../_utils/presets';

interface Props {
    config: ChladniConfig;
    setConfig: React.Dispatch<React.SetStateAction<ChladniConfig>>;
    show: boolean;
    onScatter: () => void;
    onReset: () => void;
}

export const ChladniControls = ({ config, setConfig, show, onScatter, onReset }: Props) => {
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

                {/* Modos m e n */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="mode-m" className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80">
                            Modo M (Harmônico X)
                        </label>
                        <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                            {config.m}
                        </span>
                    </div>
                    <input
                        id="mode-m"
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={config.m}
                        onChange={(e) => setConfig((p) => ({ ...p, m: parseInt(e.target.value, 10) }))}
                        className="w-full accent-amber-400"
                    />
                </div>

                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="mode-n" className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80">
                            Modo N (Harmônico Y)
                        </label>
                        <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                            {config.n}
                        </span>
                    </div>
                    <input
                        id="mode-n"
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={config.n}
                        onChange={(e) => setConfig((p) => ({ ...p, n: parseInt(e.target.value, 10) }))}
                        className="w-full accent-amber-400"
                    />
                </div>

                {/* Intensidade de Vibração */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="intensity" className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80">
                            Intensidade da Vibração
                        </label>
                        <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                            {config.intensity.toFixed(1)}x
                        </span>
                    </div>
                    <input
                        id="intensity"
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.1"
                        value={config.intensity}
                        onChange={(e) => setConfig((p) => ({ ...p, intensity: parseFloat(e.target.value) }))}
                        className="w-full accent-amber-400"
                    />
                </div>

                {/* Densidade de Partículas */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="particle-count" className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80">
                            Densidade de Partículas
                        </label>
                        <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                            {config.particleCount.toLocaleString()}
                        </span>
                    </div>
                    <input
                        id="particle-count"
                        type="range"
                        min="4000"
                        max="28000"
                        step="2000"
                        value={config.particleCount}
                        onChange={(e) => setConfig((p) => ({ ...p, particleCount: parseInt(e.target.value, 10) }))}
                        className="w-full accent-amber-400"
                    />
                </div>

                {/* Geometria da Placa */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80 block mb-2">
                        Geometria da Placa
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['square', 'circle'] as PlateShape[]).map((shape) => (
                            <button
                                key={shape}
                                onClick={() => setConfig((p) => ({ ...p, shape }))}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                                    config.shape === shape
                                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                {shape === 'square' ? <Square size={14} /> : <Circle size={14} />}
                                {shape === 'square' ? 'Quadrada' : 'Circular'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Síntese Sonora */}
                <div className="my-4 border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80 flex items-center gap-2">
                            {config.soundEnabled ? <Volume2 size={14} className="text-amber-400" /> : <VolumeX size={14} />}
                            Campânula Acústica
                        </label>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-all ${
                                config.soundEnabled
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.soundEnabled ? 'ÁUDIO ON' : 'MUTED'}
                        </button>
                    </div>
                    {config.soundEnabled && (
                        <div className="mt-2">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                                <span>Volume</span>
                                <span className="text-amber-400">{config.soundVolume}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={config.soundVolume}
                                onChange={(e) => setConfig((p) => ({ ...p, soundVolume: parseInt(e.target.value, 10) }))}
                                className="w-full accent-amber-400"
                            />
                        </div>
                    )}
                </div>

                {/* Presets */}
                <div className="my-4 border-t border-white/10 pt-4">
                    <label className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80 block mb-2">
                        Padrões Harmônicos
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {CHLADNI_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => setConfig((p) => ({ ...p, m: preset.m, n: preset.n, shape: preset.shape }))}
                                className={`p-2 rounded text-left border transition-all ${
                                    config.m === preset.m && config.n === preset.n && config.shape === preset.shape
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                                }`}
                            >
                                <div className="text-[11px] font-bold truncate">{preset.name}</div>
                                <div className="text-[9px] font-mono text-slate-400">
                                    m:{preset.m} n:{preset.n} ({preset.shape === 'square' ? 'quad' : 'circ'})
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ações */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                    <button
                        onClick={onScatter}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <Shuffle size={14} /> Espalhar
                    </button>
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Resetar
                    </button>
                </div>
            </div>
        </div>
    );
};
