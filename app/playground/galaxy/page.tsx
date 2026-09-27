import { Metadata } from 'next';
import { GalaxyScene } from './_components/GalaxyScene';

export const metadata: Metadata = {
    title: 'N-Body Galactic Collision & Dark Matter | Playground',
    description: 'Simulação gravitacional N-corpos com integração simplética leapfrog, caudas de maré intergalácticas e halo de matéria escura.',
};

export default function GalaxyPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <GalaxyScene />
        </main>
    );
}
