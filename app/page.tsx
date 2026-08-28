import { Metadata } from 'next';
import { LabGrid } from '@/components/lab-grid';

export const metadata: Metadata = {
    title: 'Filipe Louro — Animation Lab',
    description: 'Laboratório de animações e simulações interativas: WebGL 2.0, raymarching, fluidos em GPU e física de partículas, tudo feito à mão.',
};

export default function Home() {
    return <LabGrid />;
}
