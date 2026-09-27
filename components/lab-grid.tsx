"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
    ArrowRight,
    Sparkles,
    Search,
    X,
    Dices,
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { LAB_ITEMS, LAB_CATEGORIES, LabCategory } from './lab-data';
import { LabIcon } from './lab-icon';

export const LabGrid = () => {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<LabCategory>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut '/' to focus search input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement !== searchInputRef.current) {
                e.preventDefault();
                searchInputRef.current?.focus();
            } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                searchInputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filtered labs computation
    const filteredLabs = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return LAB_ITEMS.filter((lab) => {
            const matchesCategory =
                selectedCategory === 'all' || lab.category === selectedCategory;

            if (!matchesCategory) return false;
            if (!q) return true;

            const inTitle = lab.title.toLowerCase().includes(q);
            const inShort = lab.shortTitle.toLowerCase().includes(q);
            const inSlug = lab.slug.toLowerCase().includes(q);
            const inDesc = lab.description.toLowerCase().includes(q);
            const inTags = lab.tags.some((t) => t.toLowerCase().includes(q));
            const inCategory = lab.categoryLabel.toLowerCase().includes(q);

            return inTitle || inShort || inSlug || inDesc || inTags || inCategory;
        });
    }, [selectedCategory, searchQuery]);

    // Random lab chooser
    const handleSurpriseMe = () => {
        const randomIndex = Math.floor(Math.random() * LAB_ITEMS.length);
        const randomLab = LAB_ITEMS[randomIndex];
        router.push(`/playground/${randomLab.slug}`);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-violet-500/30 font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[550px] h-[550px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

            <div className="relative z-10 pt-24 px-4 sm:px-6 max-w-7xl mx-auto pb-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                                <Sparkles size={12} />
                                21 Experimentos Ativos
                            </span>
                            <span className="text-slate-500 text-xs font-mono">HUD 14.1 Standard</span>
                        </div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight"
                        >
                            Laboratório Criativo
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 max-w-2xl mt-2 text-sm sm:text-base leading-relaxed"
                        >
                            Física newtoniana e relativística, dinâmica de fluidos, autômatos celulares, manifolds caóticos e síntese de áudio puramente em Canvas 2D e WebGL 2.0.
                        </motion.p>
                    </div>

                    {/* Surpreenda-me Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="flex items-center gap-3 shrink-0"
                    >
                        <button
                            onClick={handleSurpriseMe}
                            aria-label="Abrir um experimento aleatório"
                            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-violet-950/30 active:scale-95"
                        >
                            <Dices size={16} className="text-violet-400 group-hover:rotate-180 transition-transform duration-500" />
                            <span>Surpreenda-me</span>
                        </button>
                    </motion.div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mb-8 space-y-4">
                    {/* Search Input */}
                    <div className="relative max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Search size={16} />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar por nome, física ou tecnologia (ex: WebGL, RK4, Vórtices)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-20 py-2.5 bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans"
                        />
                        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
                            {searchQuery ? (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                                    aria-label="Limpar busca"
                                >
                                    <X size={14} />
                                </button>
                            ) : (
                                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
                                    /
                                </kbd>
                            )}
                        </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {LAB_CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            const count =
                                cat.id === 'all'
                                    ? LAB_ITEMS.length
                                    : LAB_ITEMS.filter((item) => item.category === cat.id).length;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                                        isSelected
                                            ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-sm shadow-cyan-900/20'
                                            : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-900/70 hover:border-white/10'
                                    }`}
                                >
                                    <span>{cat.label}</span>
                                    <span
                                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                            isSelected
                                                ? 'bg-cyan-400/20 text-cyan-200'
                                                : 'bg-white/5 text-slate-500'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Result Counter & Search Status */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                        <span>
                            Exibindo {filteredLabs.length} de {LAB_ITEMS.length} experimentos
                        </span>
                        {(searchQuery || selectedCategory !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('all');
                                }}
                                className="text-cyan-400 hover:underline flex items-center gap-1"
                            >
                                <X size={12} /> Limpar filtros
                            </button>
                        )}
                    </div>
                </div>

                {/* Experiments Grid */}
                {filteredLabs.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredLabs.map((lab) => (
                                <motion.div
                                    key={lab.slug}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link href={`/playground/${lab.slug}`}>
                                        <SpotlightCard
                                            className={`h-72 p-6 flex flex-col justify-between ${lab.accentBorder} transition-all duration-300 cursor-pointer bg-slate-900/60 backdrop-blur-md hover:bg-slate-900/80 shadow-lg hover:shadow-2xl hover:-translate-y-1`}
                                        >
                                            <div>
                                                {/* Card Header: Icon & Category */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div
                                                        className={`w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 ${lab.accentBg}`}
                                                    >
                                                        <LabIcon name={lab.iconName} className={lab.accentText} size={22} />
                                                    </div>
                                                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400">
                                                        {lab.categoryLabel}
                                                    </span>
                                                </div>

                                                {/* Title & Description */}
                                                <h2 className="text-lg font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                                                    {lab.title}
                                                </h2>
                                                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                                                    {lab.description}
                                                </p>
                                            </div>

                                            {/* Bottom Badges & Action */}
                                            <div className="mt-4 pt-3 border-t border-white/5">
                                                {/* Tech Badges */}
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {lab.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Action Link */}
                                                <div className={`flex items-center ${lab.accentText} text-xs font-bold uppercase tracking-wider`}>
                                                    <span>{lab.action}</span>
                                                    <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </SpotlightCard>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-slate-900/30 backdrop-blur-sm">
                        <Search size={36} className="mx-auto text-slate-500 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-1">Nenhum experimento encontrado</h3>
                        <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
                            Não encontramos nenhum experimento correspondente à sua busca por &quot;{searchQuery}&quot;.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                            className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
