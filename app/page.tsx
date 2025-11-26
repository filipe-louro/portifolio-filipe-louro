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
        <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-violet-500/30 font-sans">

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
    );
}