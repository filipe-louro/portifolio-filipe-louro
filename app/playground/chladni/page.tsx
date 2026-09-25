import { Metadata } from 'next';
import { ChladniScene } from './_components/ChladniScene';

export const metadata: Metadata = {
    title: 'Chladni Patterns | Playground',
    description: 'Simulação acústica de placas de Chladni com ondas estacionárias 2D e síntese harmônica.',
};

export default function ChladniPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <ChladniScene />
        </main>
    );
}
