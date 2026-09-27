"use client";

import React from 'react';
import { RotateCcw, Pause, Play } from 'lucide-react';
import { PendulumConfig, PendulumPresetName, PENDULUM_PRESETS, PendulumMode } from '../_utils/types';

interface Props {
    config: PendulumConfig;
    setConfig: React.Dispatch<React.SetStateAction<PendulumConfig>>;
    show: boolean;
    onReset: () => void;
}

export const PendulumControls = ({ config, setConfig, show, onReset }: Props) => {
    const handlePresetChange = (key: PendulumPresetName) => {
        const p = PENDULUM_PRESETS[key];
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
                    <label className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80 block mb-2">
                        Topologia Caótica
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {[
                            { id: 'double' as PendulumMode, label: 'Duplo' },
                            { id: 'lyapunov' as PendulumMode, label: 'Lyapunov' },
                            { id: 'triple' as PendulumMode, label: 'Triplo' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setConfig((p) => ({ ...p, mode: m.id }))}
                                className={`py-2 px-2 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all text-center truncate ${
                                    config.mode === m.id
                                        ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
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
                    <label className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80 block mb-2">
                        Configurações Experimentais
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(PENDULUM_PRESETS) as PendulumPresetName[]).map((key) => {
                            const p = PENDULUM_PRESETS[key];
                            const isSelected = config.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all text-left truncate ${
                                        isSelected
                                            ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-sm'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {p.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Gravidade */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="gravity" className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80">
                            Aceleração Gravitacional
                        </label>
                        <span className="text-xs font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                            {config.gravity.toFixed(2)} m/s²
                        </span>
                    </div>
                    <input
                        id="gravity"
                        type="range"
                        min="2.0"
                        max="24.0"
                        step="0.5"
                        value={config.gravity}
                        onChange={(e) => setConfig((p) => ({ ...p, gravity: parseFloat(e.target.value) }))}
                        className="w-full accent-sky-400"
                    />
                </div>

                {/* Comprimento Haste 2 */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="length2" className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80">
                            Comprimento Haste Secundária
                        </label>
                        <span className="text-xs font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                            {config.length2}px
                        </span>
                    </div>
                    <input
                        id="length2"
                        type="range"
                        min="60"
                        max="200"
                        step="5"
                        value={config.length2}
                        onChange={(e) => setConfig((p) => ({ ...p, length2: parseInt(e.target.value, 10) }))}
                        className="w-full accent-sky-400"
                    />
                </div>

                {/* Massa Bob 2 */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="mass2" className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80">
                            Massa da Extremidade
                        </label>
                        <span className="text-xs font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                            {config.mass2}kg
                        </span>
                    </div>
                    <input
                        id="mass2"
                        type="range"
                        min="2"
                        max="25"
                        step="1"
                        value={config.mass2}
                        onChange={(e) => setConfig((p) => ({ ...p, mass2: parseInt(e.target.value, 10) }))}
                        className="w-full accent-sky-400"
                    />
                </div>

                {/* Persistência do Rastro */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="trail" className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80">
                            Persistência do Rastro
                        </label>
                        <span className="text-xs font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                            {(config.trailPersistence * 100).toFixed(1)}%
                        </span>
                    </div>
                    <input
                        id="trail"
                        type="range"
                        min="0.85"
                        max="0.995"
                        step="0.005"
                        value={config.trailPersistence}
                        onChange={(e) => setConfig((p) => ({ ...p, trailPersistence: parseFloat(e.target.value) }))}
                        className="w-full accent-sky-400"
                    />
                </div>

                {/* Amortecimento */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="damping" className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80">
                            Atrito com o Ar
                        </label>
                        <span className="text-xs font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                            {config.damping === 0 ? 'HAMILTONIANO' : config.damping.toFixed(4)}
                        </span>
                    </div>
                    <input
                        id="damping"
                        type="range"
                        min="0.0000"
                        max="0.0050"
                        step="0.0002"
                        value={config.damping}
                        onChange={(e) => setConfig((p) => ({ ...p, damping: parseFloat(e.target.value) }))}
                        className="w-full accent-sky-400"
                    />
                </div>

                {/* Toggles */}
                <div className="my-4 border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-sky-200 uppercase tracking-widest opacity-80">
                            Diagrama de Fase (θ₁, ω₁)
                        </span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, showPhaseSpace: !p.showPhaseSpace }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.showPhaseSpace
                                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.showPhaseSpace ? 'ATIVO' : 'OCULTO'}
                        </button>
                    </div>
                </div>

                {/* Ações */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={() => setConfig((p) => ({ ...p, isPaused: !p.isPaused }))}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        {config.isPaused ? <Play size={14} /> : <Pause size={14} />}
                        {config.isPaused ? 'Continuar Simulação' : 'Congelar Movimento'}
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Reiniciar Posições
                    </button>
                </div>
            </div>
        </div>
    );
};
