"use client";

import React from 'react';
import { RotateCcw, Zap, Sliders, Film } from 'lucide-react';
import { BlackHoleConfig, QualityPreset } from '../_utils/types';

interface Props {
    config: BlackHoleConfig;
    setConfig: React.Dispatch<React.SetStateAction<BlackHoleConfig>>;
    show: boolean;
    onResetConfig: () => void;
}

export const BlackHoleControls = ({
    config,
    setConfig,
    show,
    onResetConfig,
}: Props) => {
    const setPreset = (preset: QualityPreset) => {
        setConfig((prev) => ({ ...prev, quality: preset }));
    };

    return (
        <div
            className={`absolute right-0 md:right-6 top-20 bottom-0 md:bottom-auto md:w-80 w-full transition-all duration-300 z-30 ${
                show
                    ? 'translate-y-0 md:translate-x-0 opacity-100'
                    : 'translate-y-full md:translate-y-0 md:translate-x-[120%] opacity-0 pointer-events-none'
            }`}
        >
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 md:rounded-2xl rounded-t-2xl p-6 h-full md:h-auto md:max-h-[80vh] overflow-y-auto text-white shadow-2xl">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

                {/* Perfil de Renderização (Presets) */}
                <div className="mb-5">
                    <span className="text-xs font-bold text-orange-200 uppercase tracking-widest opacity-80 block mb-2.5">
                        Perfil de Renderização
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            type="button"
                            onClick={() => setPreset('performance')}
                            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                config.quality === 'performance'
                                    ? 'bg-orange-500/25 text-orange-200 border border-orange-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white border border-transparent'
                            }`}
                        >
                            <Zap size={14} className="mb-1" />
                            60 FPS
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreset('balanced')}
                            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                config.quality === 'balanced'
                                    ? 'bg-orange-500/25 text-orange-200 border border-orange-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white border border-transparent'
                            }`}
                        >
                            <Sliders size={14} className="mb-1" />
                            Equilibrado
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreset('cinematic')}
                            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                config.quality === 'cinematic'
                                    ? 'bg-orange-500/25 text-orange-200 border border-orange-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white border border-transparent'
                            }`}
                        >
                            <Film size={14} className="mb-1" />
                            IMAX
                        </button>
                    </div>
                </div>

                {/* Feixe Equatorial (Cross-Beam) */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="beamIntensity" className="text-xs font-bold text-orange-200 uppercase tracking-widest opacity-80">
                            Feixe Equatorial
                        </label>
                        <span className="text-xs font-mono text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">
                            {config.beamIntensity.toFixed(1)}x
                        </span>
                    </div>
                    <input
                        id="beamIntensity"
                        type="range"
                        min="0.0"
                        max="2.5"
                        step="0.1"
                        value={config.beamIntensity}
                        onChange={(e) => setConfig((p) => ({ ...p, beamIntensity: parseFloat(e.target.value) }))}
                        className="w-full accent-orange-400"
                        aria-label="Intensidade do feixe equatorial"
                    />
                </div>

                {/* Velocidade do Disco */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="diskSpeed" className="text-xs font-bold text-orange-200 uppercase tracking-widest opacity-80">
                            Velocidade do Disco
                        </label>
                        <span className="text-xs font-mono text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">
                            {config.diskSpeed.toFixed(1)}x
                        </span>
                    </div>
                    <input
                        id="diskSpeed"
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.1"
                        value={config.diskSpeed}
                        onChange={(e) => setConfig((p) => ({ ...p, diskSpeed: parseFloat(e.target.value) }))}
                        className="w-full accent-orange-400"
                        aria-label="Velocidade de rotação do disco de acreção"
                    />
                </div>

                {/* Inclinação da Câmera (Pitch / Tilt) */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 items-center">
                        <label htmlFor="cameraTilt" className="text-xs font-bold text-orange-200 uppercase tracking-widest opacity-80">
                            Inclinação da Câmera
                        </label>
                        <span className="text-xs font-mono text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">
                            {config.cameraTilt > 0 ? '+' : ''}{config.cameraTilt.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="cameraTilt"
                        type="range"
                        min="-0.8"
                        max="0.8"
                        step="0.05"
                        value={config.cameraTilt}
                        onChange={(e) => setConfig((p) => ({ ...p, cameraTilt: parseFloat(e.target.value) }))}
                        className="w-full accent-orange-400"
                        aria-label="Inclinação vertical da câmera"
                    />
                </div>

                {/* Órbita Contínua */}
                <div className="my-4 border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="text-xs font-bold text-orange-200 uppercase tracking-widest opacity-80">
                        Órbita Contínua
                    </span>
                    <button
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, autoRotate: !p.autoRotate }))}
                        className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                            config.autoRotate
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                                : 'bg-white/5 text-slate-500 border-white/10'
                        }`}
                        aria-label="Alternar órbita contínua da câmera"
                    >
                        {config.autoRotate ? 'ATIVO' : 'PAUSADO'}
                    </button>
                </div>

                {/* Ações / Reset */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onResetConfig}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Redefinir Configuração
                    </button>
                </div>
            </div>
        </div>
    );
};
