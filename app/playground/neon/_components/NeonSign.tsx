"use client";

import React, { useState } from 'react';
import { Background } from './Background';
import { NeonControls } from './NeonControls';
import { NeonStyles } from './NeonStyles';
import { useNeonState } from '../_hooks/useNeonState';
import { LabCaption } from '@/components/lab-caption';
import { Power, Settings2, X } from 'lucide-react';

export default function NeonSign() {
    const {
        text, setText, color, setColor, isOn, setIsOn,
        flicker, setFlicker, fontMode, setFontMode, neonStyle
    } = useNeonState();
    const [showControls, setShowControls] = useState(false);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center select-none font-sans">
            <NeonStyles />
            <Background />

            {/* Z2 — ações primárias */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                <button
                    onClick={() => setIsOn(!isOn)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-sm transition-all shadow-lg active:scale-90 ${
                        isOn
                            ? 'bg-pink-500/20 border-pink-400/30 text-pink-200 shadow-pink-500/10'
                            : 'bg-white/10 border-white/20 text-white/50'
                    }`}
                >
                    <Power size={14} />
                    {isOn ? 'ON' : 'OFF'}
                </button>
                <button
                    onClick={() => setShowControls(!showControls)}
                    aria-label={showControls ? 'Fechar configurações' : 'Abrir configurações'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                        showControls
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-pink-500/10 hover:bg-pink-500/30 text-pink-300 border-pink-500/20 shadow-pink-900/20'
                    }`}
                >
                    {showControls ? <X size={20} /> : <Settings2 size={20} />}
                </button>
            </div>

            {/* Container da Placa */}
            <div className="relative z-10 p-8 md:p-16 border-4 border-slate-800/80 bg-black/40 backdrop-blur-sm rounded-3xl shadow-2xl transition-all duration-500">

                {/* Parafusos Decorativos */}
                <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-slate-700 shadow-inner border border-slate-900" />
                <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-slate-700 shadow-inner border border-slate-900" />
                <div className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-slate-700 shadow-inner border border-slate-900" />
                <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-slate-700 shadow-inner border border-slate-900" />

                <h1
                    className={`
            text-center leading-none transition-all duration-300 break-words max-w-[90vw]
            ${flicker && isOn ? 'animate-neon-flicker' : ''}
            ${fontMode === 'modern' ? 'font-neon-modern font-black tracking-tighter' : 'font-neon-retro tracking-widest font-normal'}
          `}
                    style={{
                        fontSize: 'clamp(3rem, 15vw, 9rem)',
                        ...neonStyle
                    }}
                >
                    {text || "OFFLINE"}
                </h1>

                {/* Reflexo no vidro da caixa */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            </div>

            {/* Z3 — painel de configuração */}
            <NeonControls
                text={text} setText={setText}
                color={color} setColor={setColor}
                flicker={flicker} setFlicker={setFlicker}
                fontMode={fontMode} setFontMode={setFontMode}
                show={showControls}
            />

            {/* Z1 — identidade */}
            <LabCaption
                title="Neon Sign"
                subtitle="Eletricidade . Brilho Luminescente"
                titleClassName="text-pink-100"
                subtitleClassName="text-pink-200"
            />

            {/* Z4 — dica/status */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30">
                {isOn ? 'Personalize o texto e a cor nos controles' : 'Ligue a energia para acender a placa'}
            </div>
        </div>
    );
}