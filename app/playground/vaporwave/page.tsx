import VaporwaveCityScene from '@/app/playground/vaporwave/_components/vaporwave-scene'
import { TemplateWrapper } from '@/components/template-wrapper';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vaporwave City | Playground",
    description: "A retro-futuristic generated city experience.",
};

export default function VaporwavePage() {
    return (
        <TemplateWrapper path="vaporwave-playground">
            <div className="w-full h-screen relative">
                <VaporwaveCityScene />
            </div>
        </TemplateWrapper>
    );
}