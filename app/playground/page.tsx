"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Keyboard, ArrowRight } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card'; // Reusando seu componente

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen pt-24 px-6 max-w-6xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-white mb-8"
            >
                Lab & Playground
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card do Keyboard */}
                <Link href="/playground/keyboard">
                    <SpotlightCard className="h-64 p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-colors cursor-pointer">
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

                {/* Placeholder para o próximo (Neon, etc) */}
                <div className="h-64 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-slate-500 border-dashed">
                    Em breve...
                </div>
            </div>
        </div>
    );
}