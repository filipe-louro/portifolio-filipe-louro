"use client";

import React, { useRef, useState } from 'react';
import { OrbitStyles } from './OrbitStyles';
import { ControlPanel } from './ControlPanel';
import { IconSettings, IconPlay, IconPause, IconRefresh, IconClose, IconMagnet, IconRepel } from './OrbitIcons';
import { useOrbitalPhysics } from '../_hooks/useOrbitalPhysics';
import { INITIAL_CONFIG, OrbitConfig } from '../_utils/types';
import { LabCaption } from '@/components/lab-caption';

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

            {/* Z2 — ações primárias */}
            <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
                <button
                    onClick={() => setInteractionMode(prev => prev === 'repulse' ? 'attract' : 'repulse')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-sm transition-all shadow-lg ${interactionMode === 'repulse' ? 'bg-blue-500/20 border-blue-400/30 text-blue-200 shadow-blue-500/10' : 'bg-fuchsia-500/20 border-fuchsia-400/30 text-fuchsia-200 shadow-fuchsia-500/10'}`}
                >
                    {interactionMode === 'repulse' ? <IconRepel size={14} /> : <IconMagnet size={14} />}
                    {interactionMode === 'repulse' ? 'Repelir' : 'Atrair'}
                </button>
                <button
                    onClick={() => { setConfig(INITIAL_CONFIG); initParticles(); }}
                    aria-label="Reiniciar simulação"
                    className="p-3 bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 rounded-full backdrop-blur-md border border-blue-500/20 transition-all active:scale-90 shadow-lg shadow-blue-900/20"
                >
                    <IconRefresh size={20} />
                </button>
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    aria-label={isRunning ? 'Pausar simulação' : 'Retomar simulação'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${isRunning ? 'bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 border-blue-500/20 shadow-blue-900/20' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 shadow-emerald-900/20'}`}
                >
                    {isRunning ? <IconPause size={20} /> : <IconPlay size={20} />}
                </button>
                <button
                    onClick={() => setShowControls(!showControls)}
                    aria-label={showControls ? 'Fechar parâmetros' : 'Abrir parâmetros'}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg ${showControls ? 'bg-white/20 text-white border-white/30' : 'bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 border-blue-500/20'}`}
                >
                    {showControls ? <IconClose size={20} /> : <IconSettings size={20} />}
                </button>
            </div>

            {/* Z1 — identidade */}
            <LabCaption
                title="Orbital Field"
                subtitle="Simulação de Partículas . Campo Gravitacional"
                titleClassName="text-blue-100"
                subtitleClassName="text-blue-200"
            />

            {/* Z4 — dica de interação */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30">
                {interactionMode === 'repulse' ? 'Arraste para afastar as partículas' : 'Arraste para puxar as partículas'}
            </div>

            {/* Z3 — painel de configuração */}
            <ControlPanel config={config} setConfig={setConfig} show={showControls} />
        </div>
    );
}
