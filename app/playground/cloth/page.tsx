import { Metadata } from 'next';
import { ClothScene } from './_components/ClothScene';

export const metadata: Metadata = {
    title: 'Verlet Cloth Simulation | Playground',
    description: 'Simulação interativa de tecidos com integração Verlet, relaxamento de restrições e corte de malha.',
};

export default function ClothPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <ClothScene />
        </main>
    );
}
