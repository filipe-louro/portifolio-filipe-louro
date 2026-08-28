"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Keyboard, ArrowRight, Zap, Mountain, CircleDashed, Atom, Waves } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface LabCard {
    slug: string;
    title: string;
    description: string;
    action: string;
    icon: ReactNode;
    accentText: string;
    accentBorder: string;
}

const LABS: LabCard[] = [
    {
        slug: 'keyboard',
        title: 'RGB Keyboard Engine',
        description: 'Teclado interativo 3D com efeitos de iluminação procedurais e resposta ao toque.',
        action: 'Testar Componente',
        icon: <Keyboard size={24} />,
        accentText: 'text-cyan-400',
        accentBorder: 'hover:border-cyan-500/50',
    },
    {
        slug: 'orbit',
        title: 'Orbital Field Simulator',
        description: 'Simulador de partículas interativo com campos gravitacionais e eletromagnéticos.',
        action: 'Iniciar Simulação',
        icon: <Atom size={24} className="animate-spin-slow" />,
        accentText: 'text-blue-400',
        accentBorder: 'hover:border-blue-500/50',
    },
    {
        slug: 'blackhole',
        title: 'Interstellar Gargantua',
        description: 'Simulação física de um buraco negro utilizando Raymarching e WebGL 2.0.',
        action: 'Entrar no Horizonte',
        icon: <CircleDashed size={24} className="animate-spin-slow" />,
        accentText: 'text-orange-400',
        accentBorder: 'hover:border-orange-500/50',
    },
    {
        slug: 'matrix',
        title: 'Matrix Digital Rain',
        description: 'Chuva de códigos procedurais com efeito de profundidade 3D (Parallax) e renderização otimizada.',
        action: 'Hack the Mainframe',
        icon: <span className="font-mono text-xl font-bold">ｵ</span>,
        accentText: 'text-green-400',
        accentBorder: 'hover:border-green-500/50',
    },
    {
        slug: 'explosion',
        title: 'Particle Text Physics',
        description: 'Manipulação de pixels via Canvas API com física de repulsão e reconstrução em tempo real.',
        action: 'Testar Componente',
        icon: <Zap size={24} />,
        accentText: 'text-yellow-400',
        accentBorder: 'hover:border-yellow-500/50',
    },
    {
        slug: 'vaporwave',
        title: 'Retro Vaporwave',
        description: 'Cena procedural "Outrun" dos anos 80 renderizada puramente em Canvas 2D sem assets de imagem.',
        action: 'Testar Componente',
        icon: <Mountain size={24} />,
        accentText: 'text-fuchsia-400',
        accentBorder: 'hover:border-fuchsia-500/50',
    },
    {
        slug: 'neon',
        title: 'Neon Sign Generator',
        description: 'Gerador de letreiros neon realista com efeitos de luz CSS3 e simulação de eletricidade.',
        action: 'Customizar Placa',
        icon: <span className="font-bold text-lg border-2 border-pink-400 rounded px-1">Ne</span>,
        accentText: 'text-pink-400',
        accentBorder: 'hover:border-pink-500/50',
    },
    {
        slug: 'fluid',
        title: 'Fluid Simulation',
        description: 'Simulação de fluidos em tempo real utilizando GPU, com interação física através do mouse e controles de viscosidade, pressão e vorticidade.',
        action: 'Perturbar o Fluido',
        icon: <Waves size={24} />,
        accentText: 'text-teal-400',
        accentBorder: 'hover:border-teal-500/50',
    },
];

export const LabGrid = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-violet-500/30 font-sans relative overflow-hidden">
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="fixed top-1/4 left-10 w-24 h-24 border border-white/5 rounded-2xl rotate-12 backdrop-blur-sm pointer-events-none" />

            <div className="relative z-10 pt-24 px-6 max-w-6xl mx-auto pb-20">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-white mb-3"
                >
                    Lab & Playground
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-slate-400 max-w-2xl mb-10"
                >
                    Experiências visuais interativas construídas à mão com Canvas 2D e WebGL 2.0 — sem engines, sem assets, só código.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {LABS.map((lab) => (
                        <Link key={lab.slug} href={`/playground/${lab.slug}`}>
                            <SpotlightCard className={`h-64 p-6 flex flex-col justify-between ${lab.accentBorder} transition-colors cursor-pointer bg-slate-900/50 backdrop-blur-sm`}>
                                <div>
                                    <div className={`bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${lab.accentText}`}>
                                        {lab.icon}
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2">{lab.title}</h2>
                                    <p className="text-slate-400 text-sm">
                                        {lab.description}
                                    </p>
                                </div>
                                <div className={`flex items-center ${lab.accentText} text-sm font-medium mt-4`}>
                                    {lab.action} <ArrowRight size={16} className="ml-2" />
                                </div>
                            </SpotlightCard>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
