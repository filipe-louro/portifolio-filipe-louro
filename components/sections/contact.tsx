"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {Send, CheckCircle2, Loader2, Mail, MapPin, Phone} from 'lucide-react'

const PROJECT_TYPES = ["web", "mobile", "landing"] as const;

const formSchema = z.object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("Email inválido"),
    projectType: z.enum(PROJECT_TYPES, {
        message: "Selecione um tipo de projeto",
    }),
    message: z.string().min(10, "Conte-nos um pouco mais sobre o projeto"),
});

type FormValues = z.infer<typeof formSchema>;

export const ContactForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(formSchema)
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("Dados validados e enviados:", data);
        setIsSubmitting(false);
        setIsSuccess(true);
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                {/* Left Column: Info & Context */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="pt-10"
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Let's build something <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">extraordinary.</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-12 max-w-lg">
                        Have a project in mind? Whether it's a complex SaaS platform, an e-commerce solution, or a high-performance web app, I'm ready to help you architect it. [cite: 41, 48]
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-violet-400">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Email</h4>
                                <a href="mailto:filipe-louro@hotmail.com" className="text-slate-400 hover:text-white transition-colors">filipe-louro@hotmail.com [cite: 2]</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-cyan-400">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Location</h4>
                                <p className="text-slate-400">Based in Pelotas, Brazil. Open to remote work worldwide. [cite: 16]</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-emerald-400">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Phone</h4>
                                <p className="text-slate-400">+55 53 98109-8683 [cite: 2]</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl blur opacity-20" />

                    <div className="relative bg-slate-950 border border-slate-800 p-8 md:p-10 rounded-2xl shadow-2xl">
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-400">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Mensagem Enviada!</h3>
                                <p className="text-slate-400">Em breve entrarei em contato.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Name</label>
                                        <input
                                            {...register("name")}
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                                            placeholder="John Doe"
                                        />
                                        {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Email</label>
                                        <input
                                            {...register("email")}
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Tipo de Projeto</label>
                                    <select
                                        {...register("projectType")}
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all appearance-none"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="web">Web Application</option>
                                        <option value="mobile">Mobile App</option>
                                        <option value="landing">Landing Page</option>
                                    </select>
                                    {errors.projectType && <span className="text-xs text-red-400">{errors.projectType.message}</span>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Detalhes</label>
                                    <textarea
                                        {...register("message")}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600 resize-none"
                                        placeholder="Conte um pouco sobre o que você precisa..."
                                    />
                                    {errors.message && <span className="text-xs text-red-400">{errors.message.message}</span>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-white text-slate-950 rounded-lg font-bold tracking-wide hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>Send Message <Send size={18} /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};