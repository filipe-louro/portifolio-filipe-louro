"use client";

import React from 'react';
import { RotateCcw, Rocket } from 'lucide-react';
import { GalaxyConfig, GALAXY_PRESETS, GalaxyPreset } from '../_utils/types';

interface Props {
    config: GalaxyConfig;
    setConfig: React.Dispatch<React.SetStateAction<GalaxyConfig>>;
    show: boolean;
    onReset: () => void;
    onLaunchRogue: () => void;
}

export const GalaxyControls = ({
    config,
    setConfig,
    show,
    onReset,
    onLaunchRogue,
}: Props) => {
    const handlePresetChange = (presetKey: GalaxyPreset) => {
        const p = GALAXY_PRESETS[presetKey];
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
            <div className="bg-slate-900/85 backdrop-blur-xl border border-blue-500/20 md:rounded-2xl rounded-t-2xl p-6 h-full md:h-auto md:max-h-[78vh] overflow-y-auto text-white shadow-2xl shadow-blue-950/40">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

                {/* Presets de Colisão Galáctica */}
                <div className="mb-5">
                    <label className="text-xs font-bold text-blue-300 uppercase tracking-widest opacity-80 block mb-2">
                        Cenários Astrofísicos
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                        {(Object.keys(GALAXY_PRESETS) as GalaxyPreset[]).map((key) => {
                            const p = GALAXY_PRESETS[key];
                            const active = config.preset === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                                        active
                                            ? 'bg-blue-500/20 border-blue-400/50 text-blue-200'
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

                {/* Halo de Matéria Escura */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="darkMatter" className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">
                            Halo de Matéria Escura
                        </label>
                        <span className="text-xs font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20">
                            {config.darkMatterHalo.toFixed(2)}x
                        </span>
                    </div>
                    <input
                        id="darkMatter"
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={config.darkMatterHalo}
                        onChange={(e) => setConfig((p) => ({ ...p, darkMatterHalo: parseFloat(e.target.value) }))}
                        className="w-full accent-blue-400"
                    />
                </div>

                {/* Passo Temporal dt */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="timeStep" className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">
                            Velocidade de Integração (dt)
                        </label>
                        <span className="text-xs font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20">
                            {config.timeStep.toFixed(2)}x
                        </span>
                    </div>
                    <input
                        id="timeStep"
                        type="range"
                        min="0.2"
                        max="2.0"
                        step="0.05"
                        value={config.timeStep}
                        onChange={(e) => setConfig((p) => ({ ...p, timeStep: parseFloat(e.target.value) }))}
                        className="w-full accent-blue-400"
                    />
                </div>

                {/* Amaciamento Gravitacional (Plummer Softening) */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1.5 items-center">
                        <label htmlFor="softening" className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">
                            Amaciamento Plummer (ε)
                        </label>
                        <span className="text-xs font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20">
                            {config.softening.toFixed(1)} kpc
                        </span>
                    </div>
                    <input
                        id="softening"
                        type="range"
                        min="6.0"
                        max="25.0"
                        step="1.0"
                        value={config.softening}
                        onChange={(e) => setConfig((p) => ({ ...p, softening: parseFloat(e.target.value) }))}
                        className="w-full accent-blue-400"
                    />
                </div>

                {/* Toggles */}
                <div className="my-4 border-t border-white/10 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">Rastros de Velocidade</span>
                        <button
                            onClick={() => setConfig((p) => ({ ...p, showVelocityTrails: !p.showVelocityTrails }))}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                                config.showVelocityTrails
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                    : 'bg-white/5 text-slate-500 border-white/10'
                            }`}
                        >
                            {config.showVelocityTrails ? 'ATIVO' : 'PONTOS'}
                        </button>
                    </div>
                </div>

                {/* Buraco Negro Errante & Reset */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={onLaunchRogue}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-950/30"
                    >
                        <Rocket size={14} /> Disparar Buraco Negro Errante
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <RotateCcw size={14} /> Reiniciar Colisão N-Corpos
                    </button>
                </div>
            </div>
        </div>
    );
};
