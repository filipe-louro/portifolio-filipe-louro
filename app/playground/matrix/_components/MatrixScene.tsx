"use client";

import React, { useRef, useState } from 'react';
import { useMatrixWarp } from '../_hooks/useMatrixWarp';

const PRESET_COLORS = [
    { name: 'Matrix Green', val: '#00ff00' },
    { name: 'Cyber Blue', val: '#00e0ff' },
    { name: 'System Red', val: '#ff0000' },
    { name: 'Golden Source', val: '#ffd700' }
];

export const MatrixScene = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [color, setColor] = useState('#00ff00');

    useMatrixWarp(canvasRef, containerRef, color);

    const isCustomColor = !PRESET_COLORS.some((c) => c.val === color);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden font-sans">
            {/* Container e Canvas */}
            <div ref={containerRef} className="absolute inset-0">
                <canvas ref={canvasRef} className="block" />
            </div>

            {/* Overlay de Texto */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 text-white mix-blend-difference">
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 opacity-90 animate-pulse">
                    NEO REALITY
                </h1>
                <p className="text-sm md:text-lg tracking-[0.5em] uppercase opacity-70">
                    System Override Active
                </p>
            </div>

            {/* Controles de Cor */}
            <div className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-auto px-4">
                <div className="flex items-center gap-4 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c.name}
                            onClick={() => setColor(c.val)}
                            className="w-6 h-6 rounded-full border border-white/30 transition-all hover:scale-125 hover:border-white"
                            style={{
                                backgroundColor: c.val,
                                boxShadow: color === c.val ? `0 0 15px ${c.val}` : 'none',
                                transform: color === c.val ? 'scale(1.2)' : 'scale(1)'
                            }}
                            title={c.name}
                        />
                    ))}

                    <span className="w-px h-5 bg-white/15" />

                    <label
                        className="relative w-6 h-6 rounded-full border border-white/30 cursor-pointer transition-all hover:scale-125 hover:border-white"
                        style={{
                            background: isCustomColor
                                ? color
                                : 'conic-gradient(#ff0040, #ffd700, #00ff00, #00e0ff, #4000ff, #ff00c0, #ff0040)',
                            boxShadow: isCustomColor ? `0 0 15px ${color}` : 'none',
                            transform: isCustomColor ? 'scale(1.2)' : 'scale(1)'
                        }}
                        title="Cor personalizada (RGB completo)"
                    >
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            aria-label="Escolher cor personalizada da chuva"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </label>

                    <span className="font-mono text-[10px] tracking-widest text-white/50 uppercase w-16 text-center">
                        {color}
                    </span>
                </div>
            </div>

            {/* Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10"></div>
        </div>
    );
};