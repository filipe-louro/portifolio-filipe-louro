"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
    setActiveTab: (tab: string) => void;
}

export const HeroSection = ({ setActiveTab }: HeroSectionProps) => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
            <motion.div style={{ y: y1 }} className="absolute top-20 left-10 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
            <motion.div style={{ y: y2 }} className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]" />

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold tracking-wide uppercase"
                >
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    Available for new projects
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Crafting Digital <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 animate-gradient-x">
            Experiences
          </span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Senior Creative Developer especializado em interfaces de alta conversão.
                    Transformo ideias complexas em interações fluidas com Next.js e Motion.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <button
                        onClick={() => setActiveTab('contact')}
                        className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-bold overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-300 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center gap-2">
              Iniciar Projeto <ArrowRight size={18} />
            </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className="px-8 py-4 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                    >
                        Ver Portfolio
                    </button>
                </motion.div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-24 h-24 border border-white/5 rounded-2xl rotate-12 backdrop-blur-sm" />
                <div className="absolute bottom-1/3 right-20 w-32 h-32 border border-white/5 rounded-full backdrop-blur-sm" />
            </div>
        </section>
    );
};