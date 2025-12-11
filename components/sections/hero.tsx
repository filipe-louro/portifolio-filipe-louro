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
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-6 pt-20">
            {/* Background Elements - Optimized with CSS */}
            <motion.div style={{ y: y1, opacity }} className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
            <motion.div style={{ y: y2, opacity }} className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">

                {/* Status Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-300 text-sm font-medium tracking-wide backdrop-blur-sm"
                >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                    </span>
                    Available for new projects
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Building Scalable <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 animate-gradient-x bg-300%">
                        Digital Solutions
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    Full Stack Web Engineer specializing in high-performance e-commerce and SaaS platforms.
                    Merging <b>Next.js</b> efficiency with robust <b>Laravel</b> architectures.
                </motion.p>

                {/* Tech Stack Pills */}
                <motion.div
                    className="flex flex-wrap justify-center gap-3 mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {stack.map((tech, i) => (
                        <span key={tech} className="px-3 py-1 text-xs font-mono text-slate-300 bg-slate-900/50 border border-slate-800 rounded-md">
                            {tech}
                        </span>
                    ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-bold overflow-hidden shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] transition-all"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-200 to-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                            View Work <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <div className="flex items-center justify-center gap-4 px-6">
                        <Link href="https://github.com/filipe-louro" target="_blank" className="text-slate-400 hover:text-white transition-colors">
                            <Github size={24} />
                        </Link>
                        <Link href="https://www.linkedin.com/in/filipe-amaral-louro" target="_blank" className="text-slate-400 hover:text-white transition-colors">
                            <Linkedin size={24} />
                        </Link>
                        <button onClick={() => setActiveTab('contact')} className="text-slate-400 hover:text-white transition-colors">
                            <Mail size={24} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};