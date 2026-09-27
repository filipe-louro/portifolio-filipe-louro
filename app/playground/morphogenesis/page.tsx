import { Metadata } from 'next';
import { MorphogenesisScene } from './_components/MorphogenesisScene';

export const metadata: Metadata = {
    title: 'Reaction-Diffusion Morphogenesis | Playground',
    description: 'Simulação de morfogênese química de Alan Turing via sistema Gray-Scott e shaders WebGL 2.0.',
};

export default function MorphogenesisPage() {
    return (
        <main className="w-full h-screen bg-slate-950">
            <MorphogenesisScene />
        </main>
    );
}
