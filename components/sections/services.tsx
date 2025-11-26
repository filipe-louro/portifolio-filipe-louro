"use client";

import { motion } from "framer-motion";
import { Monitor, Smartphone, MousePointer2, ArrowRight } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export const ServicesSection = () => {
    const services = [
        {
            icon: <Monitor className="text-cyan-400" size={32} />,
            title: "Web Applications",
            desc: "SaaS escaláveis e dashboards complexos construídos com Next.js 16 e arquitetura server-first."
        },
        {
            icon: <Smartphone className="text-violet-400" size={32} />,
            title: "Mobile First",
            desc: "Sites responsivos e PWAs que oferecem experiência nativa diretamente no navegador."
        },
        {
            icon: <MousePointer2 className="text-emerald-400" size={32} />,
            title: "Landing Pages",
            desc: "Páginas de alta conversão com animações scroll-driven focadas em retenção e vendas."
        }
    ];

    return (
        <section className="py-32 px-6 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16"
            >
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Serviços Premium</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map((service, index) => (
                    <SpotlightCard key={index} className="bg-slate-900/40 p-8 h-full flex flex-col justify-between">
                        <div>
                            <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit border border-white/5">
                                {service.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{service.desc}</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center text-sm text-white/60 group-hover:text-white transition-colors">
                            Saiba mais <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </SpotlightCard>
                ))}
            </div>
        </section>
    );
};