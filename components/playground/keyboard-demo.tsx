"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Waves,
    ScanLine,
    MousePointer2,
    Power,
    X,
    Activity,
    Smartphone,
    RotateCw,
    ArrowLeft,
    ArrowRight,
    Sliders,
    Palette,
    Aperture
} from 'lucide-react';

type RGBMode = 'wave' | 'breathing' | 'static' | 'scan' | 'reactive';
type RGBDirection = 'ltr' | 'rtl';
type StaticType = 'solid' | 'gradient';

interface RGBConfig {
    mode: RGBMode;
    direction: RGBDirection;
    staticType: StaticType;
    speed: number;
    brightness: number;
    primaryHue: number;
    isPanelOpen: boolean;
    isOn: boolean;
}

const GlobalStyles = () => (
    <style>{`
    .glass-panel {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    
    .key-cap {
      background: #0f172a;
      box-shadow: 
        inset 0 1px 0 rgba(255,255,255,0.1),
        0 4px 0 #020617,
        0 5px 8px rgba(0,0,0,0.6);
      transition: transform 0.05s ease, box-shadow 0.05s ease;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .key-cap:active, .key-cap.active {
      transform: translateY(4px);
      box-shadow: 
        inset 0 2px 5px rgba(0,0,0,0.5),
        0 0 0 #020617,
        0 0 0 rgba(0,0,0,0);
    }

    /* Custom Range Slider styling */
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
    }
    input[type=range]:focus {
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 14px;
      width: 14px;
      border-radius: 50%;
      background: #22d3ee;
      cursor: pointer;
      margin-top: -5px;
      box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
      transition: transform 0.1s, background 0.2s;
    }
    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      background: #67e8f9;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      cursor: pointer;
      background: #334155;
      border-radius: 2px;
    }
  `}</style>
);

const KEY_LAYOUT = [
    ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'DEL'],
    ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],
    ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],
    ['CTRL', 'WIN', 'ALT', 'SPACE', 'ALT', 'FN', 'MENU', 'CTRL']
];

const KeyboardApp = ({ config, setConfig }: { config: RGBConfig, setConfig: React.Dispatch<React.SetStateAction<RGBConfig>> }) => {
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
    const keyRefs = useRef<Map<string, { el: HTMLDivElement, label: string }>>(new Map());
    const requestRef = useRef<number>(0);
    const timeRef = useRef(0);
    const ripplesRef = useRef<{ key: string, x: number, y: number, time: number }[]>([]);

    const playClick = () => { if (navigator.vibrate) navigator.vibrate(5); };

    // --- ANIMATION ENGINE ---
    const animate = useCallback(() => {
        timeRef.current += config.speed * 0.5;
        const time = timeRef.current;
        const now = Date.now();

        // Limpa ripples antigos
        ripplesRef.current = ripplesRef.current.filter(r => now - r.time < 600);

        keyRefs.current.forEach(({ el, label }) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let h = 0, s = 100, l = 50;

            // Calcula cor base baseada no modo
            if (config.mode === 'wave') {
                const spatial = config.direction === 'ltr' ? centerX * 0.5 : -centerX * 0.5;
                h = (time + spatial) % 360;
                l = 60;
            } else if (config.mode === 'breathing') {
                const wave = Math.sin(time * 0.05);
                h = config.primaryHue + (wave * 20);
                l = 40 + (wave * 20);
            } else if (config.mode === 'static') {
                if (config.staticType === 'gradient') {
                    // Gradient estático baseado na posição X
                    const spatial = config.direction === 'ltr' ? centerX * 0.5 : -centerX * 0.5;
                    h = spatial % 360;
                    l = 60;
                } else {
                    // Cor sólida definida pelo slider
                    h = config.primaryHue;
                    l = 50;
                }
            } else if (config.mode === 'scan') {
                const screenW = window.innerWidth;
                const pos = (Math.sin(time * 0.02) + 1) / 2 * screenW;
                const dist = Math.abs(centerX - pos);
                const intensity = Math.max(0, 1 - dist / 150);
                h = config.primaryHue;
                l = intensity * 60;
            } else if (config.mode === 'reactive') {
                h = config.primaryHue;
                l = 5;
            }

            // Calcula overlay de Ripple (efeito de clique)
            let rippleAdd = 0;
            ripplesRef.current.forEach(ripple => {
                const dist = Math.hypot(centerX - ripple.x, centerY - ripple.y);
                const age = now - ripple.time;
                const radius = age * 2.5;
                const intensity = Math.max(0, 1 - Math.abs(dist - radius) / 60) * (1 - age / 600);
                rippleAdd += intensity;
            });

            // Se estiver desligado, apaga tudo (l=0)
            if (!config.isOn) {
                l = 0;
                rippleAdd = 0;
            }

            const finalL = Math.min(100, (l * (config.brightness / 100)) + (rippleAdd * 100));
            const finalS = Math.max(0, s - (rippleAdd * 100));
            const color = `hsl(${h}, ${finalS}%, ${finalL}%)`;

            // Aplica estilos diretamente ao DOM para performance
            el.style.color = rippleAdd > 0.2 ? '#000' : color;
            el.style.borderColor = color;

            const isActive = activeKeys.has(label);
            // Só ilumina (sombra) se:
            // 1. Não é modo reativo OU tem ripple passando OU tecla está ativa
            // 2. E o teclado está LIGADO
            const isLit = (config.mode !== 'reactive' || rippleAdd > 0 || isActive) && config.isOn;

            if (isLit) {
                el.style.boxShadow = isActive
                    ? `inset 0 2px 5px rgba(0,0,0,0.5), 0 0 0 #020617`
                    : `inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 0 #020617, 0 5px 8px rgba(0,0,0,0.5), 0 0 15px ${color}`;
            } else {
                el.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 0 #020617, 0 5px 8px rgba(0,0,0,0.6)`;
            }
            el.style.textShadow = isLit ? `0 0 5px ${color}` : 'none';
        });

        requestRef.current = requestAnimationFrame(animate);
    }, [config, activeKeys]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [animate]);

    const triggerKey = (key: string, x: number, y: number) => {
        if (key === 'PWR') {
            setConfig(prev => ({ ...prev, isOn: !prev.isOn }));
            setActiveKeys(prev => new Set(prev).add(key));
            playClick();
            // Retorna aqui para NÃO adicionar ripple no array
            return;
        }

        setActiveKeys(prev => new Set(prev).add(key));
        playClick();

        // Só adiciona ripple se estiver ligado
        if (config.isOn) {
            ripplesRef.current.push({ key, x, y, time: Date.now() });
        }
    };

    const releaseKey = (key: string) => {
        setActiveKeys(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    };

    // Listeners globais de teclado físico
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase() === ' ' ? 'SPACE' : e.key.toUpperCase();
            const entry = Array.from(keyRefs.current.values()).find(v => v.label === key);
            if (entry) {
                const rect = entry.el.getBoundingClientRect();
                triggerKey(key, rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase() === ' ' ? 'SPACE' : e.key.toUpperCase();
            releaseKey(key);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [config.isOn]);

    return (
        <div className="relative w-full h-full flex items-center justify-center select-none">
            {/* Aviso Mobile Portrait */}
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 md:hidden portrait:flex landscape:hidden">
                <div className="mb-6 p-4 bg-cyan-500/10 rounded-full animate-pulse">
                    <RotateCw size={48} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Melhor Experiência na Horizontal</h2>
                <p className="text-slate-400">Gire seu dispositivo para usar o teclado RGB completo.</p>
                <Smartphone className="mt-8 text-slate-600 rotate-90" size={32} />
            </div>

            {/* Container do Teclado */}
            <div className="hidden md:flex portrait:hidden landscape:flex items-center justify-center w-full h-full">
                <div className="relative p-3 md:p-8 pt-12 md:pt-24 bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-700 shadow-2xl transition-transform origin-center scale-[0.5] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 xl:scale-100">

                    {/* Header: Título + Botão Power alinhados */}
                    <div className="absolute top-0 left-0 w-full h-16 md:h-24 flex items-center justify-center px-8">
                        {/* Título Centralizado */}
                        <div className="text-slate-500 font-mono text-[10px] md:text-xs tracking-[0.5em] whitespace-nowrap select-none">
                            FL-MECHANICAL // RGB_OS
                        </div>

                        {/* Botão Power no Canto Direito */}
                        <div
                            className="absolute right-8 top-1/2 -translate-y-1/2 w-10 h-8 md:w-14 md:h-10 rounded md:rounded-md flex items-center justify-center text-[10px] md:text-xs font-bold cursor-pointer key-cap text-slate-400 overflow-hidden"
                            ref={el => { if (el) keyRefs.current.set('PWR-BTN', { el, label: 'PWR' }); }}
                            onPointerDown={(e) => {
                                e.currentTarget.setPointerCapture(e.pointerId);
                                triggerKey('PWR', e.clientX, e.clientY);
                            }}
                            onPointerUp={() => releaseKey('PWR')}
                            onPointerLeave={() => releaseKey('PWR')}
                        >
                            <Power size={16} className={config.isOn ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" : "text-slate-700"} />
                        </div>
                    </div>

                    {/* Teclas */}
                    {KEY_LAYOUT.map((row, rI) => (
                        <div key={rI} className="flex justify-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                            {row.map((key, kI) => {
                                const width = key === 'SPACE' ? 'w-40 md:w-64' : key.length > 1 ? 'w-10 md:w-16' : 'w-8 md:w-12';
                                const height = 'h-10 md:h-12';
                                const uniqueId = `${rI}-${kI}`;
                                return (
                                    <div
                                        key={uniqueId}
                                        ref={el => { if (el) keyRefs.current.set(uniqueId, { el, label: key }); }}
                                        onPointerDown={(e) => {
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                            triggerKey(key, e.clientX, e.clientY);
                                        }}
                                        onPointerUp={() => releaseKey(key)}
                                        onPointerLeave={() => releaseKey(key)}
                                        className={`${width} ${height} rounded md:rounded-md flex items-center justify-center text-[10px] md:text-xs font-bold cursor-pointer key-cap text-slate-400 relative overflow-hidden`}
                                    >
                                        <span className="relative z-10 pointer-events-none">{key}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Painel Lateral de Configurações (Floating Phone Style) */}
            <AnimatePresence>
                {config.isPanelOpen && (
                    <>
                        {/* Backdrop */}
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
                            // Styles: Floating, Rounded Corners, Device-like Border
                            className="fixed right-4 top-4 bottom-4 md:right-8 md:top-8 md:bottom-8 w-[calc(100%-2rem)] md:w-96 glass-panel z-50 flex flex-col rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl"
                            style={{ maxHeight: 'calc(100vh - 4rem)' }}
                        >
                            {/* Cabeçalho do Menu */}
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

                            {/* Conteúdo Scrollável */}
                            <div className="p-6 space-y-8 overflow-y-auto flex-1 scrollbar-hide">

                                {/* Seção de Modos */}
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
                                                className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                                                    config.mode === m.id
                                                        ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-white/10 hover:text-slate-300'
                                                }`}
                                            >
                                                <m.icon size={20} className={`mb-2 transition-transform duration-300 ${config.mode === m.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                                                <span className="text-[10px] font-mono font-bold tracking-wider">{m.label}</span>

                                                {/* Indicador Ativo */}
                                                {config.mode === m.id && (
                                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Seção de Tipo de Estático (Static Type) */}
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
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                                                        config.staticType === type.id
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

                                {/* Seção de Direção (Condicional) */}
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
                                                    className={`flex-1 flex items-center justify-center py-3 rounded-lg transition-all ${
                                                        config.direction === dir.id
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

                                {/* Seção de Sliders */}
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

                                {/* Seção de Cor (Condicional) */}
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

                            {/* Rodapé do Menu */}
                            <div className="p-4 border-t border-white/5 bg-black/20 text-center">
                                <span className="text-[10px] font-mono text-slate-600">v3.0.1 // STABLE BUILD</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Botão Flutuante de Configurações */}
            {!config.isPanelOpen && (
                <motion.button
                    layoutId="settings-trigger"
                    onClick={() => setConfig(p => ({ ...p, isPanelOpen: true }))}
                    className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-full flex items-center justify-center backdrop-blur hover:bg-cyan-500/20 z-40 shadow-[0_0_15px_rgba(6,182,212,0.3)] hidden md:flex portrait:hidden landscape:flex"
                >
                    <Settings size={20} className="animate-spin-slow" />
                </motion.button>
            )}
        </div>
    );
};

export default function KeyboardDemo() {
    const [config, setConfig] = useState<RGBConfig>({
        mode: 'wave',
        direction: 'ltr',
        staticType: 'solid',
        speed: 5,
        brightness: 100,
        primaryHue: 280,
        isPanelOpen: false,
        isOn: true
    });

    return (
        <>
            <GlobalStyles />
            <KeyboardApp config={config} setConfig={setConfig} />
        </>
    );
}