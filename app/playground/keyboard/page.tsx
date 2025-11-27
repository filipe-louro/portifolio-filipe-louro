import { TemplateWrapper } from '@/components/template-wrapper';
import { Metadata } from 'next';
import KeyboardGrid from '@/app/playground/keyboard/_components/KeyboardGrid';

export const metadata: Metadata = {
    title: 'RGB Virtual Keyboard | Portfolio',
    description: 'Interactive CSS/JS mechanical keyboard simulation with WebGL-like performance.',
};

export default function KeyboardPage() {
    return (
        <TemplateWrapper path="keyboard-playground">
            <div className="w-full h-screen pt-20 flex flex-col items-center justify-center overflow-hidden bg-slate-950">

                <div className="relative flex-1 w-full h-full flex items-center justify-center">
                    <KeyboardGrid />
                </div>
            </div>
        </TemplateWrapper>
    );
}