"use client";

import React from 'react';
import { RotateCcw, Activity } from 'lucide-react';
import {
    SandpileConfig,
    SandPresetName,
    SANDPILE_PRESETS,
    SandpileMode,
} from '../_utils/types';

interface Props {
    config: SandpileConfig;
    setConfig: React.Dispatch<React.SetStateAction<SandpileConfig>>;
    show: boolean;
    onReset: () => void;
    onEarthquake: () => void;
}

export const SandpileControls = ({
    config,
    setConfig,
    show,
    onReset,
    onEarthquake,
}: Props) => {
    const handlePresetChange = (key: SandPresetName) => {
        const p = SANDPILE_PRESETS[key];
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

                {/* Modo da Simulação */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80 block mb-2">
                        Mecanismo Físico
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'granular' as SandpileMode, label: 'Granular / Dunas' },
                            { id: 'abelian' as SandpileMode, label: 'Fractal Abeliano' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setConfig((p) => ({ ...p, mode: m.id }))}
                                className={`py-2 px-2.5 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all text-center truncate ${
                                    config.mode === m.id
                                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Presets */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80 block mb-2">
                        Configurações Granulares
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(SANDPILE_PRESETS) as SandPresetName[]).map((key) => {
                            const p = SANDPILE_PRESETS[key];
                            const isSelected = config.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all text-left truncate ${
                                        isSelected
                                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {p.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Taxa de Despejo */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="flow" className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80">
                            Fluxo de Despejo
                        </label>
                        <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                            {config.flowRate} grãos/f
                        </span>
                    </div>
                    <input
                        id="flow"
                        type="range"
                        min="1"
                        max="24"
                        step="1"
                        value={config.flowRate}
                        onChange={(e) => setConfig((p) => ({ ...p, flowRate: parseInt(e.target.value, 10) }))}
                        className="w-full accent-amber-400"
                    />
                </div>

                {/* Raio do Funil */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="funnel" className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80">
                            Abertura do Funil
                        </label>
                        <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                            {config.funnelSize}px
                        </span>
                    </div>
                    <input
                        id="funnel"
                        type="range"
                        min="1"
                        max="8"
                        step="1"
                        value={config.funnelSize}
                        onChange={(e) => setConfig((p) => ({ ...p, funnelSize: parseInt(e.target.value, 10) }))}
                        className="w-full accent-amber-400"
                    />
                </div>

                {/* Toggles */}
                <div className="my-4 border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-80">
                            Brilho de Dissipação Cinética
                        </span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, kineticGlow: !p.kineticGlow }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.kineticGlow
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.kineticGlow ? 'ATIVO' : 'DESATIVADO'}
                        </button>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={onEarthquake}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <Activity size={14} /> Provocar Terremoto
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Limpar Grãos
                    </button>
                </div>
            </div>
        </div>
    );
};
