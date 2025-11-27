"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Waves, ScanLine, MousePointer2, Power, X,
    Activity, Sliders, Palette, Aperture, ArrowLeft, ArrowRight
} from 'lucide-react';
import { RGBConfig, RGBMode, StaticType, RGBDirection } from '../_utils/types';

interface SettingsPanelProps {
    config: RGBConfig;
    setConfig: React.Dispatch<React.SetStateAction<RGBConfig>>;
}

export const SettingsPanel = ({ config, setConfig }: SettingsPanelProps) => {
    return (
        <>
            <AnimatePresence>
                {config.isPanelOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfig(p => ({ ...p, isPanelOpen: false }))}
                            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
                        />

                        <motion.div
                            initial={{ x: 50, opacity: 0, scale: 0.95 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: 50, opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed right-4 top-4 bottom-4 md:right-8 md:top-8 md:bottom-8 w-[calc(100%-2rem)] md:w-96 glass-panel z-50 flex flex-col rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl"
                            style={{ maxHeight: 'calc(100vh - 4rem)' }}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h2 className="font-mono font-bold text-cyan-400 flex items-center gap-3 text-sm tracking-widest">
                                    <Sliders size={16} /> SYNAPSE_OS
                                </h2>
                                <button
                                    onClick={() => setConfig(p => ({ ...p, isPanelOpen: false }))}
                                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-8 overflow-y-auto flex-1 scrollbar-hide">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider ml-1">Animation Mode</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'wave', icon: Waves, label: 'Wave' },
                                            { id: 'breathing', icon: Activity, label: 'Breath' },
                                            { id: 'scan', icon: ScanLine, label: 'Scan' },
                                            { id: 'reactive', icon: MousePointer2, label: 'React' },
                                            { id: 'static', icon: Power, label: 'Static' }
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => setConfig(p => ({ ...p, mode: m.id as RGBMode }))}
                                                className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${config.mode === m.id
                                                    ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                                    : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-white/10 hover:text-slate-300'
                                                }`}
                                            >
                                                <m.icon size={20} className={`mb-2 transition-transform duration-300 ${config.mode === m.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                                                <span className="text-[10px] font-mono font-bold tracking-wider">{m.label}</span>
                                                {config.mode === m.id && (
                                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {config.mode === 'static' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider ml-1">Static Style</label>
                                        <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
                                            {[
                                                { id: 'solid', icon: Palette, label: 'Solid Color' },
                                                { id: 'gradient', icon: Aperture, label: 'RGB Spectrum' }
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setConfig(p => ({ ...p, staticType: type.id as StaticType }))}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${config.staticType === type.id
                                                        ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                                                        : 'text-slate-600 hover:text-slate-400'
                                                    }`}
                                                >
                                                    <type.icon size={16} />
                                                    <span className="text-[10px] font-mono font-bold">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {config.mode === 'wave' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider ml-1">Flow Direction</label>
                                        <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
                                            {[
                                                { id: 'ltr', icon: ArrowLeft },
                                                { id: 'rtl', icon: ArrowRight }
                                            ].map((dir) => (
                                                <button
                                                    key={dir.id}
                                                    onClick={() => setConfig(p => ({ ...p, direction: dir.id as RGBDirection }))}
                                                    className={`flex-1 flex items-center justify-center py-3 rounded-lg transition-all ${config.direction === dir.id
                                                        ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                                                        : 'text-slate-600 hover:text-slate-400'
                                                    }`}
                                                >
                                                    <dir.icon size={18} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {config.mode !== 'static' && config.mode !== 'reactive' && (
                                        <div>
                                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
                                                <span>Speed</span>
                                                <span className="text-cyan-400">{Math.round(config.speed * 5)}%</span>
                                            </div>
                                            <div className="relative h-6 flex items-center">
                                                <div className="absolute inset-x-0 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-500" style={{ width: `${(config.speed / 20) * 100}%` }} />
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="20"
                                                    value={config.speed}
                                                    onChange={e => setConfig(p => ({ ...p, speed: Number(e.target.value) }))}
                                                    className="relative w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div
                                                    className="absolute h-3 w-3 bg-cyan-400 rounded-full pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all"
                                                    style={{ left: `calc(${(config.speed / 20) * 100}% - 6px)` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {config.mode !== 'reactive' && (
                                        <div>
                                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
                                                <span>Brightness</span>
                                                <span className="text-cyan-400">{config.brightness}%</span>
                                            </div>
                                            <div className="relative h-6 flex items-center">
                                                <div className="absolute inset-x-0 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-500" style={{ width: `${config.brightness}%` }} />
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={config.brightness}
                                                    onChange={e => setConfig(p => ({ ...p, brightness: Number(e.target.value) }))}
                                                    className="relative w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div
                                                    className="absolute h-3 w-3 bg-cyan-400 rounded-full pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all"
                                                    style={{ left: `calc(${config.brightness}% - 6px)` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {config.mode !== 'wave' && !(config.mode === 'static' && config.staticType === 'gradient') && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider ml-1">Global Hue</label>
                                        <div className="relative h-6 w-full flex items-center">
                                            <div className="absolute inset-x-0 h-3 rounded-full w-full" style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }} />
                                            <input
                                                type="range"
                                                min="0"
                                                max="360"
                                                value={config.primaryHue}
                                                onChange={e => setConfig(p => ({ ...p, primaryHue: Number(e.target.value) }))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div
                                                className="absolute h-5 w-5 border-2 border-white rounded-full pointer-events-none shadow-lg"
                                                style={{
                                                    left: `calc(${(config.primaryHue / 360) * 100}% - 10px)`,
                                                    backgroundColor: `hsl(${config.primaryHue}, 100%, 50%)`
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-mono text-slate-600 px-1">
                                            <span>0°</span>
                                            <span className="text-white">{config.primaryHue}°</span>
                                            <span>360°</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/5 bg-black/20 text-center">
                                <span className="text-[10px] font-mono text-slate-600">v3.0.1 // STABLE BUILD</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {!config.isPanelOpen && (
                <motion.button
                    layoutId="settings-trigger"
                    onClick={() => setConfig(p => ({ ...p, isPanelOpen: true }))}
                    className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-full flex items-center justify-center backdrop-blur hover:bg-cyan-500/20 z-40 shadow-[0_0_15px_rgba(6,182,212,0.3)] hidden md:flex portrait:hidden landscape:flex"
                >
                    <Settings size={20} className="animate-spin-slow" />
                </motion.button>
            )}
        </>
    );
};