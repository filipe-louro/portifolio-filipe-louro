"use client";

import React from 'react';
import { Pause, Play, RotateCcw, Shuffle, Trash2 } from 'lucide-react';
import { CONFIG_RANGES, COLOR_MODE_OPTIONS, FluidConfig, PresetName } from '../_utils/types';
import { FLUID_PRESETS, PRESET_LABELS } from '../_utils/presets';

interface SliderProps {
    name: Exclude<keyof FluidConfig, 'colorMode'>;
    value: number;
    onChange: (name: SliderProps['name'], value: number) => void;
}

const ConfigSlider = ({ name, value, onChange }: SliderProps) => {
    const range = CONFIG_RANGES[name];
    return (
        <div className="mb-4">
            <div className="flex justify-between mb-2 items-center">
                <label htmlFor={name} className="text-xs font-bold text-teal-200 uppercase tracking-widest opacity-80">
                    {range.label}
                </label>
                <span className="text-xs font-mono text-teal-400 bg-teal-900/30 px-2 py-0.5 rounded border border-teal-500/20">
                    {value}
                </span>
            </div>
            <input
                type="range"
                id={name}
                min={range.min}
                max={range.max}
                step={range.step}
                value={value}
                onChange={(e) => onChange(name, parseFloat(e.target.value))}
            />
        </div>
    );
};

interface Props {
    config: FluidConfig;
    setConfig: React.Dispatch<React.SetStateAction<FluidConfig>>;
    show: boolean;
    isPaused: boolean;
    onTogglePause: () => void;
    onClear: () => void;
    onReset: () => void;
    onRandomize: () => void;
}

export const FluidControls = ({ config, setConfig, show, isPaused, onTogglePause, onClear, onReset, onRandomize }: Props) => {
    const handleChange = (name: SliderProps['name'], value: number) => {
        setConfig((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div
            className={`absolute md:right-6 right-0 top-64 md:top-24 bottom-0 md:bottom-auto md:w-80 w-full transition-all duration-500 z-20 ${
                show ? 'translate-y-0 md:translate-x-0 opacity-100' : 'translate-y-full md:translate-y-0 md:translate-x-[120%] opacity-0 pointer-events-none'
            }`}
        >
            <div className="fluid-panel md:rounded-2xl rounded-t-2xl p-6 h-full md:h-auto md:max-h-[70vh] overflow-y-auto">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

                {(Object.keys(CONFIG_RANGES) as SliderProps['name'][]).map((name) => (
                    <ConfigSlider key={name} name={name} value={config[name]} onChange={handleChange} />
                ))}

                <div className="my-4 border-t border-white/10" />

                <label className="text-xs font-bold text-teal-200 uppercase tracking-widest opacity-80 block mb-2">
                    Color Mode
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {COLOR_MODE_OPTIONS.map((mode, index) => (
                        <button
                            key={mode.value}
                            onClick={() => setConfig((prev) => ({ ...prev, colorMode: mode.value }))}
                            className={`px-2 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide transition-all ${
                                index === COLOR_MODE_OPTIONS.length - 1 && COLOR_MODE_OPTIONS.length % 2 === 1 ? 'col-span-2' : ''
                            } ${
                                config.colorMode === mode.value
                                    ? 'bg-teal-500 text-slate-950'
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>

                <div className="my-4 border-t border-white/10" />

                <label className="text-xs font-bold text-teal-200 uppercase tracking-widest opacity-80 block mb-2">
                    Presets
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {(Object.keys(FLUID_PRESETS) as PresetName[]).map((name) => (
                        <button
                            key={name}
                            onClick={() => setConfig(FLUID_PRESETS[name])}
                            className="px-2 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide bg-white/5 text-slate-300 hover:bg-teal-500/20 hover:text-teal-300 transition-all"
                        >
                            {PRESET_LABELS[name]}
                        </button>
                    ))}
                </div>

                <div className="my-4 border-t border-white/10" />

                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={onReset}
                        aria-label="Reset"
                        title="Reset"
                        className="flex items-center justify-center p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={onClear}
                        aria-label="Clear"
                        title="Clear"
                        className="flex items-center justify-center p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={onTogglePause}
                        aria-label={isPaused ? 'Resume' : 'Pause'}
                        title={isPaused ? 'Resume' : 'Pause'}
                        className={`flex items-center justify-center p-2.5 rounded-lg transition-all ${
                            isPaused ? 'bg-teal-500/20 text-teal-300' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                    >
                        {isPaused ? <Play size={18} /> : <Pause size={18} />}
                    </button>
                    <button
                        onClick={onRandomize}
                        aria-label="Randomize"
                        title="Randomize"
                        className="flex items-center justify-center p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                    >
                        <Shuffle size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
