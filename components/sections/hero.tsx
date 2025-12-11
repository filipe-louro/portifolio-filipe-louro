"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

interface HeroSectionProps {
    setActiveTab: (tab: string) => void;
}

export const HeroSection = ({ setActiveTab }: HeroSectionProps) => {
    const { scrollY } = useScroll();

    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const stack = ["Next.js", "React", "Node.js", "Laravel", "Flutter"];

    return (
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-visible px-6 pt-20">
            <motion.div
                style={{ y: y1, opacity }}
                className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
            />

            <motion.div
                style={{ y: y2, opacity }}
                className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"
            />

            <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-200 text-sm font-medium tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400"></span>
                    </span>
                    Available for new projects
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Building Scalable <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-400 animate-gradient-x bg-300%">
                        Digital Solutions
                    </span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    Full Stack Web Engineer specializing in high-performance e-commerce and SaaS platforms.
                    Merging <b className="text-white">Next.js</b> efficiency with robust <b className="text-white">Laravel</b> architectures.
                </motion.p>

                <motion.div
                    className="flex flex-wrap justify-center gap-3 mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {stack.map((tech, i) => (
                        <span key={tech} className="px-4 py-1.5 text-xs font-mono text-slate-300 bg-slate-900/40 border border-slate-700/50 rounded-lg hover:border-violet-500/50 hover:bg-violet-500/10 transition-colors cursor-default">
                            {tech}
                        </span>
                    ))}
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-bold overflow-hidden shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_-10px_rgba(139,92,246,0.5)] transition-all transform hover:scale-105 active:scale-95"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-200 via-cyan-200 to-violet-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                            View Work <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <div className="flex items-center justify-center gap-6 px-6">
                        <Link href="https://github.com/filipe-louro" target="_blank" className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                            <Github size={24} />
                        </Link>
                        <Link href="https://www.linkedin.com/in/filipe-amaral-louro" target="_blank" className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                            <Linkedin size={24} />
                        </Link>
                        <button onClick={() => setActiveTab('contact')} className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                            <Mail size={24} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};