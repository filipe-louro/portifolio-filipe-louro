import { Metadata } from 'next';
import OrbitScene from './_components/OrbitScene';

export const metadata: Metadata = {
    title: 'Orbital Field Simulator | Portfolio',
    description: 'Interactive particle physics simulation using Canvas API.',
};

export default function OrbitPage() {
    return (
        <main className="w-full h-screen bg-black">
            <OrbitScene />
        </main>
    );
}