import { Metadata } from 'next';
import NeonSign from './_components/NeonSign';

export const metadata: Metadata = {
    title: 'Neon Sign Generator | Portfolio',
    description: 'Interactive CSS3 Neon effect generator with customization.',
};

export default function NeonPage() {
    return (
        <main className="w-full h-screen bg-black">
            <NeonSign />
        </main>
    );
}