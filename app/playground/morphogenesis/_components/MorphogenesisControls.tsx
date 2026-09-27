"use client";

import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import {
    MorphogenesisConfig,
    MorphogenesisPresetName,
    MORPHOGENESIS_PRESETS,
    ColorPalette,
} from '../_utils/types';

interface Props {
    config: MorphogenesisConfig;
    setConfig: React.Dispatch<React.SetStateAction<MorphogenesisConfig>>;
    show: boolean;
    onReset: () => void;
    onRandomize: () => void;
}

export const MorphogenesisControls = ({
    config,
    setConfig,
    show,
    onReset,
    onRandomize,
}: Props) => {
    const handlePresetChange = (key: MorphogenesisPresetName) => {
        const p = MORPHOGENESIS_PRESETS[key];
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

                {/* Paleta Cromática */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-purple-200 uppercase tracking-widest opacity-80 block mb-2">
                        Paleta Espectral
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {[
                            { id: 'electric' as ColorPalette, label: 'Elétrica' },
                            { id: 'biolum' as ColorPalette, label: 'Biolum' },
                            { id: 'thermal' as ColorPalette, label: 'Térmica' },
                            { id: 'obsidian' as ColorPalette, label: 'Obsidiana' },
                        ].map((pal) => (
                            <button
                                key={pal.id}
                                onClick={() => setConfig((p) => ({ ...p, palette: pal.id }))}
                                className={`py-2 px-2.5 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all text-center truncate ${
                                    config.palette === pal.id
                                        ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                {pal.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Presets Físicos */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-purple-200 uppercase tracking-widest opacity-80 block mb-2">
                        Regimes Morfogenéticos
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(MORPHOGENESIS_PRESETS) as MorphogenesisPresetName[]).map((key) => {
                            const p = MORPHOGENESIS_PRESETS[key];
                            const isSelected = config.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all text-left truncate ${
                                        isSelected
                                            ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {p.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Taxa de Alimentação (Feed Rate) */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="feed" className="text-xs font-bold text-purple-200 uppercase tracking-widest opacity-80">
                            Taxa de Alimentação (F)
                        </label>
                        <span className="text-xs font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                            {config.feed.toFixed(4)}
                        </span>
                    </div>
                    <input
                        id="feed"
                        type="range"
                        min="0.0100"
                        max="0.0800"
                        step="0.0005"
                        value={config.feed}
                        onChange={(e) => setConfig((p) => ({ ...p, feed: parseFloat(e.target.value) }))}
                        className="w-full accent-purple-400"
                    />
                </div>

                {/* Taxa de Decaimento (Kill Rate) */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="kill" className="text-xs font-bold text-purple-200 uppercase tracking-widest opacity-80">
                            Taxa de Decaimento (k)
                        </label>
                        <span className="text-xs font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                            {config.kill.toFixed(4)}
                        </span>
                    </div>
                    <input
                        id="kill"
                        type="range"
                        min="0.0450"
                        max="0.0700"
                        step="0.0005"
                        value={config.kill}
                        onChange={(e) => setConfig((p) => ({ ...p, kill: parseFloat(e.target.value) }))}
                        className="w-full accent-purple-400"
                    />
                </div>

                {/* Velocidade de Simulação */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="speed" className="text-xs font-bold text-purple-200 uppercase tracking-widest opacity-80">
                            Passos por Quadro
                        </label>
                        <span className="text-xs font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                            {config.speed}x
                        </span>
                    </div>
                    <input
                        id="speed"
                        type="range"
                        min="2"
                        max="16"
                        step="1"
                        value={config.speed}
                        onChange={(e) => setConfig((p) => ({ ...p, speed: parseInt(e.target.value, 10) }))}
                        className="w-full accent-purple-400"
                    />
                </div>

                {/* Raio do Pincel */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="brush" className="text-xs font-bold text-purple-200 uppercase tracking-widest opacity-80">
                            Raio de Injeção
                        </label>
                        <span className="text-xs font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                            {config.brushRadius}px
                        </span>
                    </div>
                    <input
                        id="brush"
                        type="range"
                        min="10"
                        max="60"
                        step="2"
                        value={config.brushRadius}
                        onChange={(e) => setConfig((p) => ({ ...p, brushRadius: parseInt(e.target.value, 10) }))}
                        className="w-full accent-purple-400"
                    />
                </div>

                {/* Toggles */}
                <div className="my-4 border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-purple-200 uppercase tracking-widest opacity-80">
                            Iluminação Normal 3D
                        </span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, bumpLight: !p.bumpLight }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.bumpLight
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.bumpLight ? 'ATIVO' : 'PLANO'}
                        </button>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={onRandomize}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <Sparkles size={14} /> Espalhar Sementes
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Restaurar Campo
                    </button>
                </div>
            </div>
        </div>
    );
};
