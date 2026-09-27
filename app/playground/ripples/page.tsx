import { Metadata } from 'next';
import { RipplesScene } from './_components/RipplesScene';

export const metadata: Metadata = {
    title: 'Wave Ripple Tank & Optical Caustics | Playground',
    description: 'Equação de onda 2D em tempo real com difração de fenda dupla, cáusticas ópticas subaquáticas e efeito Doppler.',
};

export default function RipplesPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <RipplesScene />
        </main>
    );
}
