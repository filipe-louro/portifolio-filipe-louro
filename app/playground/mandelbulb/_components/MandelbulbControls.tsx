"use client";

import React from 'react';
import { RotateCw, RotateCcw } from 'lucide-react';
import { MandelbulbConfig } from '../_utils/types';
import { PALETTE_OPTIONS } from '../_utils/palettes';

interface Props {
    config: MandelbulbConfig;
    setConfig: React.Dispatch<React.SetStateAction<MandelbulbConfig>>;
    show: boolean;
    onResetCamera: () => void;
    onResetConfig: () => void;
}

export const MandelbulbControls = ({
    config,
    setConfig,
    show,
    onResetCamera,
    onResetConfig,
}: Props) => {
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

                {/* Potência do Fractal (Power) */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="power" className="text-xs font-bold text-violet-200 uppercase tracking-widest opacity-80">
                            Ordem (Expoente N)
                        </label>
                        <span className="text-xs font-mono text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/20">
                            {config.power.toFixed(1)}
                        </span>
                    </div>
                    <input
                        id="power"
                        type="range"
                        min="2.0"
                        max="12.0"
                        step="0.1"
                        value={config.power}
                        onChange={(e) => setConfig((p) => ({ ...p, power: parseFloat(e.target.value) }))}
                        className="w-full accent-violet-400"
                    />
                </div>

                {/* Profundidade de Iteração */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="iterations" className="text-xs font-bold text-violet-200 uppercase tracking-widest opacity-80">
                            Profundidade Fractal
                        </label>
                        <span className="text-xs font-mono text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/20">
                            {config.maxIterations} it
                        </span>
                    </div>
                    <input
                        id="iterations"
                        type="range"
                        min="4"
                        max="12"
                        step="1"
                        value={config.maxIterations}
                        onChange={(e) => setConfig((p) => ({ ...p, maxIterations: parseInt(e.target.value, 10) }))}
                        className="w-full accent-violet-400"
                    />
                </div>

                {/* Glow Volumétrico */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="glow" className="text-xs font-bold text-violet-200 uppercase tracking-widest opacity-80">
                            Glow Volumétrico
                        </label>
                        <span className="text-xs font-mono text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/20">
                            {config.glow.toFixed(1)}x
                        </span>
                    </div>
                    <input
                        id="glow"
                        type="range"
                        min="0.0"
                        max="2.5"
                        step="0.1"
                        value={config.glow}
                        onChange={(e) => setConfig((p) => ({ ...p, glow: parseFloat(e.target.value) }))}
                        className="w-full accent-violet-400"
                    />
                </div>

                {/* Paletas de Cor */}
                <div className="my-4 border-t border-white/10 pt-4">
                    <label className="text-xs font-bold text-violet-200 uppercase tracking-widest opacity-80 block mb-2">
                        Esquema Cromático
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {PALETTE_OPTIONS.map((pal) => (
                            <button
                                key={pal.id}
                                onClick={() => setConfig((p) => ({ ...p, palette: pal.id }))}
                                className={`p-2 rounded-lg border text-left transition-all ${
                                    config.palette === pal.id
                                        ? 'bg-violet-500/20 border-violet-500/60 text-white'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    {pal.colors.map((c, i) => (
                                        <div
                                            key={i}
                                            className="w-3 h-3 rounded-full border border-black/30"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <div className="text-[11px] font-bold">{pal.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rotação Automática */}
                <div className="my-4 border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="text-xs font-bold text-violet-200 uppercase tracking-widest opacity-80">
                        Órbita Contínua
                    </span>
                    <button
                        onClick={() => setConfig((p) => ({ ...p, autoRotate: !p.autoRotate }))}
                        className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                            config.autoRotate
                                ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                                : 'bg-white/5 text-slate-500 border-white/10'
                        }`}
                    >
                        {config.autoRotate ? 'ATIVO' : 'PAUSADO'}
                    </button>
                </div>

                {/* Ações */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                    <button
                        onClick={onResetCamera}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCw size={14} /> Câmera
                    </button>
                    <button
                        onClick={onResetConfig}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Resetar
                    </button>
                </div>
            </div>
        </div>
    );
};
