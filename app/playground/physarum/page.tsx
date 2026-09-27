import { Metadata } from 'next';
import { PhysarumScene } from './_components/PhysarumScene';

export const metadata: Metadata = {
    title: 'Physarum Transport Network | Playground',
    description: 'Bio-mimetismo inteligente de Physarum polycephalum simulando redes biológicas de transporte e auto-organização quimiotática.',
};

export default function PhysarumPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <PhysarumScene />
        </main>
    );
}
