"use client";

import { motion } from "framer-motion";
import { Server, Layout, Database, ArrowRight, Code2, Globe, Cpu } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import Link from "next/link"; // Import Link

const services = [
    {
        icon: <Layout className="text-cyan-400" size={32} />,
        title: "Frontend Engineering",
        desc: "Responsive, accessible, and performant interfaces using Next.js, React, and Tailwind CSS. Focus on Core Web Vitals and UX.",
        tags: ["Next.js", "React", "Tailwind", "Framer Motion"],
        link: "/projects/frontend" // Add link property
    },
    {
        icon: <Server className="text-violet-400" size={32} />,
        title: "Backend Architecture",
        desc: "Robust APIs and microservices. Experience with Laravel multi-tenant systems and Node.js for real-time applications.",
        tags: ["Laravel", "Node.js", "PostgreSQL", "Redis"],
        link: "/projects/backend" // Add link property
    },
    {
        icon: <Database className="text-emerald-400" size={32} />,
        title: "E-commerce & SaaS",
        desc: "End-to-end development of scalable platforms. From Magento integrations to custom payment and shipping logic.",
        tags: ["Magento", "SaaS", "Stripe", "Docker"],
        link: "/projects/saas" // Add link property
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const ServicesSection = () => {
    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-20 text-center"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Technical Expertise</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Comprehensive solutions from database design to frontend interactivity.
                </p>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {services.map((service, index) => (
                    <motion.div key={index} variants={itemVariants} className="h-full">
                        <SpotlightCard className="bg-slate-900/50 border-slate-800 p-8 h-full flex flex-col justify-between group hover:border-violet-500/30 transition-colors duration-500">
                            <div>
                                <div className="mb-6 p-4 bg-slate-950 rounded-2xl w-fit border border-slate-800 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-violet-200 transition-colors">{service.title}</h3>
                                <p className="text-slate-400 leading-relaxed mb-6">{service.desc}</p>
                            </div>

                            <div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {service.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Use Link component here */}
                                <Link href={service.link} className="pt-6 border-t border-slate-800 flex items-center text-sm font-medium text-violet-400 group-hover:text-violet-300 transition-colors cursor-pointer">
                                    Explore Projects <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </SpotlightCard>
                    </motion.div>
                ))}
            </motion.div>

            {/* "Floating" Code/App Preview Section (Inspired by your barbershop example) */}
            <div className="mt-32 relative flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="md:w-1/2">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-3xl font-bold text-white mb-4">
                            Beyond Code: <span className="text-cyan-400">DevOps & Automation</span>
                        </h3>
                        <p className="text-slate-400 text-lg leading-relaxed mb-6">
                            I don&#39;t just write code; I build infrastructure. From setting up CI/CD pipelines to managing Linux VPS environments with Redis and Elasticsearch. [cite_start]I ensure your applications are not just functional, but scalable and resilient. [cite: 36, 40]
                        </p>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex items-center gap-3">
                                <Cpu size={20} className="text-violet-400" />
                                [cite_start]<span>Linux Server Administration & VPS Management [cite: 7, 40]</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Globe size={20} className="text-cyan-400" />
                                [cite_start]<span>CI/CD Pipelines & Dockerized Environments [cite: 57]</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Code2 size={20} className="text-emerald-400" />
                                [cite_start]<span>API Security & Performance Tuning [cite: 59]</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>

                {/* Animated "Terminal" Window */}
                <motion.div
                    className="md:w-1/2 relative perspective-1000"
                    initial={{ opacity: 0, x: 50, rotateY: -10 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="relative z-10 bg-[#0d1117] rounded-xl border border-slate-700 shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                        {/* Terminal Header */}
                        <div className="bg-slate-800/50 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            <span className="ml-2 text-xs text-slate-400 font-mono">filipe@dev-server:~</span>
                        </div>
                        {/* Terminal Content */}
                        <div className="p-6 font-mono text-sm">
                            <div className="flex gap-2 mb-2">
                                <span className="text-green-400">➜</span>
                                <span className="text-cyan-300">~/projects</span>
                                <span className="text-slate-300">$ docker-compose up -d</span>
                            </div>
                            <div className="space-y-1 text-slate-400 mb-4">
                                <p>[+] Running 4/4</p>
                                <p> ✔ Container api-gateway <span className="text-green-400">Started</span></p>
                                <p> ✔ Container database <span className="text-green-400">Started</span></p>
                                <p> ✔ Container cache-redis <span className="text-green-400">Started</span></p>
                                <p> ✔ Container frontend <span className="text-green-400">Started</span></p>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-green-400">➜</span>
                                <span className="text-cyan-300">~/projects</span>
                                <span className="text-slate-300 animate-pulse">_</span>
                            </div>
                        </div>
                        {/* Abstract Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-violet-500/20 blur-[80px] pointer-events-none" />
                    </div>
                    {/* Decorative Elements behind */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -z-10" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl -z-10" />
                </motion.div>
            </div>
        </section>
    );
};