import { Metadata } from 'next';
import { AttractorScene } from './_components/AttractorScene';

export const metadata: Metadata = {
    title: 'Strange Attractors & Chaotic Manifolds | Playground',
    description: 'Atratores estranhos tridimensionais (Lorenz, Aizawa, Rössler, Thomas, Halvorsen) com integração RK4 e órbita 3D interativa.',
};

export default function AttractorPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <AttractorScene />
        </main>
    );
}
