"use client";

import KeyboardDemo from '@/components/playground/keyboard-demo';
import { TemplateWrapper } from '@/components/template-wrapper';

export default function KeyboardPage() {
    return (
        <TemplateWrapper path="keyboard-playground">
            <div className="w-full h-screen pt-20 flex flex-col items-center justify-center overflow-hidden bg-slate-950">

                <div className="relative flex-1 w-full h-full flex items-center justify-center">
                    <KeyboardDemo />
                </div>
            </div>
        </TemplateWrapper>
    );
}