"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, FlaskConical, Github } from "lucide-react";

const EXPERIMENT_NAMES: Record<string, string> = {
    keyboard: "RGB Keyboard",
    explosion: "Particle Physics",
    vaporwave: "Retro Vaporwave",
    blackhole: "Interstellar Gargantua",
    matrix: "Matrix Effect",
    orbit: "Orbital Field",
    neon: "Neon Generator",
    fluid: "Fluid Simulation",
};

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const pathSegments = pathname.split("/").filter(Boolean);
    const currentExperimentSlug = pathSegments[1];
    const experimentName = pathname.startsWith("/playground")
        ? EXPERIMENT_NAMES[currentExperimentSlug]
        : undefined;

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-slate-950/50 backdrop-blur-md shadow-lg shadow-violet-500/10 text-sm font-mono tracking-wide">
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors font-medium"
                    aria-label="Voltar ao índice do Lab"
                >
                    <FlaskConical size={14} />
                    <span>LOURO LAB</span>
                </button>

                <AnimatePresence>
                    {experimentName && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            className="flex items-center gap-2"
                        >
                            <ChevronRight size={12} className="text-slate-600" />
                            <span className="text-cyan-300 font-bold uppercase text-xs drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                                {experimentName}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <span className="w-px h-4 bg-white/10 mx-1" />

                <a
                    href="https://github.com/filipe-louro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label="GitHub de Filipe Louro"
                >
                    <Github size={16} />
                </a>
            </div>
        </motion.nav>
    );
};
