import { Metadata } from 'next';
import { MatrixScene } from './_components/MatrixScene';

export const metadata: Metadata = {
    title: 'Matrix Hyper Warp | Simulation',
    description: 'High performance 3D Matrix rain simulation using Canvas 2D.',
};

export default function MatrixPage() {
    return (
        <main className="w-full h-screen bg-black">
            <MatrixScene />
        </main>
    );
}