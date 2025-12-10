"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useNav } from "@/components/providers/nav-provider";
import { ChevronRight, FlaskConical } from "lucide-react";

const EXPERIMENT_NAMES: Record<string, string> = {
    keyboard: "RGB Keyboard",
    explosion: "Particle Physics",
    vaporwave: "Retro Vaporwave",
    blackhole: "Interstellar Gargantua",
    matrix: "Matrix Effect",
    orbit: "Orbital Field",
    neon: "Neon Generator",
};

export const Navbar = () => {
    const { activeTab, setActiveTab } = useNav();
    const pathname = usePathname();
    const router = useRouter();

    const isHome = pathname === "/";
    const currentActive = isHome ? activeTab : "lab";

    const isLab = pathname.startsWith("/playground");
    const pathSegments = pathname.split("/").filter(Boolean);

    const currentExperimentSlug = pathSegments[1];
    const experimentName = EXPERIMENT_NAMES[currentExperimentSlug];

    const navItems = [
        { id: 'home', label: 'Home', type: 'action' },
        { id: 'portfolio', label: 'Portfolio', type: 'action' },
        { id: 'lab', label: 'Lab', type: 'route', path: '/playground' },
        { id: 'contact', label: 'Contato', type: 'action' },
    ];

    const handleNavigation = (item: typeof navItems[0]) => {
        if (item.type === 'route' && item.path) {
            router.push(item.path);
            return;
        }
        if (!isHome) {
            setActiveTab(item.id);
            router.push("/");
        } else {
            setActiveTab(item.id);
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
            >
                <div className="flex items-center gap-1 p-1 rounded-full border border-white/10 bg-slate-950/50 backdrop-blur-md shadow-lg shadow-violet-500/10">
                    {navItems.map((item) => {
                        const isActive = currentActive === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item)}
                                className={cn(
                                    "relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full",
                                    isActive ? "text-white" : "text-slate-400 hover:text-white"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/10 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </motion.nav>

            <AnimatePresence>
                {isLab && experimentName && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: 0.2 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-40"
                    >
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-slate-900/40 backdrop-blur-sm text-xs font-mono tracking-wide">
                            <button
                                onClick={() => router.push('/playground')}
                                className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
                            >
                                <FlaskConical size={12} />
                                <span>LAB</span>
                            </button>

                            <ChevronRight size={10} className="text-slate-600" />

                            <span className="text-cyan-300 font-bold uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                                {experimentName}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};