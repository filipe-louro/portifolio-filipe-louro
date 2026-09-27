"use client";

import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { JellyConfig, JellyPresetName, JELLY_PRESETS } from '../_utils/types';

interface Props {
    config: JellyConfig;
    setConfig: React.Dispatch<React.SetStateAction<JellyConfig>>;
    show: boolean;
    onReset: () => void;
    onLaunch: () => void;
}

export const JellyControls = ({ config, setConfig, show, onReset, onLaunch }: Props) => {
    const handlePresetChange = (key: JellyPresetName) => {
        const p = JELLY_PRESETS[key];
        setConfig((prev) => ({
            ...prev,
            ...p.config,
            preset: key,
        }));
    };

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

                {/* Presets */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-emerald-200 uppercase tracking-widest opacity-80 block mb-2">
                        Presets Físicos
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(JELLY_PRESETS) as JellyPresetName[]).map((key) => {
                            const p = JELLY_PRESETS[key];
                            const isSelected = config.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all text-left truncate ${
                                        isSelected
                                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {p.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Pressão Interna */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="pressure" className="text-xs font-bold text-emerald-200 uppercase tracking-widest opacity-80">
                            Pressão de Volume
                        </label>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                            {config.pressure.toFixed(2)}x
                        </span>
                    </div>
                    <input
                        id="pressure"
                        type="range"
                        min="0.3"
                        max="3.0"
                        step="0.05"
                        value={config.pressure}
                        onChange={(e) => setConfig((p) => ({ ...p, pressure: parseFloat(e.target.value) }))}
                        className="w-full accent-emerald-400"
                    />
                </div>

                {/* Rigidez Estrutural */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="stiffness" className="text-xs font-bold text-emerald-200 uppercase tracking-widest opacity-80">
                            Elasticidade da Malha
                        </label>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                            {(config.stiffness * 100).toFixed(0)}%
                        </span>
                    </div>
                    <input
                        id="stiffness"
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.02"
                        value={config.stiffness}
                        onChange={(e) => setConfig((p) => ({ ...p, stiffness: parseFloat(e.target.value) }))}
                        className="w-full accent-emerald-400"
                    />
                </div>

                {/* Amortecimento */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="damping" className="text-xs font-bold text-emerald-200 uppercase tracking-widest opacity-80">
                            Amortecimento / Jiggle
                        </label>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                            {config.damping.toFixed(3)}
                        </span>
                    </div>
                    <input
                        id="damping"
                        type="range"
                        min="0.90"
                        max="0.998"
                        step="0.002"
                        value={config.damping}
                        onChange={(e) => setConfig((p) => ({ ...p, damping: parseFloat(e.target.value) }))}
                        className="w-full accent-emerald-400"
                    />
                </div>

                {/* Gravidade */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="gravity" className="text-xs font-bold text-emerald-200 uppercase tracking-widest opacity-80">
                            Força Gravitacional
                        </label>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                            {config.gravity.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="gravity"
                        type="range"
                        min="-0.3"
                        max="0.7"
                        step="0.02"
                        value={config.gravity}
                        onChange={(e) => setConfig((p) => ({ ...p, gravity: parseFloat(e.target.value) }))}
                        className="w-full accent-emerald-400"
                    />
                </div>

                {/* Raio do Corpo */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="radius" className="text-xs font-bold text-emerald-200 uppercase tracking-widest opacity-80">
                            Raio do Corpo
                        </label>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                            {config.radius}px
                        </span>
                    </div>
                    <input
                        id="radius"
                        type="range"
                        min="70"
                        max="160"
                        step="5"
                        value={config.radius}
                        onChange={(e) => setConfig((p) => ({ ...p, radius: parseInt(e.target.value, 10) }))}
                        className="w-full accent-emerald-400"
                    />
                </div>

                {/* Toggles */}
                <div className="my-4 border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest opacity-80">
                            Esqueleto de Molas
                        </span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, showSkeleton: !p.showSkeleton }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.showSkeleton
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.showSkeleton ? 'EXIBIR' : 'OCULTAR'}
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest opacity-80">
                            Obstáculos Físicos
                        </span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, showObstacles: !p.showObstacles }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.showObstacles
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.showObstacles ? 'ATIVOS' : 'INATIVOS'}
                        </button>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={onLaunch}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <Sparkles size={14} /> Arremessar Gelatina
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Restaurar Posição
                    </button>
                </div>
            </div>
        </div>
    );
};
