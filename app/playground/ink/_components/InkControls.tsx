"use client";

import React from 'react';
import { RotateCcw, Droplets, Waves, Wind } from 'lucide-react';
import { InkConfig, INK_PRESETS, INK_PALETTES, InkPreset, InkTool } from '../_utils/types';

interface Props {
    config: InkConfig;
    setConfig: React.Dispatch<React.SetStateAction<InkConfig>>;
    show: boolean;
    onReset: () => void;
}

export const InkControls = ({
    config,
    setConfig,
    show,
    onReset,
}: Props) => {
    const handlePresetChange = (presetKey: InkPreset) => {
        const p = INK_PRESETS[presetKey];
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
            <div className="bg-slate-900/85 backdrop-blur-xl border border-pink-500/20 md:rounded-2xl rounded-t-2xl p-6 h-full md:h-auto md:max-h-[78vh] overflow-y-auto text-white shadow-2xl shadow-pink-950/40">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

                {/* Ferramentas de Interação */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-pink-300 uppercase tracking-widest opacity-80 block mb-2">
                        Modo de Interação
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {[
                            { id: 'drop' as InkTool, label: 'Gotas', icon: Droplets },
                            { id: 'stream' as InkTool, label: 'Jato', icon: Wind },
                            { id: 'stir' as InkTool, label: 'Misturar', icon: Waves },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setConfig((p) => ({ ...p, tool: t.id }))}
                                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg border transition-all text-xs font-bold uppercase ${
                                    config.tool === t.id
                                        ? 'bg-pink-500/20 border-pink-400/60 text-pink-200'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                <t.icon size={16} />
                                <span className="text-[10px]">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Presets */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-pink-300 uppercase tracking-widest opacity-80 block mb-2">
                        Presets Hidrodinâmicos
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                        {(Object.keys(INK_PRESETS) as InkPreset[]).map((key) => {
                            const p = INK_PRESETS[key];
                            const active = config.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                                        active
                                            ? 'bg-pink-500/20 border-pink-400/50 text-pink-200'
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

                {/* Paleta de Cores */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-pink-300 uppercase tracking-widest opacity-80 block mb-2">
                        Paleta Cromática
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(INK_PALETTES).map(([key, pal]) => (
                            <button
                                key={key}
                                onClick={() => setConfig((p) => ({ ...p, palette: key }))}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-xs ${
                                    config.palette === key
                                        ? 'bg-pink-500/20 border-pink-400/60 text-pink-200'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                <div className="flex -space-x-1">
                                    {pal.colors.slice(0, 3).map((c, i) => (
                                        <div
                                            key={i}
                                            className="w-3 h-3 rounded-full border border-black/40"
                                            style={{ backgroundColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})` }}
                                        />
                                    ))}
                                </div>
                                <span className="text-[11px] truncate">{pal.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Flutuabilidade / Afundamento */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="buoyancy" className="text-xs font-bold text-pink-200 uppercase tracking-widest opacity-80">
                            Densidade & Empuxo Negativo
                        </label>
                        <span className="text-xs font-mono text-pink-400 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-500/20">
                            {config.buoyancy.toFixed(2)}x
                        </span>
                    </div>
                    <input
                        id="buoyancy"
                        type="range"
                        min="0.1"
                        max="2.5"
                        step="0.1"
                        value={config.buoyancy}
                        onChange={(e) => setConfig((p) => ({ ...p, buoyancy: parseFloat(e.target.value) }))}
                        className="w-full accent-pink-400"
                    />
                </div>

                {/* Vorticidade */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="vorticity" className="text-xs font-bold text-pink-200 uppercase tracking-widest opacity-80">
                            Vorticidade (Curvatura)
                        </label>
                        <span className="text-xs font-mono text-pink-400 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-500/20">
                            {config.vorticity.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="vorticity"
                        type="range"
                        min="0.4"
                        max="3.5"
                        step="0.1"
                        value={config.vorticity}
                        onChange={(e) => setConfig((p) => ({ ...p, vorticity: parseFloat(e.target.value) }))}
                        className="w-full accent-pink-400"
                    />
                </div>

                {/* Viscosidade */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="viscosity" className="text-xs font-bold text-pink-200 uppercase tracking-widest opacity-80">
                            Viscosidade da Água
                        </label>
                        <span className="text-xs font-mono text-pink-400 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-500/20">
                            {config.viscosity.toFixed(3)}
                        </span>
                    </div>
                    <input
                        id="viscosity"
                        type="range"
                        min="0.90"
                        max="0.995"
                        step="0.005"
                        value={config.viscosity}
                        onChange={(e) => setConfig((p) => ({ ...p, viscosity: parseFloat(e.target.value) }))}
                        className="w-full accent-pink-400"
                    />
                </div>

                {/* Difusão */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="diffusion" className="text-xs font-bold text-pink-200 uppercase tracking-widest opacity-80">
                            Difusão Molecular
                        </label>
                        <span className="text-xs font-mono text-pink-400 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-500/20">
                            {config.diffusion.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="diffusion"
                        type="range"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                        value={config.diffusion}
                        onChange={(e) => setConfig((p) => ({ ...p, diffusion: parseFloat(e.target.value) }))}
                        className="w-full accent-pink-400"
                    />
                </div>

                {/* Botão de Limpar / Reset */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Limpar Tanque
                    </button>
                </div>
            </div>
        </div>
    );
};
