import { Metadata } from 'next';
import { FerrofluidScene } from './_components/FerrofluidScene';

export const metadata: Metadata = {
    title: 'Ferrofluid Spikes & Magnetic Fields | Playground',
    description: 'Instabilidade magnética de Rosensweig em tempo real com espinhos cônicos, reflexão especular metálica e pólos magnéticos dinâmicos.',
};

export default function FerrofluidPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <FerrofluidScene />
        </main>
    );
}
