
import { Metadata } from 'next';
import { ExplodingCanvas } from './_components/exploding-canvas';
import { TemplateWrapper } from '@/components/template-wrapper';

export const metadata: Metadata = {
    title: 'Exploding Text | Playground',
    description: 'Experimento interativo com Canvas API e física de partículas.',
};

export default function ExplosionPage() {
    return (
        <TemplateWrapper path="explosion-playground">
            <div className="w-full h-screen relative">
                <ExplodingCanvas />
            </div>
        </TemplateWrapper>
    );
}