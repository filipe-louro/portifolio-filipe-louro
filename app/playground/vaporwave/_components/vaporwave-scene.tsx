"use client";

import React, { useRef } from 'react';
import { useVaporwaveEngine } from '@/app/playground/vaporwave/_hooks/use-vaporwave-engine';
import { LabCaption } from '@/components/lab-caption';

export default function VaporwaveCityScene() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useVaporwaveEngine(canvasRef);

    return (
        <div className="fixed inset-0 w-full h-full bg-slate-950 overflow-hidden select-none">
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                style={{ transform: 'translateZ(0)' }}
            />

            {/* Z1 — identidade */}
            <LabCaption
                title="Retro Vaporwave"
                subtitle="Cena Procedural Outrun . Canvas 2D"
                titleClassName="text-fuchsia-100"
                subtitleClassName="text-fuchsia-200"
            />

            {/* Z4 — dica/status */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] uppercase tracking-widest text-white/30 text-center">
                Mova o cursor para pilotar // Segure o clique para turbo
            </div>
        </div>
    );
}