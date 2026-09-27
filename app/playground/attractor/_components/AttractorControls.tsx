"use client";

import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { AttractorConfig, ATTRACTOR_PRESETS, AttractorType } from '../_utils/types';

interface Props {
    config: AttractorConfig;
    setConfig: React.Dispatch<React.SetStateAction<AttractorConfig>>;
    show: boolean;
    onReset: () => void;
    onButterflyBurst: () => void;
}

export const AttractorControls = ({
    config,
    setConfig,
    show,
    onReset,
    onButterflyBurst,
}: Props) => {
    const currentPreset = ATTRACTOR_PRESETS[config.type];

    const handleTypeChange = (type: AttractorType) => {
        const p = ATTRACTOR_PRESETS[type];
        setConfig((prev) => ({
            ...prev,
            type,
            param1: p.defaultParams[0],
            param2: p.defaultParams[1],
            param3: p.defaultParams[2],
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
            <div className="bg-slate-900/85 backdrop-blur-xl border border-violet-500/20 md:rounded-2xl rounded-t-2xl p-6 h-full md:h-auto md:max-h-[78vh] overflow-y-auto text-white shadow-2xl shadow-violet-950/40">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

                {/* Seleção do Atrator */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-violet-300 uppercase tracking-widest opacity-80 block mb-2">
                        Manifold Caótico 3D
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                        {(Object.keys(ATTRACTOR_PRESETS) as AttractorType[]).map((key) => {
                            const p = ATTRACTOR_PRESETS[key];
                            const active = config.type === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleTypeChange(key)}
                                    className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                                        active
                                            ? 'bg-violet-500/20 border-violet-400/50 text-violet-200'
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

                {/* Parâmetros Dinâmicos do Atrator */}
                <div className="space-y-3.5 mb-5 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider block">
                        Constantes de Bifurcação
                    </span>

                    {/* Param 1 */}
                    <div>
                        <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="text-slate-300">{currentPreset.paramLabels[0]}</span>
                            <span className="font-mono text-violet-400">{config.param1.toFixed(3)}</span>
                        </div>
                        <input
                            type="range"
                            min={currentPreset.paramRanges[0][0]}
                            max={currentPreset.paramRanges[0][1]}
                            step={(currentPreset.paramRanges[0][1] - currentPreset.paramRanges[0][0]) / 100}
                            value={config.param1}
                            onChange={(e) => setConfig((p) => ({ ...p, param1: parseFloat(e.target.value) }))}
                            className="w-full accent-violet-400"
                        />
                    </div>

                    {/* Param 2 */}
                    <div>
                        <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="text-slate-300">{currentPreset.paramLabels[1]}</span>
                            <span className="font-mono text-violet-400">{config.param2.toFixed(3)}</span>
                        </div>
                        <input
                            type="range"
                            min={currentPreset.paramRanges[1][0]}
                            max={currentPreset.paramRanges[1][1]}
                            step={(currentPreset.paramRanges[1][1] - currentPreset.paramRanges[1][0]) / 100}
                            value={config.param2}
                            onChange={(e) => setConfig((p) => ({ ...p, param2: parseFloat(e.target.value) }))}
                            className="w-full accent-violet-400"
                        />
                    </div>

                    {/* Param 3 */}
                    <div>
                        <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="text-slate-300">{currentPreset.paramLabels[2]}</span>
                            <span className="font-mono text-violet-400">{config.param3.toFixed(3)}</span>
                        </div>
                        <input
                            type="range"
                            min={currentPreset.paramRanges[2][0]}
                            max={currentPreset.paramRanges[2][1]}
                            step={(currentPreset.paramRanges[2][1] - currentPreset.paramRanges[2][0]) / 100}
                            value={config.param3}
                            onChange={(e) => setConfig((p) => ({ ...p, param3: parseFloat(e.target.value) }))}
                            className="w-full accent-violet-400"
                        />
                    </div>
                </div>

                {/* Esquema de Cor */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-violet-300 uppercase tracking-widest opacity-80 block mb-2">
                        Espectro de Fase
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'aurora' as const, label: 'Aurora Boreal' },
                            { id: 'fire' as const, label: 'Plasma Fogo' },
                            { id: 'cyber' as const, label: 'Cyberpunk' },
                            { id: 'electric' as const, label: 'Eletro Azul' },
                        ].map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setConfig((p) => ({ ...p, colorScheme: c.id }))}
                                className={`py-1.5 px-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all text-center ${
                                    config.colorScheme === c.id
                                        ? 'bg-violet-500/20 border-violet-400/60 text-violet-200'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Velocidade de Integração */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="speed" className="text-xs font-bold text-violet-200 uppercase tracking-widest opacity-80">
                            Velocidade Temporal (dt)
                        </label>
                        <span className="text-xs font-mono text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/20">
                            {config.speed.toFixed(2)}x
                        </span>
                    </div>
                    <input
                        id="speed"
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.1"
                        value={config.speed}
                        onChange={(e) => setConfig((p) => ({ ...p, speed: parseFloat(e.target.value) }))}
                        className="w-full accent-violet-400"
                    />
                </div>

                {/* Quantidade de Partículas */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="particleCount" className="text-xs font-bold text-violet-200 uppercase tracking-widest opacity-80">
                            Traçadores Ativos
                        </label>
                        <span className="text-xs font-mono text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/20">
                            {config.particleCount}
                        </span>
                    </div>
                    <input
                        id="particleCount"
                        type="range"
                        min="800"
                        max="6000"
                        step="200"
                        value={config.particleCount}
                        onChange={(e) => setConfig((p) => ({ ...p, particleCount: parseInt(e.target.value, 10) }))}
                        className="w-full accent-violet-400"
                    />
                </div>

                {/* Persistência de Rastro */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="trailPersistence" className="text-xs font-bold text-violet-200 uppercase tracking-widest opacity-80">
                            Fosforescência dos Rastros
                        </label>
                        <span className="text-xs font-mono text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/20">
                            {Math.round(config.trailPersistence * 100)}%
                        </span>
                    </div>
                    <input
                        id="trailPersistence"
                        type="range"
                        min="0.75"
                        max="0.98"
                        step="0.01"
                        value={config.trailPersistence}
                        onChange={(e) => setConfig((p) => ({ ...p, trailPersistence: parseFloat(e.target.value) }))}
                        className="w-full accent-violet-400"
                    />
                </div>

                {/* Efeito Borboleta & Reset */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={onButterflyBurst}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-400/40 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-violet-950/30"
                    >
                        <Sparkles size={14} /> Efeito Borboleta (Divergência)
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Redefinir Câmera & Fase
                    </button>
                </div>
            </div>
        </div>
    );
};
