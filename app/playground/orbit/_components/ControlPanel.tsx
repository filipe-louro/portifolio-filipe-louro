"use client";

import React from 'react';
import { OrbitConfig } from '../_utils/types';

interface ControlSliderProps {
    label: string;
    name: keyof OrbitConfig;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (name: keyof OrbitConfig, value: number) => void;
    unit: string;
    isColor?: boolean;
}

const ControlSlider = ({ label, name, value, min, max, step, onChange, unit, isColor }: ControlSliderProps) => (
    <div className="mb-4">
        <div className="flex justify-between mb-2 items-center">
            <label htmlFor={name} className="text-xs font-bold text-blue-200 uppercase tracking-widest opacity-80">{label}</label>
            <span
                className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/20"
                style={isColor ? { color: `hsl(${value}, 100%, 70%)`, borderColor: `hsl(${value}, 100%, 30%)` } : {}}
            >
        {isColor ? 'Cor' : value.toFixed(1)}{unit}
      </span>
        </div>
        <input
            type="range" id={name} name={name}
            min={min} max={max} step={step}
            value={value} onChange={(e) => onChange(name, parseFloat(e.target.value))}
            style={isColor ? { backgroundImage: 'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))', height: '6px', borderRadius: '3px' } : {}}
            className={isColor ? "appearance-none w-full h-1 bg-transparent rounded-lg cursor-pointer" : ""}
        />
    </div>
);

interface PanelProps {
    config: OrbitConfig;
    setConfig: React.Dispatch<React.SetStateAction<OrbitConfig>>;
    show: boolean;
}

export const ControlPanel = ({ config, setConfig, show }: PanelProps) => {
    const handleChange = (name: keyof OrbitConfig, value: number) => {
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={`absolute md:right-6 right-0 md:top-24 bottom-0 md:bottom-auto md:w-80 w-full transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-20 ${show ? 'translate-y-0 md:translate-x-0 opacity-100' : 'translate-y-full md:translate-y-0 md:translate-x-[120%] opacity-0 pointer-events-none'}`}>
            <div className="glass-panel md:rounded-2xl rounded-t-2xl p-6 h-auto max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 md:hidden">
                    <span className="text-sm font-bold text-blue-200">PARÂMETROS</span>
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto"></div>
                </div>

                <ControlSlider label="Intensidade do Campo" name="gravityStrength" value={config.gravityStrength} min={0.1} max={3.0} step={0.1} unit="G" onChange={handleChange} />
                <ControlSlider label="Momento Angular" name="initialVelocity" value={config.initialVelocity} min={0} max={3.0} step={0.1} unit="rad" onChange={handleChange} />
                <ControlSlider label="Dispersão Inicial" name="initialSpread" value={config.initialSpread} min={50} max={800} step={50} unit="px" onChange={handleChange} />
                <ControlSlider label="Tamanho do Núcleo" name="coreSize" value={config.coreSize} min={5} max={50} step={1} unit="px" onChange={handleChange} />
                <ControlSlider label="Força de Interação" name="repulsionStrength" value={config.repulsionStrength} min={0.5} max={5.0} step={0.5} unit="" onChange={handleChange} />
                <ControlSlider label="Rastro Visual" name="tailLength" value={config.tailLength} min={0.5} max={0.99} step={0.01} unit="%" onChange={handleChange} />
                <div className="my-4 border-t border-white/10"></div>
                <ControlSlider label="Cor das Partículas" name="particleHue" value={config.particleHue} min={0} max={360} step={1} unit="" isColor={true} onChange={handleChange} />
                <ControlSlider label="Cor do Núcleo" name="coreHue" value={config.coreHue} min={0} max={360} step={1} unit="" isColor={true} onChange={handleChange} />

                <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-blue-300/50 leading-relaxed">
                    Dica: Use o botão no topo esquerdo para alternar entre empurrar (repulsão) ou puxar (atração) as partículas com o toque.
                </div>
            </div>
        </div>
    );
};