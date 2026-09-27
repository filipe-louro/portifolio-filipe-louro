"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
    FlaskConical,
    Github,
    ChevronDown,
    Search,
    X,
    Dices,
    Check,
} from "lucide-react";
import { LAB_ITEMS, EXPERIMENT_MAP, LabCategory, LAB_CATEGORIES } from "./lab-data";
import { LabIcon } from "./lab-icon";

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<LabCategory>("all");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const switcherRef = useRef<HTMLDivElement>(null);
    const triggerBtnRef = useRef<HTMLButtonElement>(null);

    const pathSegments = pathname.split("/").filter(Boolean);
    const isPlayground = pathname.startsWith("/playground");
    const currentExperimentSlug = isPlayground ? pathSegments[1] : undefined;
    const currentExperiment = currentExperimentSlug ? EXPERIMENT_MAP[currentExperimentSlug] : undefined;

    // Filtered labs inside the switcher
    const filteredLabs = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return LAB_ITEMS.filter((lab) => {
            const matchesCategory =
                selectedCategory === "all" || lab.category === selectedCategory;
            if (!matchesCategory) return false;
            if (!q) return true;
            return (
                lab.title.toLowerCase().includes(q) ||
                lab.shortTitle.toLowerCase().includes(q) ||
                lab.slug.toLowerCase().includes(q) ||
                lab.description.toLowerCase().includes(q) ||
                lab.tags.some((t) => t.toLowerCase().includes(q))
            );
        });
    }, [searchQuery, selectedCategory]);

    // Handle "Surpreenda-me"
    const handleSurpriseMe = () => {
        const otherLabs = LAB_ITEMS.filter((l) => l.slug !== currentExperimentSlug);
        const randomLab = otherLabs[Math.floor(Math.random() * otherLabs.length)] || LAB_ITEMS[0];
        setIsSwitcherOpen(false);
        router.push(`/playground/${randomLab.slug}`);
    };

    // Close switcher on Escape or outside click
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isSwitcherOpen) {
                setIsSwitcherOpen(false);
            } else if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsSwitcherOpen((prev) => !prev);
            }
        };

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (triggerBtnRef.current?.contains(e.target as Node)) {
                return;
            }
            if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
                setIsSwitcherOpen(false);
            }
        };

        if (isSwitcherOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside, { passive: true });
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isSwitcherOpen]);

    const navigateToLab = (slug: string) => {
        setIsSwitcherOpen(false);
        router.push(`/playground/${slug}`);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
            >
                <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-xl shadow-cyan-950/20 text-sm font-mono tracking-wide">
                    {/* Home Brand button */}
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors font-medium text-xs sm:text-sm"
                        aria-label="Voltar ao índice do Lab"
                    >
                        <FlaskConical size={14} className="text-cyan-400" />
                        <span>LOURO LAB</span>
                    </button>

                    {/* Quick Switcher Trigger */}
                    <button
                        ref={triggerBtnRef}
                        onClick={() => setIsSwitcherOpen((prev) => !prev)}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all text-xs font-bold ${
                            isSwitcherOpen
                                ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                        }`}
                        aria-label="Abrir seletor rápido de experimentos"
                    >
                        {currentExperiment ? (
                            <span className="text-cyan-300 uppercase text-[11px] truncate max-w-[110px] sm:max-w-[150px]">
                                {currentExperiment.shortTitle}
                            </span>
                        ) : (
                            <span className="text-slate-400 uppercase text-[11px]">21 LABS</span>
                        )}
                        <ChevronDown size={12} className={`transition-transform duration-200 ${isSwitcherOpen ? "rotate-180 text-cyan-300" : "text-slate-400"}`} />
                    </button>

                    {/* Random Lab Quick Action */}
                    <button
                        onClick={handleSurpriseMe}
                        className="p-1 rounded-full text-slate-400 hover:text-violet-300 hover:bg-white/5 transition-colors"
                        title="Surpreenda-me (Experimento Aleatório)"
                        aria-label="Experimento Aleatório"
                    >
                        <Dices size={14} />
                    </button>

                    <span className="w-px h-3.5 bg-white/10 mx-0.5" />

                    {/* GitHub Link */}
                    <a
                        href="https://github.com/filipe-louro"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        aria-label="GitHub de Filipe Louro"
                    >
                        <Github size={15} />
                    </a>
                </div>
            </motion.nav>

            {/* Quick Switcher Drawer / Modal */}
            <AnimatePresence>
                {isSwitcherOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-md"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setIsSwitcherOpen(false);
                        }}
                    >
                        <motion.div
                            ref={switcherRef}
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.18 }}
                            className="w-full max-w-2xl bg-slate-900/90 border border-white/15 rounded-2xl shadow-2xl shadow-cyan-950/50 backdrop-blur-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            {/* Switcher Header & Search */}
                            <div className="p-4 border-b border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FlaskConical size={16} className="text-cyan-400" />
                                        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                                            Seletor Rápido de Experimentos
                                        </span>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                            {LAB_ITEMS.length} labs
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSurpriseMe}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 transition-all"
                                        >
                                            <Dices size={12} />
                                            <span>Aleatório</span>
                                        </button>
                                        <button
                                            onClick={() => setIsSwitcherOpen(false)}
                                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                            aria-label="Fechar seletor"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Live Search Input */}
                                <div className="relative">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Filtrar por nome, tecnologia ou conceito físico..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                {/* Category Tabs */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                    {LAB_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border ${
                                                selectedCategory === cat.id
                                                    ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                                                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Experiments List */}
                            <div className="overflow-y-auto p-3 space-y-1.5 max-h-[50vh]">
                                {filteredLabs.length > 0 ? (
                                    filteredLabs.map((lab) => {
                                        const isCurrent = lab.slug === currentExperimentSlug;
                                        return (
                                            <button
                                                key={lab.slug}
                                                onClick={() => navigateToLab(lab.slug)}
                                                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                                                    isCurrent
                                                        ? "bg-cyan-500/15 border-cyan-500/40 text-white"
                                                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15 text-slate-200"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 ${lab.accentBg}`}
                                                    >
                                                        <LabIcon name={lab.iconName} className={lab.accentText} size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs group-hover:text-cyan-300 transition-colors truncate">
                                                                {lab.title}
                                                            </span>
                                                            {isCurrent && (
                                                                <span className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                                                                    <Check size={10} /> ATUAL
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                            {lab.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                                    <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400">
                                                        {lab.tags[0]}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 text-slate-500 text-xs">
                                        Nenhum experimento encontrado para &quot;{searchQuery}&quot;
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-white/10 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <span>Pressione ESC para fechar</span>
                                <span>Ctrl+K / Cmd+K para abrir</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
