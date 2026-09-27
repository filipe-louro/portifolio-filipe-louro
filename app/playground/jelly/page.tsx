import { Metadata } from 'next';
import { JellyScene } from './_components/JellyScene';

export const metadata: Metadata = {
    title: 'Soft-Body Jelly Physics | Playground',
    description: 'Simulação interativa de corpos moles com conservação volumétrica, pressão hidrostática e deformação elástica.',
};

export default function JellyPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <JellyScene />
        </main>
    );
}
