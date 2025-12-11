"use client";

import { AnimatePresence } from "framer-motion";
import { useNav } from "@/components/providers/nav-provider";
import { TemplateWrapper } from "@/components/template-wrapper";
import { HeroSection } from "@/components/sections/hero";
import { ServicesSection } from "@/components/sections/services";
import { ContactForm } from "@/components/sections/contact";

export default function Home() {
    const { activeTab, setActiveTab } = useNav();

    return (
        <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-violet-500/30 font-sans relative overflow-hidden">

            {/* --- GLOBAL GRID BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                {/* Radial Mask to fade out edges (optional, keeps focus in center) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#0000,transparent)]" />
            </div>

            <div className="relative z-10">
                <AnimatePresence mode='wait'>
                    {activeTab === 'home' && (
                        <TemplateWrapper key="home" path="home">
                            <HeroSection setActiveTab={setActiveTab} />
                        </TemplateWrapper>
                    )}

                    {activeTab === 'portfolio' && (
                        <TemplateWrapper key="portfolio" path="portfolio">
                            <div className="pt-20 min-h-screen">
                                <ServicesSection />
                            </div>
                        </TemplateWrapper>
                    )}

                    {activeTab === 'contact' && (
                        <TemplateWrapper key="contact" path="contact">
                            <ContactForm />
                        </TemplateWrapper>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}