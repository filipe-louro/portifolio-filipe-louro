"use client";

import React from 'react';
import { RotateCcw, Waves, Radio, Square } from 'lucide-react';
import { RipplesConfig, RIPPLES_PRESETS, RipplesPreset, RipplesTool } from '../_utils/types';

interface Props {
    config: RipplesConfig;
    setConfig: React.Dispatch<React.SetStateAction<RipplesConfig>>;
    show: boolean;
    onReset: () => void;
}

export const RipplesControls = ({
    config,
    setConfig,
    show,
    onReset,
}: Props) => {
    const handlePresetChange = (presetKey: RipplesPreset) => {
        const p = RIPPLES_PRESETS[presetKey];
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
            <div className="bg-slate-900/85 backdrop-blur-xl border border-sky-500/20 md:rounded-2xl rounded-t-2xl p-6 h-full md:h-auto md:max-h-[78vh] overflow-y-auto text-white shadow-2xl shadow-sky-950/40">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

                {/* Ferramenta Interativa */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-sky-300 uppercase tracking-widest opacity-80 block mb-2">
                        Modo do Cursor
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {[
                            { id: 'ripple' as RipplesTool, label: 'Ondas', icon: Waves },
                            { id: 'emitter' as RipplesTool, label: 'Emissor', icon: Radio },
                            { id: 'wall' as RipplesTool, label: 'Barreira', icon: Square },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setConfig((p) => ({ ...p, tool: t.id }))}
                                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg border transition-all text-xs font-bold uppercase ${
                                    config.tool === t.id
                                        ? 'bg-sky-500/20 border-sky-400/60 text-sky-200'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                <t.icon size={16} />
                                <span className="text-[10px]">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Presets Ópticos e O ondulatórios */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-sky-300 uppercase tracking-widest opacity-80 block mb-2">
                        Experimentos de Ondas
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                        {(Object.keys(RIPPLES_PRESETS) as RipplesPreset[]).map((key) => {
                            const p = RIPPLES_PRESETS[key];
                            const active = config.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                                        active
                                            ? 'bg-sky-500/20 border-sky-400/50 text-sky-200'
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

                {/* Velocidade de Propagação */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="waveSpeed" className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80">
                            Velocidade de Onda (c)
                        </label>
                        <span className="text-xs font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                            {config.waveSpeed.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="waveSpeed"
                        type="range"
                        min="0.3"
                        max="1.0"
                        step="0.05"
                        value={config.waveSpeed}
                        onChange={(e) => setConfig((p) => ({ ...p, waveSpeed: parseFloat(e.target.value) }))}
                        className="w-full accent-sky-400"
                    />
                </div>

                {/* Frequência do Emissor */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="frequency" className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80">
                            Frequência Harmônica (ω)
                        </label>
                        <span className="text-xs font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                            {config.emitterFrequency.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="frequency"
                        type="range"
                        min="0.05"
                        max="0.35"
                        step="0.01"
                        value={config.emitterFrequency}
                        onChange={(e) => setConfig((p) => ({ ...p, emitterFrequency: parseFloat(e.target.value) }))}
                        className="w-full accent-sky-400"
                    />
                </div>

                {/* Brilho das Cáusticas */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="caustics" className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80">
                            Intensidade das Cáusticas
                        </label>
                        <span className="text-xs font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                            {config.causticsIntensity.toFixed(2)}x
                        </span>
                    </div>
                    <input
                        id="caustics"
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={config.causticsIntensity}
                        onChange={(e) => setConfig((p) => ({ ...p, causticsIntensity: parseFloat(e.target.value) }))}
                        className="w-full accent-sky-400"
                    />
                </div>

                {/* Toggles */}
                <div className="my-4 border-t border-white/10 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">Cáusticas Refratadas</span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, showCaustics: !p.showCaustics }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.showCaustics
                                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.showCaustics ? 'ATIVO' : 'DESLIGADO'}
                        </button>
                    </div>
                </div>

                {/* Botão de Reset */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Redefinir Tanque
                    </button>
                </div>
            </div>
        </div>
    );
};
