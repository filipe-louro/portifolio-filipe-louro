"use client";

import React from 'react';
import { RotateCcw, Plus } from 'lucide-react';
import {
    PhysarumConfig,
    PhysarumPresetName,
    PHYSARUM_PRESETS,
    PhysarumColorMode,
} from '../_utils/types';

interface Props {
    config: PhysarumConfig;
    setConfig: React.Dispatch<React.SetStateAction<PhysarumConfig>>;
    show: boolean;
    onReset: () => void;
    onAddFood: () => void;
}

export const PhysarumControls = ({
    config,
    setConfig,
    show,
    onReset,
    onAddFood,
}: Props) => {
    const handlePresetChange = (key: PhysarumPresetName) => {
        const p = PHYSARUM_PRESETS[key];
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

                {/* Modo Cromático */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-lime-200 uppercase tracking-widest opacity-80 block mb-2">
                        Pigmentação Biológica
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {[
                            { id: 'lime' as PhysarumColorMode, label: 'Bio-Lima' },
                            { id: 'coral' as PhysarumColorMode, label: 'Coral' },
                            { id: 'cyan' as PhysarumColorMode, label: 'Neural' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setConfig((p) => ({ ...p, colorMode: m.id }))}
                                className={`py-2 px-2 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all text-center truncate ${
                                    config.colorMode === m.id
                                        ? 'bg-lime-500/20 border-lime-500/60 text-lime-300'
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
                    <label className="text-xs font-bold text-lime-200 uppercase tracking-widest opacity-80 block mb-2">
                        Padrões de Forrageamento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(PHYSARUM_PRESETS) as PhysarumPresetName[]).map((key) => {
                            const p = PHYSARUM_PRESETS[key];
                            const isSelected = config.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all text-left truncate ${
                                        isSelected
                                            ? 'bg-lime-500/20 border-lime-500/60 text-lime-300 shadow-sm'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {p.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Ângulo do Sensor */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="sensorAngle" className="text-xs font-bold text-lime-200 uppercase tracking-widest opacity-80">
                            Abertura dos Sensores (SA)
                        </label>
                        <span className="text-xs font-mono text-lime-400 bg-lime-950/40 px-2 py-0.5 rounded border border-lime-500/20">
                            {((config.sensorAngle * 180) / Math.PI).toFixed(0)}°
                        </span>
                    </div>
                    <input
                        id="sensorAngle"
                        type="range"
                        min="0.2"
                        max="1.5"
                        step="0.05"
                        value={config.sensorAngle}
                        onChange={(e) => setConfig((p) => ({ ...p, sensorAngle: parseFloat(e.target.value) }))}
                        className="w-full accent-lime-400"
                    />
                </div>

                {/* Distância do Sensor */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="sensorOffset" className="text-xs font-bold text-lime-200 uppercase tracking-widest opacity-80">
                            Alcance Olfativo (SO)
                        </label>
                        <span className="text-xs font-mono text-lime-400 bg-lime-950/40 px-2 py-0.5 rounded border border-lime-500/20">
                            {config.sensorOffset}px
                        </span>
                    </div>
                    <input
                        id="sensorOffset"
                        type="range"
                        min="4"
                        max="30"
                        step="1"
                        value={config.sensorOffset}
                        onChange={(e) => setConfig((p) => ({ ...p, sensorOffset: parseInt(e.target.value, 10) }))}
                        className="w-full accent-lime-400"
                    />
                </div>

                {/* Ângulo de Giro */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="turnSpeed" className="text-xs font-bold text-lime-200 uppercase tracking-widest opacity-80">
                            Velocidade de Giro (RA)
                        </label>
                        <span className="text-xs font-mono text-lime-400 bg-lime-950/40 px-2 py-0.5 rounded border border-lime-500/20">
                            {((config.turnSpeed * 180) / Math.PI).toFixed(0)}°
                        </span>
                    </div>
                    <input
                        id="turnSpeed"
                        type="range"
                        min="0.2"
                        max="1.6"
                        step="0.05"
                        value={config.turnSpeed}
                        onChange={(e) => setConfig((p) => ({ ...p, turnSpeed: parseFloat(e.target.value) }))}
                        className="w-full accent-lime-400"
                    />
                </div>

                {/* Evaporação de Trilhas */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="evaporation" className="text-xs font-bold text-lime-200 uppercase tracking-widest opacity-80">
                            Decaimento de Trilhas
                        </label>
                        <span className="text-xs font-mono text-lime-400 bg-lime-950/40 px-2 py-0.5 rounded border border-lime-500/20">
                            {(config.evaporationRate * 100).toFixed(0)}%
                        </span>
                    </div>
                    <input
                        id="evaporation"
                        type="range"
                        min="0.02"
                        max="0.25"
                        step="0.01"
                        value={config.evaporationRate}
                        onChange={(e) => setConfig((p) => ({ ...p, evaporationRate: parseFloat(e.target.value) }))}
                        className="w-full accent-lime-400"
                    />
                </div>

                {/* Toggles */}
                <div className="my-4 border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-lime-200 uppercase tracking-widest opacity-80">
                            Nós de Nutrientes Visíveis
                        </span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, showFood: !p.showFood }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.showFood
                                    ? 'bg-lime-500/20 text-lime-300 border-lime-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.showFood ? 'EXIBIR' : 'OCULTAR'}
                        </button>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={onAddFood}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-lime-500/20 hover:bg-lime-500/30 text-lime-300 border border-lime-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <Plus size={14} /> Adicionar Ponto de Açúcar
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Reiniciar Colônia
                    </button>
                </div>
            </div>
        </div>
    );
};
