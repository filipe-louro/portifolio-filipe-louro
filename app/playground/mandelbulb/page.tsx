import { Metadata } from 'next';
import { MandelbulbScene } from './_components/MandelbulbScene';

export const metadata: Metadata = {
    title: 'Mandelbulb 3D | Playground',
    description: 'Raymarching volumétrico em WebGL 2.0 de um fractal 3D Mandelbulb com controle de órbita.',
};

export default function MandelbulbPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <MandelbulbScene />
        </main>
    );
}
