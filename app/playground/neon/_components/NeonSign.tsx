"use client";

import React from 'react';
import { Background } from './Background';
import { NeonControls } from './NeonControls';
import { NeonStyles } from './NeonStyles';
import { useNeonState } from '../_hooks/useNeonState';

export default function NeonSign() {
    const {
        text, setText, color, setColor, isOn, setIsOn,
        flicker, setFlicker, fontMode, setFontMode, neonStyle
    } = useNeonState();

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center select-none">
            <NeonStyles />
            <Background />

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

            <NeonControls
                text={text} setText={setText}
                color={color} setColor={setColor}
                isOn={isOn} setIsOn={setIsOn}
                flicker={flicker} setFlicker={setFlicker}
                fontMode={fontMode} setFontMode={setFontMode}
            />
        </div>
    );
}