"use client";

import React, { useState } from 'react';
import { Power, RotateCw, Smartphone } from 'lucide-react';
import { KEY_LAYOUT, DEFAULT_CONFIG } from '../_utils/constants';
import { RGBConfig } from '../_utils/types';
import { useRGBAnimation } from '../_hooks/useRGBAnimation';
import { KeyCap } from './KeyCap';
import { SettingsPanel } from './SettingsPanel';
import { KeyboardStyles } from './KeyboardStyles';

export default function KeyboardGrid() {
    const [config, setConfig] = useState<RGBConfig>(DEFAULT_CONFIG);
    const { registerRef, triggerKey, releaseKey } = useRGBAnimation(config, setConfig);

    return (
        <div className="relative w-full h-full flex items-center justify-center select-none bg-slate-950 text-white overflow-hidden">
            <KeyboardStyles />

            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 md:hidden portrait:flex landscape:hidden">
                <div className="mb-6 p-4 bg-cyan-500/10 rounded-full animate-pulse">
                    <RotateCw size={48} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Melhor Experiência na Horizontal</h2>
                <p className="text-slate-400">Gire seu dispositivo para usar o teclado RGB completo.</p>
                <Smartphone className="mt-8 text-slate-600 rotate-90" size={32} />
            </div>

            <div className="hidden md:flex portrait:hidden landscape:flex items-center justify-center w-full h-full">
                <div className="relative p-3 md:p-8 pt-12 md:pt-24 bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-700 shadow-2xl transition-transform origin-center scale-[0.5] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 xl:scale-100">
                    <div className="absolute top-0 left-0 w-full h-16 md:h-24 flex items-center justify-center px-8">
                        <div className="text-slate-500 font-mono text-[10px] md:text-xs tracking-[0.5em] whitespace-nowrap select-none">
                            FL-MECHANICAL // RGB_OS
                        </div>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                            <KeyCap
                                label="PWR"
                                uniqueId="PWR-BTN"
                                widthClass="w-10 md:w-14"
                                heightClass="h-8 md:h-10"
                                registerRef={registerRef}
                                onTrigger={triggerKey}
                                onRelease={releaseKey}
                            >
                                <Power size={16} className={config.isOn ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" : "text-slate-700"} />
                            </KeyCap>
                        </div>
                    </div>

                    {KEY_LAYOUT.map((row, rI) => (
                        <div key={rI} className="flex justify-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                            {row.map((key, kI) => {
                                const width = key === 'SPACE' ? 'w-40 md:w-64' : key.length > 1 ? 'w-10 md:w-16' : 'w-8 md:w-12';
                                const height = 'h-10 md:h-12';
                                const uniqueId = `${rI}-${kI}`;

                                return (
                                    <KeyCap
                                        key={uniqueId}
                                        uniqueId={uniqueId}
                                        label={key}
                                        widthClass={width}
                                        heightClass={height}
                                        registerRef={registerRef}
                                        onTrigger={triggerKey}
                                        onRelease={releaseKey}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <SettingsPanel config={config} setConfig={setConfig} />
        </div>
    );
}