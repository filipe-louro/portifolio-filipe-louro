import { Metadata } from 'next';
import { SandpileScene } from './_components/SandpileScene';

export const metadata: Metadata = {
    title: 'Abelian Sandpile & Avalanches | Playground',
    description: 'Simulação de auto-organização crítica, dinâmica granular em tempo real, avalanches em lei de potência e fractais abelianos.',
};

export default function SandpilePage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <SandpileScene />
        </main>
    );
}
