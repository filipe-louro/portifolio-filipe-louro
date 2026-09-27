import { Metadata } from 'next';
import { InkScene } from './_components/InkScene';

export const metadata: Metadata = {
    title: 'Ink in Water & Vortex Plumes | Playground',
    description: 'Advecção viscosa de pigmentos na água com instabilidades de Rayleigh-Taylor, vórtices de Kelvin-Helmholtz e mistura cromática.',
};

export default function InkPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <InkScene />
        </main>
    );
}
