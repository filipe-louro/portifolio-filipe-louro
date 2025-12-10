"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Keyboard, ArrowRight, Zap, Mountain, CircleDashed, Atom } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-violet-500/30 font-sans relative overflow-hidden">
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="fixed top-1/4 left-10 w-24 h-24 border border-white/5 rounded-2xl rotate-12 backdrop-blur-sm pointer-events-none" />

            <div className="relative z-10 pt-24 px-6 max-w-6xl mx-auto pb-20">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-white mb-8"
                >
                    Lab & Playground
                </motion.h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* RGB Keyboard */}
                    <Link href="/playground/keyboard">
                        <SpotlightCard className="h-64 p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-colors cursor-pointer bg-slate-900/50 backdrop-blur-sm">
                            <div>
                                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-cyan-400">
                                    <Keyboard size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">RGB Keyboard Engine</h2>
                                <p className="text-slate-400 text-sm">
                                    Teclado interativo 3D com efeitos de iluminação procedurais e resposta ao toque.
                                </p>
                            </div>
                            <div className="flex items-center text-cyan-400 text-sm font-medium mt-4">
                                Testar Componente <ArrowRight size={16} className="ml-2" />
                            </div>
                        </SpotlightCard>
                    </Link>

                    {/* Orbital Field */}
                    <Link href="/playground/orbit">
                        <SpotlightCard className="h-64 p-6 flex flex-col justify-between hover:border-blue-500/50 transition-colors cursor-pointer bg-slate-900/50 backdrop-blur-sm">
                            <div>
                                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                                    <Atom size={24} className="animate-spin-slow" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Orbital Field Simulator</h2>
                                <p className="text-slate-400 text-sm">
                                    Simulador de partículas interativo com campos gravitacionais e eletromagnéticos.
                                </p>
                            </div>
                            <div className="flex items-center text-blue-400 text-sm font-medium mt-4">
                                Iniciar Simulação <ArrowRight size={16} className="ml-2" />
                            </div>
                        </SpotlightCard>
                    </Link>

                    {/* Black Hole */}
                    <Link href="/playground/blackhole">
                        <SpotlightCard className="h-64 p-6 flex flex-col justify-between hover:border-orange-500/50 transition-colors cursor-pointer bg-slate-900/50 backdrop-blur-sm">
                            <div>
                                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-orange-400">
                                    <CircleDashed size={24} className="animate-spin-slow" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Interstellar Gargantua</h2>
                                <p className="text-slate-400 text-sm">
                                    Simulação física de um buraco negro utilizando Raymarching e WebGL 2.0.
                                </p>
                            </div>
                            <div className="flex items-center text-orange-400 text-sm font-medium mt-4">
                                Entrar no Horizonte <ArrowRight size={16} className="ml-2" />
                            </div>
                        </SpotlightCard>
                    </Link>

                    {/* Matrix Rain */}
                    <Link href="/playground/matrix">
                        <SpotlightCard className="h-64 p-6 flex flex-col justify-between hover:border-green-500/50 transition-colors cursor-pointer bg-slate-900/50 backdrop-blur-sm">
                            <div>
                                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-green-400">
                                    <span className="font-mono text-xl font-bold">ｵ</span>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Matrix Digital Rain</h2>
                                <p className="text-slate-400 text-sm">
                                    Chuva de códigos procedurais com efeito de profundidade 3D (Parallax) e renderização otimizada.
                                </p>
                            </div>
                            <div className="flex items-center text-green-400 text-sm font-medium mt-4">
                                Hack the Mainframe <ArrowRight size={16} className="ml-2" />
                            </div>
                        </SpotlightCard>
                    </Link>

                    {/* Particle Physics */}
                    <Link href="/playground/explosion">
                        <SpotlightCard className="h-64 p-6 flex flex-col justify-between hover:border-yellow-500/50 transition-colors cursor-pointer bg-slate-900/50 backdrop-blur-sm">
                            <div>
                                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-yellow-400">
                                    <Zap size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Particle Text Physics</h2>
                                <p className="text-slate-400 text-sm">
                                    Manipulação de pixels via Canvas API com física de repulsão e reconstrução em tempo real.
                                </p>
                            </div>
                            <div className="flex items-center text-yellow-400 text-sm font-medium mt-4">
                                Testar Componente <ArrowRight size={16} className="ml-2" />
                            </div>
                        </SpotlightCard>
                    </Link>

                    {/* Vaporwave */}
                    <Link href="/playground/vaporwave">
                        <SpotlightCard className="h-64 p-6 flex flex-col justify-between hover:border-fuchsia-500/50 transition-colors cursor-pointer bg-slate-900/50 backdrop-blur-sm">
                            <div>
                                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-fuchsia-400">
                                    <Mountain size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Retro Vaporwave</h2>
                                <p className="text-slate-400 text-sm">
                                    Cena procedurale "Outrun" dos anos 80 renderizada puramente em Canvas 2D sem assets de imagem.
                                </p>
                            </div>
                            <div className="flex items-center text-fuchsia-400 text-sm font-medium mt-4">
                                Testar Componente <ArrowRight size={16} className="ml-2" />
                            </div>
                        </SpotlightCard>
                    </Link>

                    <Link href="/playground/neon">
                        <SpotlightCard className="h-64 p-6 flex flex-col justify-between hover:border-pink-500/50 transition-colors cursor-pointer bg-slate-900/50 backdrop-blur-sm">
                            <div>
                                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-pink-400">
                                    <span className="font-bold text-lg border-2 border-pink-400 rounded px-1">Ne</span>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Neon Sign Generator</h2>
                                <p className="text-slate-400 text-sm">
                                    Gerador de letreiros neon realista com efeitos de luz CSS3 e simulação de eletricidade.
                                </p>
                            </div>
                            <div className="flex items-center text-pink-400 text-sm font-medium mt-4">
                                Customizar Placa <ArrowRight size={16} className="ml-2" />
                            </div>
                        </SpotlightCard>
                    </Link>
                </div>
            </div>
        </div>
    );
}