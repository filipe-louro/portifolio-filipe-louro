import { Metadata } from 'next';
import { FluidScene } from './_components/FluidScene';

export const metadata: Metadata = {
    title: 'Fluid Simulation | Playground',
    description: 'Simulação de fluidos interativa em tempo real com WebGL2 (Stable Fluids / Navier-Stokes 2D).',
};

export default function FluidPage() {
    return (
        <main className="w-full h-screen bg-black">
            <FluidScene />
        </main>
    );
}
