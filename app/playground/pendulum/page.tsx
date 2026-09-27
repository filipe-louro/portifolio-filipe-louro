import { Metadata } from 'next';
import { PendulumScene } from './_components/PendulumScene';

export const metadata: Metadata = {
    title: 'Chaotic Double Pendulum | Playground',
    description: 'Simulação interativa de pêndulos duplos e triplos com dinâmica hamiltoniana, integração RK4 e divergência de Lyapunov.',
};

export default function PendulumPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <PendulumScene />
        </main>
    );
}
