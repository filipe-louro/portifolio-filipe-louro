"use client";

import React, { useRef, useState } from 'react';
import { OrbitStyles } from './OrbitStyles';
import { ControlPanel } from './ControlPanel';
import { IconSettings, IconPlay, IconPause, IconRefresh, IconClose, IconMagnet, IconRepel } from './OrbitIcons';
import { useOrbitalPhysics } from '../_hooks/useOrbitalPhysics';
import { INITIAL_CONFIG, OrbitConfig } from '../_utils/types';

export default function OrbitScene() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [config, setConfig] = useState<OrbitConfig>(INITIAL_CONFIG);
    const [isRunning, setIsRunning] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [interactionMode, setInteractionMode] = useState<'repulse' | 'attract'>('repulse');

    const { initParticles, handlePointerDown, handlePointerUp, handlePointerMove } = useOrbitalPhysics(canvasRef, config, isRunning, interactionMode);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans antialiased text-white select-none">
            <OrbitStyles />

            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 block z-0 cursor-crosshair"
                style={{ width: '100%', height: '100%' }}
                onMouseDown={handlePointerDown}
                onMouseUp={handlePointerUp}
                onMouseMove={handlePointerMove}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchEnd={handlePointerUp}
                onTouchMove={handlePointerMove}
            />

            <div className="absolute top-0 left-0 w-full p-4 z-10 pointer-events-none flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-400 glow-text">
                        Campo Eletromagnético
                    </h1>

                    <div className="mt-3 flex items-center gap-3 pointer-events-auto">
                        <button
                            onClick={() => setInteractionMode(prev => prev === 'repulse' ? 'attract' : 'repulse')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-sm transition-all shadow-lg ${interactionMode === 'repulse' ? 'bg-blue-500/20 border-blue-400/30 text-blue-200 shadow-blue-500/10' : 'bg-fuchsia-500/20 border-fuchsia-400/30 text-fuchsia-200 shadow-fuchsia-500/10'}`}
                        >
                            {interactionMode === 'repulse' ? <IconRepel size={14} /> : <IconMagnet size={14} />}
                            {interactionMode === 'repulse' ? 'Modo: Repelir' : 'Modo: Atrair'}
                        </button>
                        <span className="text-[10px] text-white/40 hidden sm:block">
                  {interactionMode === 'repulse' ? '(Clique para afastar)' : '(Clique para puxar)'}
               </span>
                    </div>
                </div>

                <div className="flex gap-3 pointer-events-auto">
                    <button onClick={() => { setConfig(INITIAL_CONFIG); initParticles(); }} className="p-3 bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 rounded-full backdrop-blur-md border border-blue-500/20 transition-all active:scale-90 shadow-lg shadow-blue-900/20">
                        <IconRefresh size={20} />
                    </button>
                    <button onClick={() => setIsRunning(!isRunning)} className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${isRunning ? 'bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 border-blue-500/20 shadow-blue-900/20' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 shadow-emerald-900/20'}`}>
                        {isRunning ? <IconPause size={20} /> : <IconPlay size={20} />}
                    </button>
                    <button onClick={() => setShowControls(!showControls)} className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${showControls ? 'bg-white/20 text-white border-white/30' : 'bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 border-blue-500/20'}`}>
                        {showControls ? <IconClose size={20} /> : <IconSettings size={20} />}
                    </button>
                </div>
            </div>

            <ControlPanel config={config} setConfig={setConfig} show={showControls} />
        </div>
    );
}