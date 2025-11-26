"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center p-6 pt-24">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Vamos construir algo <span className="text-violet-400">épico</span>?
                    </h2>
                    <p className="text-slate-400 text-lg mb-8">
                        Preencha o formulário e receba uma proposta detalhada em até 24h.
                        Seu próximo nível começa aqui.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <Send size={20} />
                            </div>
                            <span>contato@developer.com</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

                    <div className="relative bg-slate-950/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
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
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Nome</label>
                                    <input
                                        {...register("name")}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                                        placeholder="Seu nome"
                                    />
                                    {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-400">Email</label>
                                    <input
                                        {...register("email")}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                                        placeholder="seu@email.com"
                                    />
                                    {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
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
                                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg text-white font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Enviar Mensagem"}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};