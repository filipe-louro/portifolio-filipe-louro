import { Metadata } from 'next';
import { BlackHoleScene } from './_components/BlackHoleScene';

export const metadata: Metadata = {
    title: 'Interstellar Black Hole | Simulation',
    description: 'Gargantua metric simulation using WebGL raymarching shaders.',
};

export default function BlackHolePage() {
    return (
        <main className="w-full h-screen bg-black">
            <BlackHoleScene />
        </main>
    );
}