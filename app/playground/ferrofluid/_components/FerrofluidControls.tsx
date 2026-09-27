"use client";

import React from 'react';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { FerrofluidConfig, FERROFLUID_PRESETS, FerrofluidPreset } from '../_utils/types';

interface Props {
    config: FerrofluidConfig;
    setConfig: React.Dispatch<React.SetStateAction<FerrofluidConfig>>;
    show: boolean;
    onReset: () => void;
    onTogglePolarity: () => void;
}

export const FerrofluidControls = ({
    config,
    setConfig,
    show,
    onReset,
    onTogglePolarity,
}: Props) => {
    const handlePresetChange = (presetKey: FerrofluidPreset) => {
        const p = FERROFLUID_PRESETS[presetKey];
        setConfig((prev) => ({
            ...prev,
            ...p.config,
            preset: presetKey,
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
            <div className="bg-slate-900/85 backdrop-blur-xl border border-cyan-500/20 md:rounded-2xl rounded-t-2xl p-6 h-full md:h-auto md:max-h-[78vh] overflow-y-auto text-white shadow-2xl shadow-cyan-950/40">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

                {/* Presets */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-cyan-300 uppercase tracking-widest opacity-80 block mb-2">
                        Presets Magnéticos
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                        {(Object.keys(FERROFLUID_PRESETS) as FerrofluidPreset[]).map((key) => {
                            const p = FERROFLUID_PRESETS[key];
                            const active = config.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                                        active
                                            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="font-bold">{p.name}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                        {p.description}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Força do Campo */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="fieldStrength" className="text-xs font-bold text-cyan-200 uppercase tracking-widest opacity-80">
                            Intensidade do Campo (B)
                        </label>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                            {config.fieldStrength.toFixed(2)}x
                        </span>
                    </div>
                    <input
                        id="fieldStrength"
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={config.fieldStrength}
                        onChange={(e) => setConfig((p) => ({ ...p, fieldStrength: parseFloat(e.target.value) }))}
                        className="w-full accent-cyan-400"
                    />
                </div>

                {/* Espinhos de Rosensweig */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="spikeSharpness" className="text-xs font-bold text-cyan-200 uppercase tracking-widest opacity-80">
                            Agudeza dos Espinhos
                        </label>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                            {config.spikeSharpness.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="spikeSharpness"
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={config.spikeSharpness}
                        onChange={(e) => setConfig((p) => ({ ...p, spikeSharpness: parseFloat(e.target.value) }))}
                        className="w-full accent-cyan-400"
                    />
                </div>

                {/* Tensão Superficial */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="surfaceTension" className="text-xs font-bold text-cyan-200 uppercase tracking-widest opacity-80">
                            Tensão Superficial
                        </label>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                            {config.surfaceTension.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="surfaceTension"
                        type="range"
                        min="0.1"
                        max="0.95"
                        step="0.05"
                        value={config.surfaceTension}
                        onChange={(e) => setConfig((p) => ({ ...p, surfaceTension: parseFloat(e.target.value) }))}
                        className="w-full accent-cyan-400"
                    />
                </div>

                {/* Viscosidade */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="viscosity" className="text-xs font-bold text-cyan-200 uppercase tracking-widest opacity-80">
                            Viscosidade Dinâmica
                        </label>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                            {config.viscosity.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="viscosity"
                        type="range"
                        min="0.6"
                        max="0.98"
                        step="0.02"
                        value={config.viscosity}
                        onChange={(e) => setConfig((p) => ({ ...p, viscosity: parseFloat(e.target.value) }))}
                        className="w-full accent-cyan-400"
                    />
                </div>

                {/* Toggles */}
                <div className="my-4 border-t border-white/10 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">Linhas de Campo</span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, showFieldLines: !p.showFieldLines }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.showFieldLines
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.showFieldLines ? 'VISÍVEL' : 'OCULTO'}
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">Brilho Especular Metálico</span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, metallicSheen: !p.metallicSheen }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.metallicSheen
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.metallicSheen ? 'ATIVO' : 'FOSCO'}
                        </button>
                    </div>
                </div>

                {/* Inverter Pólos & Reset */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={onTogglePolarity}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-200 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RefreshCw size={14} /> Inverter Polaridade (N ↔ S)
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Redefinir Simulação
                    </button>
                </div>
            </div>
        </div>
    );
};
